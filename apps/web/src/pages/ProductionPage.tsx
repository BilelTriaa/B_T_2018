import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

type WorkOrder = {
  id: string;
  number: string;
  line: string;
  product: string;
  quantity: number;
  completed: number;
  status: string;
  shift?: string | null;
};

const statusLabel: Record<string, string> = {
  PLANNED: 'Planifié',
  IN_PROGRESS: 'En cours',
  QC_HOLD: 'Attente QC',
  COMPLETED: 'Terminé',
};

export default function ProductionPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['work-orders'], queryFn: api.workOrders });
  const rows = data as WorkOrder[];

  if (isLoading) return <div className="text-axiome-muted">Chargement des OF…</div>;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Production RTN</h1>
      <p className="mb-6 text-axiome-muted">Lignes FAKRA, RosenbergerHSD® et H-MTD® — usine Enfidha.</p>
      <div className="space-y-3">
        {rows.map((wo) => {
          const pct = wo.quantity ? Math.round((wo.completed / wo.quantity) * 100) : 0;
          return (
            <div key={wo.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">
                    {wo.number} · {wo.line}
                  </div>
                  <div className="text-sm text-axiome-muted">{wo.product}</div>
                </div>
                <span className="badge bg-axiome-cyan/15 text-axiome-cyan">{statusLabel[wo.status] ?? wo.status}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-axiome-red" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 text-xs text-axiome-muted">
                {wo.completed.toLocaleString('fr-TN')} / {wo.quantity.toLocaleString('fr-TN')} · {pct}% · {wo.shift}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
