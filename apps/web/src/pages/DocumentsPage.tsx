import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function DocumentsPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['documents'], queryFn: api.documents });

  if (isLoading) return <div className="text-otto-gray">Loading documents…</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Document Library</h1>
      <div className="space-y-3">
        {(data as Array<{ id: string; title: string; status: string; classification: string }>).map((doc) => (
          <div key={doc.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{doc.title}</div>
              <div className="text-xs text-otto-gray">{doc.classification}</div>
            </div>
            <span className="rounded-full bg-otto-gold/10 px-3 py-1 text-xs text-otto-gold">{doc.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
