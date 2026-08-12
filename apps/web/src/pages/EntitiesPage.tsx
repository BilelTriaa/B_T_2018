import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function EntitiesPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['entities'], queryFn: api.entities });

  if (isLoading) return <div className="text-otto-gray">Loading entities…</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Entities</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {(data as Array<{ id: string; name: string; country: string; code: string; sites?: unknown[] }>).map((entity) => (
          <div key={entity.id} className="card">
            <div className="text-lg font-semibold">{entity.name}</div>
            <div className="text-sm text-otto-gray">{entity.country} · {entity.code}</div>
            <div className="mt-2 text-xs text-otto-gold">{entity.sites?.length ?? 0} site(s)</div>
          </div>
        ))}
      </div>
    </div>
  );
}
