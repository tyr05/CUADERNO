import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { login, loading, error, setError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.from?.pathname || (user.rol === 'familia' ? '/familia' : '/');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold">Iniciar sesión</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-sm font-semibold">Email</label>
          <input
            type="email"
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">Contraseña</label>
          <input
            type="password"
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-sky-600 px-3 py-2 text-white hover:bg-sky-700"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-semibold text-sky-700 hover:underline">
          Registrate
        </Link>
      </p>
      <div className="mt-4 space-y-1 text-xs text-slate-500">
        <p>Admin: admin@cuaderno.com / admin123</p>
        <p>Docente: docente@cuaderno.com / docente123</p>
        <p>Familia: familia@cuaderno.com / familia123</p>
      </div>
    </div>
  );
};

export default Login;
