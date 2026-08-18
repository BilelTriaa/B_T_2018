import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  AppWindow,
  Factory,
  ShieldCheck,
  FileText,
  Users,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', label: 'Cockpit', icon: LayoutDashboard },
  { to: '/acces', label: 'Accès applications', icon: AppWindow },
  { to: '/production', label: 'Production', icon: Factory },
  { to: '/qualite', label: 'Qualité', icon: ShieldCheck },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/equipe', label: 'Équipe / sites', icon: Users },
];

export default function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r border-axiome-border bg-axiome-panel/70 p-4">
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-[0.22em] text-axiome-cyan">RTN · Enfidha</div>
          <div className="font-display text-xl font-bold tracking-wider text-white">
            AXI<span className="text-axiome-red">OME</span>
          </div>
          <div className="text-xs text-axiome-muted">Un accès. Toute l’usine.</div>
        </div>

        <nav className="flex-1 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-axiome-red/15 text-white'
                    : 'text-axiome-muted hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-axiome-border pt-4 text-sm">
          <div className="font-medium">{user?.fullName}</div>
          <div className="text-xs text-axiome-muted">{user?.roles[0]}</div>
          <button onClick={logout} className="mt-3 flex items-center gap-2 text-axiome-muted hover:text-white">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
