import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function TeamPage() {
  const entities = useQuery({ queryKey: ['entities'], queryFn: api.entities });
  const users = useQuery({ queryKey: ['users'], queryFn: api.users });

  if (entities.isLoading || users.isLoading) {
    return <div className="text-axiome-muted">Chargement de l’équipe RTN…</div>;
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Équipe et sites</h1>
      <p className="mb-6 text-axiome-muted">Rosenberger Tunisia — 12 000 m², Enfidha.</p>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {(
          entities.data as Array<{
            id: string;
            name: string;
            country: string;
            code: string;
            sites?: Array<{ id: string; name: string; code: string }>;
          }>
        )?.map((entity) => (
          <div key={entity.id} className="card md:col-span-2">
            <div className="text-lg font-semibold">{entity.name}</div>
            <div className="text-sm text-axiome-muted">
              {entity.country} · {entity.code}
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {entity.sites?.map((site) => (
                <div key={site.id} className="rounded-lg border border-axiome-border px-3 py-2 text-sm">
                  <div className="font-medium">{site.name}</div>
                  <div className="text-xs text-axiome-cyan">{site.code}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-semibold">Comptes AXIOME</h2>
      <div className="space-y-3">
        {(
          users.data as Array<{
            id: string;
            fullName: string;
            email: string;
            status: string;
            userRoles?: Array<{ role: { name: string } }>;
          }>
        )?.map((u) => (
          <div key={u.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{u.fullName}</div>
              <div className="text-xs text-axiome-muted">{u.email}</div>
            </div>
            <span className="text-xs text-axiome-cyan">{u.userRoles?.[0]?.role.name ?? u.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
