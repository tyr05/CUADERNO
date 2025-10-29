import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ModalAnuncio from '../components/ModalAnuncio.jsx';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const [cursosResp, anunciosResp, studentsResp] = await Promise.all([
        apiGet('/cursos', token),
        apiGet('/anuncios', token),
        apiGet('/students', token),
      ]);
      setCursos(Array.isArray(cursosResp.items) ? cursosResp.items : []);
      setAnuncios(Array.isArray(anunciosResp.anuncios) ? anunciosResp.anuncios : []);
      setStudents(Array.isArray(studentsResp.students) ? studentsResp.students : []);
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreateAnuncio = async (form) => {
    setSaving(true);
    const payload = {
      titulo: form.titulo,
      mensaje: form.mensaje,
      alcance: form.alcance,
    };
    if (form.alcance === 'Curso' || form.alcance === 'Estudiante') {
      payload.cursoId = form.cursoId;
    }
    if (form.alcance === 'Estudiante') {
      payload.estudianteId = form.estudianteId;
    }
    try {
      await apiPost('/anuncios', payload, token);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Cargando datos...</p>;
  }

  if (error) {
    return <p className="text-rose-600">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded bg-white p-4 shadow">
        <h2 className="text-lg font-bold">Resumen</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Cursos activos</p>
            <p className="text-3xl font-semibold">{cursos.length}</p>
          </div>
          <div className="rounded border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Estudiantes</p>
            <p className="text-3xl font-semibold">{students.length}</p>
          </div>
          <div className="rounded border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Anuncios recientes</p>
            <p className="text-3xl font-semibold">{anuncios.length}</p>
          </div>
        </div>
        {['admin', 'docente'].includes(user.rol) ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-4 rounded bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700"
          >
            Crear anuncio
          </button>
        ) : null}
      </div>

      <div className="rounded bg-white p-4 shadow">
        <h2 className="text-lg font-bold">Últimos anuncios</h2>
        <ul className="mt-4 space-y-3">
          {anuncios.length === 0 ? <li className="text-sm text-slate-500">Sin anuncios</li> : null}
          {anuncios.map((anuncio) => (
            <li key={anuncio._id} className="rounded border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{anuncio.titulo}</h3>
                <span className="rounded bg-sky-100 px-2 py-1 text-xs font-bold text-sky-700">
                  {anuncio.alcance}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{anuncio.mensaje}</p>
              <p className="mt-2 text-xs text-slate-500">
                {new Date(anuncio.createdAt || anuncio.fecha || Date.now()).toLocaleString('es-AR')} ·{' '}
                {anuncio.autorId?.nombre || 'Anónimo'}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <ModalAnuncio
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cursos={cursos}
        estudiantes={students}
        onSubmit={handleCreateAnuncio}
        loading={saving}
      />
    </div>
  );
};

export default Dashboard;
