import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const estados = ['Presente', 'Ausente', 'Tarde', 'Justificado'];

const Asistencias = () => {
  const { token } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [marcas, setMarcas] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [resumen, setResumen] = useState([]);

  useEffect(() => {
    const loadCursos = async () => {
      try {
        const response = await apiGet('/cursos', token);
        setCursos(response.items || []);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar cursos');
      }
    };
    loadCursos();
  }, [token]);

  const divisionesDisponibles = useMemo(() => {
    if (!selectedCurso) return [];
    const cursosFiltrados = cursos.filter((curso) => String(curso.anio) === String(selectedCurso));
    return [...new Set(cursosFiltrados.map((curso) => curso.division))];
  }, [cursos, selectedCurso]);

  const loadStudents = async () => {
    if (!selectedCurso || !selectedDivision) {
      setStudents([]);
      return;
    }
    try {
      setLoading(true);
      const response = await apiGet(
        `/students?curso=${selectedCurso}&division=${selectedDivision}`,
        token,
      );
      setStudents(response.students || []);
      const initial = {};
      (response.students || []).forEach((student) => {
        initial[student._id] = 'Presente';
      });
      setMarcas(initial);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const loadHistorial = async () => {
    if (!selectedCurso || !selectedDivision) {
      setHistorial([]);
      setResumen([]);
      return;
    }
    try {
      const query = `?curso=${selectedCurso}&division=${selectedDivision}&desde=${fecha}&hasta=${fecha}`;
      const [historialResp, resumenResp] = await Promise.all([
        apiGet(`/asistencias/historial${query}`, token),
        apiGet(`/asistencias/resumen${query}`, token),
      ]);
      setHistorial(historialResp.items || []);
      setResumen(resumenResp.resumen || []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial');
    }
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCurso, selectedDivision]);

  useEffect(() => {
    loadHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCurso, selectedDivision, fecha]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCurso || !selectedDivision) {
      setError('Seleccioná curso y división');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const items = Object.entries(marcas).map(([studentId, estado]) => ({ studentId, estado }));
      const response = await apiPost(
        '/asistencias/marcar',
        { fecha, items },
        token,
      );
      setMessage(`Se guardaron ${response.count} asistencias`);
      await loadHistorial();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la asistencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded bg-white p-4 shadow">
        <h2 className="text-lg font-bold">Marcar asistencias</h2>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-semibold">Fecha</label>
              <input
                type="date"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Curso</label>
              <select
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={selectedCurso}
                onChange={(event) => {
                  setSelectedCurso(event.target.value);
                  setSelectedDivision('');
                }}
              >
                <option value="">Seleccionar</option>
                {[...new Set(cursos.map((curso) => curso.anio))].map((anio) => (
                  <option key={anio} value={anio}>
                    {anio}°
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">División</label>
              <select
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={selectedDivision}
                onChange={(event) => setSelectedDivision(event.target.value)}
              >
                <option value="">Seleccionar</option>
                {divisionesDisponibles.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Estudiante</th>
                  <th className="px-3 py-2 text-left font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((student) => (
                  <tr key={student._id}>
                    <td className="px-3 py-2">{student.nombre}</td>
                    <td className="px-3 py-2">
                      <select
                        className="w-full rounded border border-slate-300 px-3 py-2"
                        value={marcas[student._id] || 'Presente'}
                        onChange={(event) =>
                          setMarcas((prev) => ({ ...prev, [student._id]: event.target.value }))
                        }
                      >
                        {estados.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-3 py-4 text-center text-slate-500">
                      Seleccioná un curso y división para comenzar.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <button
            type="submit"
            disabled={loading || students.length === 0}
            className="rounded bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700"
          >
            {loading ? 'Guardando...' : 'Guardar asistencia'}
          </button>
        </form>
      </div>

      <div className="rounded bg-white p-4 shadow">
        <h2 className="text-lg font-bold">Historial del día</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {historial.length === 0 ? <li className="text-slate-500">Sin registros.</li> : null}
          {historial.map((registro) => (
            <li key={`${registro.studentRef?._id || registro.studentRef}-${registro.fecha}`}>
              {registro.studentRef?.nombre || 'Estudiante'}: {registro.estado} ({' '}
              {new Date(registro.fecha).toLocaleDateString('es-AR')})
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded bg-white p-4 shadow">
        <h2 className="text-lg font-bold">Resumen</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumen.length === 0 ? <p className="text-sm text-slate-500">Sin datos.</p> : null}
          {resumen.map((item) => (
            <div key={item.studentId} className="rounded border border-slate-200 p-3 text-sm">
              <h3 className="text-lg font-semibold">{item.estudiante?.nombre}</h3>
              <p>Curso: {item.estudiante?.curso}° {item.estudiante?.division}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <span className="rounded bg-emerald-100 px-2 py-1 text-center font-semibold text-emerald-700">
                  P: {item.presentes}
                </span>
                <span className="rounded bg-rose-100 px-2 py-1 text-center font-semibold text-rose-700">
                  A: {item.ausentes}
                </span>
                <span className="rounded bg-amber-100 px-2 py-1 text-center font-semibold text-amber-700">
                  T: {item.tarde}
                </span>
                <span className="rounded bg-slate-100 px-2 py-1 text-center font-semibold text-slate-700">
                  J: {item.justificado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Asistencias;
