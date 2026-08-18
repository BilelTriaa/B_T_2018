import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('bilel.triaa@rosenberger.com');
  const [password, setPassword] = useState('AXIOME2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authLoading && user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion refusée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-axiome-navy px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(227,28,61,0.18),_transparent_45%),radial-gradient(circle_at_80%_80%,_rgba(78,196,224,0.12),_transparent_40%)]" />
      <div className="card relative w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-axiome-red/40 bg-axiome-red/15 font-display text-xl text-axiome-red">
            ◆
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-axiome-cyan">Rosenberger Tunisia · RTN</div>
            <h1 className="font-display text-2xl font-bold tracking-wide">AXIOME</h1>
            <p className="text-sm text-axiome-muted">Un accès. Toute l’usine.</p>
          </div>
        </div>

        <p className="mb-5 text-sm text-axiome-muted">
          Portail d’accès de l’usine Enfidha — production FAKRA, HSD et H-MTD, qualité, GED et applications RTN.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-axiome-muted">Identifiant</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-axiome-muted">Mot de passe</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-axiome-red">{error}</p>}
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? 'Ouverture…' : 'Ouvrir AXIOME'}
          </button>
        </form>

        <p className="mt-4 text-xs text-axiome-muted">
          Démo usine · Novation Industrial City, Enfidha · info-rtn@rosenberger.com
        </p>
      </div>
    </div>
  );
}
