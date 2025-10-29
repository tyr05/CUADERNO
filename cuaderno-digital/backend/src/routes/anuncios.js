import { Router } from 'express';
import mongoose from 'mongoose';
import Anuncio from '../models/Anuncio.js';
import Curso from '../models/Curso.js';
import Student from '../models/Student.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { normalizeCurso, normalizeDivision } from '../utils/normalizers.js';

const router = Router();

router.use(requireAuth, requireRole('admin', 'docente'));

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post('/', async (req, res, next) => {
  try {
    const { titulo, mensaje, alcance, cursoId, estudianteId } = req.body;
    if (!titulo || !mensaje || !alcance) {
      return res.status(400).json({ ok: false, message: 'Datos incompletos' });
    }

    if (!['General', 'Curso', 'Estudiante'].includes(alcance)) {
      return res.status(400).json({ ok: false, message: 'Alcance inválido' });
    }

    let curso;
    let estudiante;

    if (alcance === 'Curso' || alcance === 'Estudiante') {
      if (!cursoId || !isValidObjectId(cursoId)) {
        return res.status(400).json({ ok: false, message: 'cursoId requerido' });
      }
      curso = await Curso.findById(cursoId).lean();
      if (!curso) {
        return res.status(404).json({ ok: false, message: 'Curso no encontrado' });
      }
    }

    if (alcance === 'Estudiante') {
      if (!estudianteId || !isValidObjectId(estudianteId)) {
        return res
          .status(400)
          .json({ ok: false, message: 'estudianteId requerido para alcance Estudiante' });
      }
      estudiante = await Student.findById(estudianteId).lean();
      if (!estudiante) {
        return res.status(404).json({ ok: false, message: 'Estudiante no encontrado' });
      }
      if (curso && (estudiante.curso !== curso.anio || estudiante.division !== curso.division)) {
        return res.status(400).json({ ok: false, message: 'El estudiante no pertenece al curso' });
      }
    }

    const anuncio = await Anuncio.create({
      titulo,
      mensaje,
      alcance,
      cursoId: curso?._id,
      estudianteId: estudiante?._id,
      autorId: req.currentUser._id,
    });

    res.status(201).json({ ok: true, anuncio });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { alcance, curso, division, limit = 20 } = req.query;
    const filters = {};
    if (alcance) filters.alcance = alcance;
    if (curso) filters.curso = normalizeCurso(curso);
    if (division) filters.division = normalizeDivision(division);

    const mongoFilters = {};
    if (filters.alcance) mongoFilters.alcance = filters.alcance;
    if (filters.curso !== undefined || filters.division) {
      const cursos = await Curso.find(
        {
          ...(filters.curso !== undefined ? { anio: filters.curso } : {}),
          ...(filters.division ? { division: filters.division } : {}),
        },
        { _id: 1 },
      ).lean();
      mongoFilters.cursoId = { $in: cursos.map((c) => c._id) };
    }

    console.log('Filtro anuncios', mongoFilters);

    const anuncios = await Anuncio.find(mongoFilters)
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 20)
      .populate('cursoId', 'anio division turno nombre')
      .populate('estudianteId', 'nombre curso division')
      .populate('autorId', 'nombre rol email')
      .lean();

    console.log('Cantidad anuncios', anuncios.length);

    res.json({ ok: true, count: anuncios.length, anuncios });
  } catch (error) {
    next(error);
  }
});

export default router;
