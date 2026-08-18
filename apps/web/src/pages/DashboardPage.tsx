import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

function KpiCard({ label, value, suffix = '' }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="card">
      <div className="text-sm text-axiome-muted">{label}</div>
      <div className="mt-2 text-3xl font-bold text-white">
        {value}
        {suffix}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['overview'], queryFn: api.overview });

  if (isLoading) return <div className="text-axiome-muted">Ouverture du cockpit RTN…</div>;

  const kpis = (data?.kpis ?? {}) as Record<string, number>;

  return (
    <div>
      <header className="mb-6">
        <div className="text-xs uppercase tracking-[0.2em] text-axiome-cyan">Rosenberger Tunisia</div>
        <h1 className="text-2xl font-bold">Cockpit AXIOME</h1>
        <p className="text-axiome-muted">
          {String(data?.plant ?? 'RTN')} · {String(data?.site ?? 'Enfidha')}
        </p>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <KpiCard label="Effectif usine" value={(data?.headcount as number) ?? '—'} />
        <KpiCard label="OEE" value={(data?.oee as number) ?? '—'} suffix="%" />
        <KpiCard label="OTD" value={(data?.onTimeDelivery as number) ?? '—'} suffix="%" />
        <KpiCard label="Rendement qualité" value={(data?.qualityYield as number) ?? '—'} suffix="%" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-semibold">Activité du jour</h2>
          <ul className="space-y-2 text-sm text-axiome-muted">
            <li>
              Applications en ligne : <span className="text-white">{kpis.applicationsOnline ?? 0}</span>
            </li>
            <li>
              OF en cours : <span className="text-white">{kpis.workOrdersInProgress ?? 0}</span> / {kpis.workOrders ?? 0}
            </li>
            <li>
              NCR ouvertes : <span className="text-white">{kpis.openNcrs ?? 0}</span>
            </li>
            <li>
              Documents GED : <span className="text-white">{kpis.documents ?? 0}</span>
            </li>
            <li>
              Utilisateurs actifs : <span className="text-white">{kpis.activeUsers ?? 0}</span>
            </li>
          </ul>
        </div>
        <div className="card">
          <h2 className="mb-3 font-semibold">Ouvrir un module</h2>
          <p className="mb-4 text-sm leading-relaxed text-axiome-muted">
            AXIOME est le portail d’accès unique de l’usine RTN. La production, la qualité et la GED s’ouvrent ici ;
            SAP, Intervalid et OTTO restent des applications du catalogue.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-primary" to="/acces">
              Accès applications
            </Link>
            <Link className="rounded-lg border border-axiome-border px-4 py-2 text-sm hover:border-axiome-cyan" to="/production">
              Production
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
