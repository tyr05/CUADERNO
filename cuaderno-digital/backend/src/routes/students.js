import { Router } from 'express';
import mongoose from 'mongoose';
import Student from '../models/Student.js';
import Curso from '../models/Curso.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { normalizeCurso, normalizeDivision } from '../utils/normalizers.js';

const router = Router();

router.use(requireAuth, requireRole('admin', 'docente'));

router.get('/by-course/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ ok: false, message: 'ID de curso inválido' });
    }

    const course = await Curso.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ ok: false, message: 'Curso no encontrado' });
    }

    const filters = { curso: course.anio, division: course.division };
    console.log('Filtro estudiantes by-course', filters);
    const students = await Student.find(filters)
      .select('_id nombre curso division codigo')
      .sort({ nombre: 1 })
      .lean();
    console.log('Cantidad estudiantes', students.length);
    res.json({ ok: true, course, count: students.length, students });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const curso = normalizeCurso(req.query.curso);
    const division = normalizeDivision(req.query.division);
    const filters = {};
    if (curso !== undefined) filters.curso = curso;
    if (division) filters.division = division;
    console.log('Filtro estudiantes list', filters);
    const students = await Student.find(filters)
      .select('_id nombre curso division codigo')
      .sort({ nombre: 1 })
      .lean();
    console.log('Cantidad estudiantes', students.length);
    res.json({ ok: true, count: students.length, students });
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    const curso = normalizeCurso(req.query.curso);
    const division = normalizeDivision(req.query.division);
    const limit = Number(req.query.limit) || 20;

    const filters = {};
    if (q) filters.nombre = { $regex: q, $options: 'i' };
    if (curso !== undefined) filters.curso = curso;
    if (division) filters.division = division;
    console.log('Filtro estudiantes search', filters);

    const students = await Student.find(filters)
      .select('_id nombre curso division codigo')
      .sort({ nombre: 1 })
      .limit(limit)
      .lean();
    console.log('Cantidad estudiantes', students.length);
    res.json({ ok: true, count: students.length, students });
  } catch (error) {
    next(error);
  }
});

export default router;
