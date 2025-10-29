import { Router } from 'express';
import Curso from '../models/Curso.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('admin', 'docente'));

router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    const filters = {};
    if (q) {
      filters.nombre = { $regex: q, $options: 'i' };
    }
    const cursos = await Curso.find(filters).sort({ anio: 1, division: 1, turno: 1 }).lean();
    res.json({ ok: true, count: cursos.length, items: cursos });
  } catch (error) {
    next(error);
  }
});

export default router;
