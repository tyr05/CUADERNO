import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

const alcanceOptions = ['General', 'Curso', 'Estudiante'];

const ModalAnuncio = ({ open, onClose, cursos, estudiantes, onSubmit, loading }) => {
  const [form, setForm] = useState({
    titulo: '',
    mensaje: '',
    alcance: 'General',
    cursoId: '',
    estudianteId: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setForm({ titulo: '', mensaje: '', alcance: 'General', cursoId: '', estudianteId: '' });
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    }
  };

  const canSelectCurso = form.alcance === 'Curso' || form.alcance === 'Estudiante';
  const canSelectEstudiante = form.alcance === 'Estudiante';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo anuncio"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-anuncio"
            disabled={loading}
            className="rounded bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Guardar
          </button>
        </div>
      }
    >
      <form id="form-anuncio" className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-sm font-semibold">Título</label>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={form.titulo}
            onChange={(event) => setForm({ ...form, titulo: event.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">Mensaje</label>
          <textarea
            className="h-32 w-full rounded border border-slate-300 px-3 py-2"
            value={form.mensaje}
            onChange={(event) => setForm({ ...form, mensaje: event.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">Alcance</label>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={form.alcance}
            onChange={(event) =>
              setForm({ ...form, alcance: event.target.value, cursoId: '', estudianteId: '' })
            }
          >
            {alcanceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {canSelectCurso ? (
          <div className="space-y-1">
            <label className="text-sm font-semibold">Curso</label>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={form.cursoId}
              onChange={(event) => setForm({ ...form, cursoId: event.target.value })}
              required
            >
              <option value="">Seleccionar...</option>
              {cursos.map((curso) => (
                <option key={curso._id} value={curso._id}>
                  {curso.nombre}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {canSelectEstudiante ? (
          <div className="space-y-1">
            <label className="text-sm font-semibold">Estudiante</label>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={form.estudianteId}
              onChange={(event) => setForm({ ...form, estudianteId: event.target.value })}
              required
            >
              <option value="">Seleccionar...</option>
              {estudiantes.map((est) => (
                <option key={est._id} value={est._id}>
                  {est.nombre} ({est.curso}° {est.division})
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </form>
    </Modal>
  );
};

export default ModalAnuncio;
