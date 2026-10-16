import { createClient } from '@supabase/supabase-js';
import LeadsTable from './leads-table';

// ── Disable caching so new leads show up instantly ────────────────────────────
export const dynamic = 'force-dynamic';

// Supabase Connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

        {/* ── Interactive Leads Table with Instant Delete ── */}
        <LeadsTable initialLeads={leads ?? []} hasError={Boolean(error)} />

      </main>
    </div>
  );
}
