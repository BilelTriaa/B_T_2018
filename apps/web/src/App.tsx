import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AppShell from './components/AppShell';
import DashboardPage from './pages/DashboardPage';
import AccessPage from './pages/AccessPage';
import ProductionPage from './pages/ProductionPage';
import QualityPage from './pages/QualityPage';
import DocumentsPage from './pages/DocumentsPage';
import TeamPage from './pages/TeamPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-axiome-muted">Ouverture d’AXIOME…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="acces" element={<AccessPage />} />
              <Route path="production" element={<ProductionPage />} />
              <Route path="qualite" element={<QualityPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="equipe" element={<TeamPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
