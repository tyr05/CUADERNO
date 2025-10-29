import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const { register, loading, error, setError } = useAuth();
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await register(form.nombre, form.email, form.password);
      navigate('/familia', { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold">Registrate como familia</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-sm font-semibold">Nombre</label>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={form.nombre}
            onChange={(event) => setForm({ ...form, nombre: event.target.value })}
            required
          />
        </div>
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
          className="w-full rounded bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-semibold text-sky-700 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
};

export default Register;
