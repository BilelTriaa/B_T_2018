import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Building2,
  FileText,
  Route,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/entities', label: 'Entities', icon: Building2 },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/isms', label: 'One ISMS', icon: Shield, disabled: true },
  { to: '/governance', label: 'One Governance', icon: Settings, disabled: true },
  { to: '/path', label: 'One Path', icon: Route, disabled: true },
  { to: '/executive', label: 'Executive', icon: BarChart3, disabled: true },
];

export default function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r border-otto-border bg-otto-surface/50 p-4">
        <div className="mb-8">
          <div className="text-xl font-bold tracking-wider text-otto-cyan">OTTO</div>
          <div className="text-xs text-otto-gray">Inspired by unity. Driven by security.</div>
        </div>

        <nav className="flex-1 space-y-1">
          {nav.map(({ to, label, icon: Icon, disabled }) =>
            disabled ? (
              <div key={label} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-otto-gray/50">
                <Icon size={16} /> {label} <span className="ml-auto text-[10px]">Phase 2+</span>
              </div>
            ) : (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    isActive ? 'bg-otto-cyan/15 text-otto-cyan' : 'text-otto-gray hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={16} /> {label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="mt-4 border-t border-otto-border pt-4 text-sm">
          <div className="font-medium">{user?.fullName}</div>
          <div className="text-xs text-otto-gray">{user?.roles[0]}</div>
          <button onClick={logout} className="mt-3 flex items-center gap-2 text-otto-gray hover:text-white">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
