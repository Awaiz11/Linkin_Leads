import { createClient } from '@supabase/supabase-js';

// Supabase Connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const instant = false;

// ── SVG Icons (inline — no external package) ─────────────────────────────────
const IcoUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoZap = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IcoCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
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

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, icon }: {
  label: string; value: number; sub: string; accent: string; icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 flex gap-4 items-start hover:shadow-md transition-shadow duration-200">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
        <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function Dashboard() {
  // Database se leads fetch karna
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  // Derived stats
  const total   = leads?.length ?? 0;
  const replied = leads?.filter((l) => l.status === 'Replied' || l.status === 'Converted').length ?? 0;
  const recent  = leads?.filter((l) => {
    if (!l.created_at) return false;
    return Date.now() - new Date(l.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 font-sans">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-10 border-b border-gray-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 shadow-sm">
              <span className="text-sm font-bold text-white">LF</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">LeadFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
              Dashboard
            </span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 ring-2 ring-white shadow-sm" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* ── Heading ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Lead Pipeline</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your LinkedIn prospects in one place.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Leads"  value={total}   sub="All time captures"    accent="bg-blue-100 text-blue-600"    icon={<IcoUsers />} />
          <StatCard label="This Week"    value={recent}  sub="Added in last 7 days" accent="bg-violet-100 text-violet-600" icon={<IcoZap />}   />
          <StatCard label="Engaged"      value={replied} sub="Replied or converted"  accent="bg-emerald-100 text-emerald-600" icon={<IcoCheck />} />
        </div>

        {/* ── Table card ── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">

          {/* Card header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">All Leads</h2>
              <p className="mt-0.5 text-xs text-gray-400">{total} contacts saved</p>
            </div>
            {error && (
              <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 ring-1 ring-red-200">
                ⚠ Could not load data
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads && leads.length > 0
                  ? leads.map((lead) => (
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
                                <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer"
                                   className="text-xs text-blue-500 hover:underline">
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
                      </tr>
                    ))
                  : (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center">
                          <div className="mx-auto flex max-w-xs flex-col items-center gap-3 text-gray-400">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                              <IcoUsers />
                            </div>
                            <p className="font-medium text-gray-500">No leads yet</p>
                            <p className="text-xs">
                              Save leads from LinkedIn using the extension and they&apos;ll appear here.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
                }
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {leads && leads.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3 text-xs text-gray-400">
              Showing {total} lead{total !== 1 ? 's' : ''} · Sorted by newest first
            </div>
          )}
        </div>
      </main>
    </div>
  );
}