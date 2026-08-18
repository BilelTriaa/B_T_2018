import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

function KpiCard({ label, value, suffix = '' }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="card">
      <div className="text-sm text-otto-gray">{label}</div>
      <div className="mt-2 text-3xl font-bold text-otto-cyan">{value}{suffix}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['overview'], queryFn: api.overview });

  if (isLoading) return <div className="text-otto-gray">Loading dashboard…</div>;

  const kpis = (data?.kpis ?? {}) as Record<string, number>;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Group Overview</h1>
        <p className="text-otto-gray">{String(data?.tagline ?? '')}</p>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <KpiCard label="Security Score" value={data?.securityScore as number ?? '—'} suffix="%" />
        <KpiCard label="Compliance" value={data?.compliance as number ?? '—'} suffix="%" />
        <KpiCard label="Open Risks" value={data?.openRisks as number ?? '—'} />
        <KpiCard label="Maturity" value={data?.maturity as number ?? '—'} suffix="%" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-semibold">Platform KPIs (MVP)</h2>
          <ul className="space-y-2 text-sm text-otto-gray">
            <li>Entities: <span className="text-white">{kpis.entities ?? 0}</span></li>
            <li>Active users: <span className="text-white">{kpis.activeUsers ?? 0}</span></li>
            <li>Documents: <span className="text-white">{kpis.documents ?? 0}</span></li>
            <li>Audit events (7d): <span className="text-white">{kpis.auditEventsLast7Days ?? 0}</span></li>
          </ul>
        </div>
        <div className="card">
          <h2 className="mb-3 font-semibold">Migration Path</h2>
          <p className="text-sm leading-relaxed text-otto-gray">
            FRAGMENTED SECURITY → ONE GOVERNANCE → ONE ISMS → ONE PATH → UNIFIED SECURITY STANDARD
          </p>
          <p className="mt-3 text-xs text-otto-cyan">
            Hannibal ISMS data (93 controls, 236 tasks) → Phase 2 migration
          </p>
        </div>
      </div>
    </div>
  );
}
