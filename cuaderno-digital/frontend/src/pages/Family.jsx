import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Family = () => {
  const { token } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [hijos, setHijos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadHijos = async () => {
    try {
      const response = await apiGet('/familias/mis-hijos', token);
      setHijos(response.hijos || []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los hijos');
    }
  };

  useEffect(() => {
    loadHijos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiPost('/familias/vinculos', { codigo }, token);
      setCodigo('');
      setSuccess(`Se vinculó a ${response.hijo.nombre}`);
      await loadHijos();
    } catch (err) {
      setError(err.message || 'No se pudo vincular el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded bg-white p-4 shadow">
        <h2 className="text-lg font-bold">Vincular estudiante</h2>
        <form className="mt-4 flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
          <input
            className="flex-1 rounded border border-slate-300 px-3 py-2"
            value={codigo}
            onChange={(event) => setCodigo(event.target.value.toUpperCase())}
            placeholder="Ej: ABC-12-345"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
          >
            {loading ? 'Vinculando...' : 'Vincular'}
          </button>
        </form>
        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
        {success ? <p className="mt-2 text-sm text-emerald-600">{success}</p> : null}
      </div>

      <div className="rounded bg-white p-4 shadow">
        <h2 className="text-lg font-bold">Mis hijos</h2>
        <ul className="mt-4 space-y-3">
          {hijos.length === 0 ? <li className="text-sm text-slate-500">Aún no hay vínculos.</li> : null}
          {hijos.map((hijo) => (
            <li key={hijo.studentRef} className="rounded border border-slate-200 p-3">
              <h3 className="text-lg font-semibold">{hijo.nombre}</h3>
              <p className="text-sm text-slate-600">
                Curso: {hijo.curso}° {hijo.division}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Family;
