import { useState } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@rosenberger.com');
  const [password, setPassword] = useState('OTTO2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-otto-navy px-4">
      <div className="card w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <Shield className="h-10 w-10 text-otto-cyan" />
          <div>
            <h1 className="text-2xl font-bold tracking-wide">OTTO SYSTEM</h1>
            <p className="text-sm text-otto-gray">Inspired by unity. Driven by security.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-otto-gray">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-otto-gray">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-xs text-otto-gray">
          Dev mode · SSO (Entra ID) ready for production
        </p>
      </div>
    </div>
  );
}
