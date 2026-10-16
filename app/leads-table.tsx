'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoPerson = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
  </svg>
);
const IcoBriefcase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IcoPin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IcoTag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/>
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>
  </svg>
);
const IcoUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  type StyleEntry = { bg: string; text: string; dot: string };
  const map: Record<string, StyleEntry> = {
    'New Lead':  { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
    'Messaged':  { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
    'Replied':   { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    'Converted': { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-500'  },
  };
  const s: StyleEntry = map[status] ?? { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export interface Lead {
  id: string | number;
  name: string;
  headline?: string;
  location?: string;
  linkedin_url?: string;
  status?: string;
  created_at?: string;
}

export default function LeadsTable({
  initialLeads,
  hasError,
}: {
  initialLeads: Lead[];
  hasError?: boolean;
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const router = useRouter();

  // 1. Sync internal state whenever server sends updated initialLeads
  useEffect(() => {
    if (!deletingId) {
      setLeads(initialLeads);
    }
  }, [initialLeads, deletingId]);

  // 2. Client-side polling mechanism: refresh data every 3 seconds & on tab focus
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if tab is currently visible to save bandwidth
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        router.refresh();
      }
    }, 3000);

    const handleFocus = () => {
      router.refresh();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, [router]);

  async function handleDelete(id: string | number) {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    setDeletingId(id);
    const previousLeads = leads;

    // ⚡ Optimistic UI Update: Instantly remove lead from table
    setLeads((prev) => prev.filter((lead) => lead.id !== id));

    try {
      const res = await fetch(`/api/leads?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete lead from database');
      }

      // Re-sync server-side data in background
      router.refresh();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Error deleting lead: ' + (err.message || 'Please try again.'));
      // Rollback UI if delete failed
      setLeads(previousLeads);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">All Leads</h2>
            <p className="mt-0.5 text-xs text-gray-400">{leads.length} contacts saved</p>
          </div>
          {/* Live Sync badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>
        {hasError && (
          <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 ring-1 ring-red-200">
            ⚠ Could not load initial data
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <th className="px-6 py-3">
                <span className="flex items-center gap-1.5"><IcoPerson /> Name</span>
              </th>
              <th className="px-6 py-3">
                <span className="flex items-center gap-1.5"><IcoBriefcase /> Headline</span>
              </th>
              <th className="hidden px-6 py-3 md:table-cell">
                <span className="flex items-center gap-1.5"><IcoPin /> Location</span>
              </th>
              <th className="px-6 py-3">
                <span className="flex items-center gap-1.5"><IcoTag /> Status</span>
              </th>
              <th className="px-6 py-3 text-right">
                <span>Action</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads && leads.length > 0 ? (
              leads.map((lead) => (
                <tr key={lead.id} className="group transition-colors duration-150 hover:bg-blue-50/30">
                  {/* Name + avatar + LinkedIn */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 text-xs font-bold text-blue-700">
                        {(lead.name as string)?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {lead.name}
                        </p>
                        {lead.linkedin_url && (
                          <a
                            href={lead.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                          >
                            LinkedIn ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Headline */}
                  <td className="max-w-xs px-6 py-4">
                    <p className="truncate text-gray-500">{lead.headline || '—'}</p>
                  </td>
                  {/* Location */}
                  <td className="hidden px-6 py-4 md:table-cell">
                    <span className="text-gray-500">{lead.location || '—'}</span>
                  </td>
                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={lead.status ?? 'New Lead'} />
                  </td>
                  {/* Delete Action Button */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(lead.id)}
                      disabled={deletingId === lead.id}
                      title="Delete Lead"
                      aria-label="Delete Lead"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all duration-150 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
                    >
                      {deletingId === lead.id ? (
                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                      ) : (
                        <IcoTrash />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="mx-auto flex max-w-xs flex-col items-center gap-3 text-gray-400">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                      <IcoUsers />
                    </div>
                    <p className="font-medium text-gray-500">No leads yet</p>
                    <p className="text-xs">
                      Save leads from LinkedIn using the extension and they&apos;ll appear here automatically.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {leads && leads.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3 text-xs text-gray-400">
          Showing {leads.length} lead{leads.length !== 1 ? 's' : ''} · Sorted by newest first · Auto-refreshes every 3s
        </div>
      )}
    </div>
  );
}
