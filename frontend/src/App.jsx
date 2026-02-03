import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import Loading from './components/Loading';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Registros from './pages/Registros';
import NovoRegistro from './pages/NovoRegistro';
import EditarRegistro from './pages/EditarRegistro/EditarRegistro';
import Relatorio from './pages/Relatorio';
import Perfil from './pages/Perfil';
import AdminDashboard from './pages/AdminDashboard';

// Layout para rotas protegidas com navegação
const ProtectedLayout = () => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Carregando..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se for admin, não deve acessar rotas de cuidador (opcional, mas recomendado)
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
};

const AdminLayout = () => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Carregando..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Layout para rotas públicas (login/register)
const PublicLayout = () => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Carregando..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Rotas de Admin (Família) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            {/* Redirecionar /admin para /admin/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Rotas Protegidas (Cuidadores) */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/registros" element={<Registros />} />
            <Route path="/relatorio" element={<Relatorio />} />
            <Route path="/novo-registro" element={<NovoRegistro />} />
            <Route path="/editar-registro/:id" element={<EditarRegistro />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>

          {/* Redirect padrão */}
          <Route path="/" element={<PublicLayout />} /> {/* Deixe o PublicLayout decidir */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
