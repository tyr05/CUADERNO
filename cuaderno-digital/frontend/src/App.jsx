import { useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Estudiantes from './pages/Estudiantes.jsx';
import Family from './pages/Family.jsx';
import Asistencias from './pages/Asistencias.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      document.title = `Cuaderno Digital - ${user.nombre}`;
    } else {
      document.title = 'Cuaderno Digital';
    }
  }, [user]);

  const menu = [
    { to: '/', label: 'Dashboard', roles: ['admin', 'docente'] },
    { to: '/estudiantes', label: 'Estudiantes', roles: ['admin', 'docente'] },
    { to: '/asistencias', label: 'Asistencias', roles: ['admin', 'docente'] },
    { to: '/familia', label: 'Familia', roles: ['familia'] },
  ];

  const visibleMenu = menu.filter((item) => !user || item.roles.includes(user.rol));

  return (
    <div className="min-h-screen">
      <header className="bg-sky-700 text-white">
        <div className="max-w-6xl mx-auto flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cuaderno Digital</h1>
            {user ? <p className="text-sm">Hola, {user.nombre} ({user.rol})</p> : null}
          </div>
          <nav className="flex flex-wrap gap-2">
            {visibleMenu.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded px-3 py-2 text-sm font-semibold transition hover:bg-sky-800 ${
                  location.pathname === item.to ? 'bg-sky-900' : 'bg-sky-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="rounded bg-rose-600 px-3 py-2 text-sm font-semibold hover:bg-rose-700"
              >
                Cerrar sesión
              </button>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute roles={['admin', 'docente']}>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/estudiantes"
        element={
          <PrivateRoute roles={['admin', 'docente']}>
            <Layout>
              <Estudiantes />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/familia"
        element={
          <PrivateRoute roles={['familia']}>
            <Layout>
              <Family />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/asistencias"
        element={
          <PrivateRoute roles={['admin', 'docente']}>
            <Layout>
              <Asistencias />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/login"
        element={
          <Layout>
            <Login />
          </Layout>
        }
      />
      <Route
        path="/register"
        element={
          <Layout>
            <Register />
          </Layout>
        }
      />
      <Route
        path="*"
        element={
          <Layout>
            <NotFound />
          </Layout>
        }
      />
    </Routes>
  );
};

export default App;
