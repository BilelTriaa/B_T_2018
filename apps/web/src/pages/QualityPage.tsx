import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

type Ncr = {
  id: string;
  number: string;
  title: string;
  line?: string | null;
  severity: string;
  status: string;
};

const severityClass: Record<string, string> = {
  MINOR: 'bg-white/10 text-axiome-muted',
  MAJOR: 'bg-axiome-gold/15 text-axiome-gold',
  CRITICAL: 'bg-axiome-red/20 text-axiome-red',
};

const statusLabel: Record<string, string> = {
  OPEN: 'Ouverte',
  IN_PROGRESS: 'En cours',
  CLOSED: 'Clôturée',
};

export default function QualityPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['ncrs'], queryFn: api.ncrs });
  const rows = data as Ncr[];

  if (isLoading) return <div className="text-axiome-muted">Chargement qualité…</div>;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Qualité / NCR</h1>
      <p className="mb-6 text-axiome-muted">Non-conformités de l’usine RTN — suivi atelier et QC.</p>
      <div className="space-y-3">
        {rows.map((ncr) => (
          <div key={ncr.id} className="card flex items-start justify-between gap-4">
            <div>
              <div className="font-medium">
                {ncr.number} {ncr.line ? `· ${ncr.line}` : ''}
              </div>
              <div className="text-sm text-axiome-muted">{ncr.title}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`badge ${severityClass[ncr.severity] ?? 'bg-white/10'}`}>{ncr.severity}</span>
              <span className="text-xs text-axiome-muted">{statusLabel[ncr.status] ?? ncr.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
