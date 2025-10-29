import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Estudiantes = () => {
  const { token } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCursos = async () => {
      try {
        const response = await apiGet('/cursos', token);
        setCursos(response.items || []);
      } catch (err) {
        setError(err.message || 'No se pudo cargar cursos');
      }
    };
    loadCursos();
  }, [token]);

  const divisionesDisponibles = useMemo(() => {
    if (!selectedCurso) return [];
    const cursoData = cursos.filter((curso) => String(curso.anio) === String(selectedCurso));
    return [...new Set(cursoData.map((curso) => curso.division))];
  }, [cursos, selectedCurso]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      let path = '/students';
      const params = new URLSearchParams();
      if (search) {
        path = '/students/search';
        params.set('q', search);
      }
      if (selectedCurso) params.set('curso', selectedCurso);
      if (selectedDivision) params.set('division', selectedDivision);
      if (search) params.set('limit', '50');
      const query = params.toString();
      const response = await apiGet(`${path}${query ? `?${query}` : ''}`, token);
      setStudents(response.students || []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCurso, selectedDivision]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadStudents();
  };

  return (
    <div className="space-y-6">
      <div className="rounded bg-white p-4 shadow">
        <h2 className="text-lg font-bold">Filtro</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-4" onSubmit={handleSearch}>
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
              <option value="">Todos</option>
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
              <option value="">Todas</option>
              {divisionesDisponibles.map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Buscar por nombre</label>
            <div className="mt-1 flex gap-2">
              <input
                className="flex-1 rounded border border-slate-300 px-3 py-2"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Ej: María"
              />
              <button
                type="submit"
                className="rounded bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700"
              >
                Buscar
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded bg-white p-4 shadow">
        <h2 className="text-lg font-bold">Estudiantes</h2>
        {loading ? <p className="mt-4">Cargando estudiantes...</p> : null}
        {error ? <p className="mt-4 text-rose-600">{error}</p> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                <th className="px-3 py-2 text-left font-semibold">Curso</th>
                <th className="px-3 py-2 text-left font-semibold">División</th>
                <th className="px-3 py-2 text-left font-semibold">Código</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((student) => (
                <tr key={student._id}>
                  <td className="px-3 py-2">{student.nombre}</td>
                  <td className="px-3 py-2">{student.curso}°</td>
                  <td className="px-3 py-2">{student.division}</td>
                  <td className="px-3 py-2 font-mono">{student.codigo}</td>
                </tr>
              ))}
              {students.length === 0 && !loading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                    No se encontraron estudiantes.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Estudiantes;
