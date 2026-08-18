import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

type Application = {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  status: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE';
  route?: string | null;
  url?: string | null;
  owner?: string | null;
};

const statusLabel: Record<Application['status'], string> = {
  ONLINE: 'En ligne',
  MAINTENANCE: 'Maintenance',
  OFFLINE: 'Hors ligne',
};

export default function AccessPage() {
  const navigate = useNavigate();
  const { data = [], isLoading } = useQuery({ queryKey: ['applications'], queryFn: api.applications });
  const apps = data as Application[];

  if (isLoading) return <div className="text-axiome-muted">Chargement du catalogue d’accès…</div>;

  const openApp = (app: Application) => {
    if (app.status !== 'ONLINE') return;
    if (app.route) {
      navigate(app.route);
      return;
    }
    if (app.url) {
      window.open(app.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Accès applications RTN</h1>
        <p className="text-axiome-muted">Ouvrez AXIOME et les applications de l’usine Enfidha depuis un seul portail.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {apps.map((app) => (
          <div key={app.id} className="card flex flex-col justify-between">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-wider text-axiome-cyan">{app.category}</span>
                <span
                  className={`badge ${
                    app.status === 'ONLINE'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : app.status === 'MAINTENANCE'
                        ? 'bg-axiome-gold/15 text-axiome-gold'
                        : 'bg-white/10 text-axiome-muted'
                  }`}
                >
                  {statusLabel[app.status]}
                </span>
              </div>
              <div className="text-lg font-semibold">{app.name}</div>
              <p className="mt-1 text-sm text-axiome-muted">{app.description}</p>
              {app.owner && <p className="mt-2 text-xs text-axiome-muted">Responsable : {app.owner}</p>}
            </div>
            <button
              className="btn-primary mt-4 w-fit"
              disabled={app.status !== 'ONLINE' || (!app.route && !app.url)}
              onClick={() => openApp(app)}
            >
              {app.route || app.url ? 'Ouvrir' : 'Demander l’accès'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
