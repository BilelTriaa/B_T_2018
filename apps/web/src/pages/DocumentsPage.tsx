import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function DocumentsPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['documents'], queryFn: api.documents });

  if (isLoading) return <div className="text-axiome-muted">Chargement de la GED…</div>;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">GED usine</h1>
      <p className="mb-6 text-axiome-muted">Documents RTN — politiques, modes opératoires et preuves d’audit.</p>
      <div className="space-y-3">
        {(
          data as Array<{ id: string; title: string; status: string; classification: string; description?: string }>
        ).map((doc) => (
          <div key={doc.id} className="card flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">{doc.title}</div>
              <div className="text-xs text-axiome-muted">
                {doc.classification}
                {doc.description ? ` · ${doc.description}` : ''}
              </div>
            </div>
            <span className="badge bg-axiome-cyan/15 text-axiome-cyan">{doc.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
