import { Router } from 'express';
import mongoose from 'mongoose';
import Asistencia from '../models/Asistencia.js';
import Student from '../models/Student.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { normalizeCurso, normalizeDivision, normalizeFecha } from '../utils/normalizers.js';

const router = Router();

router.use(requireAuth, requireRole('admin', 'docente'));

router.post('/marcar', async (req, res, next) => {
  try {
    const { fecha, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, message: 'No hay asistencias para procesar' });
    }

    const normalizedDate = normalizeFecha(fecha);
    const studentIds = [...new Set(items.map((item) => item.studentId))].filter(Boolean);

    const students = await Student.find({ _id: { $in: studentIds } })
      .select('_id curso division nombre')
      .lean();
    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

    const operations = [];
    const estadosValidos = ['Presente', 'Ausente', 'Tarde', 'Justificado'];

    for (const item of items) {
      if (!item.studentId || !estadosValidos.includes(item.estado)) {
        return res.status(400).json({ ok: false, message: 'Datos de asistencia inválidos' });
      }
      const student = studentMap.get(item.studentId);
      if (!student) {
        return res.status(404).json({ ok: false, message: 'Estudiante no encontrado' });
      }

      operations.push({
        updateOne: {
          filter: { studentRef: student._id, fecha: normalizedDate },
          update: {
            $set: {
              estado: item.estado,
              curso: student.curso,
              division: student.division,
              autorId: req.currentUser._id,
              fecha: normalizedDate,
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      });
    }

    if (operations.length === 0) {
      return res.status(400).json({ ok: false, message: 'Sin operaciones válidas' });
    }

    const result = await Asistencia.bulkWrite(operations, { ordered: false });

    res.json({
      ok: true,
      count: result.upsertedCount + result.modifiedCount + result.insertedCount,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.status = 409;
      error.message = 'Asistencia duplicada detectada';
    }
    next(error);
  }
});

router.get('/historial', async (req, res, next) => {
  try {
    const { studentId, page = 1, limit = 20, desde, hasta } = req.query;
    const curso = normalizeCurso(req.query.curso);
    const division = normalizeDivision(req.query.division);

    const filters = {};
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      filters.studentRef = studentId;
    }
    if (curso !== undefined) filters.curso = curso;
    if (division) filters.division = division;

    if (desde) {
      filters.fecha = { ...filters.fecha, $gte: normalizeFecha(desde) };
    }
    if (hasta) {
      const end = normalizeFecha(hasta);
      end.setHours(23, 59, 59, 999);
      filters.fecha = { ...filters.fecha, $lte: end };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const asistencias = await Asistencia.find(filters)
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('studentRef', 'nombre curso division codigo')
      .populate('autorId', 'nombre rol email')
      .lean();

    const total = await Asistencia.countDocuments(filters);

    res.json({ ok: true, total, page: Number(page), items: asistencias });
  } catch (error) {
    next(error);
  }
});

router.get('/resumen', async (req, res, next) => {
  try {
    const curso = normalizeCurso(req.query.curso);
    const division = normalizeDivision(req.query.division);
    const { desde, hasta } = req.query;

    const match = {};
    if (curso !== undefined) match.curso = curso;
    if (division) match.division = division;
    if (desde) match.fecha = { ...match.fecha, $gte: normalizeFecha(desde) };
    if (hasta) {
      const end = normalizeFecha(hasta);
      end.setHours(23, 59, 59, 999);
      match.fecha = { ...match.fecha, $lte: end };
    }

    const resumen = await Asistencia.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$studentRef',
          presentes: {
            $sum: { $cond: [{ $eq: ['$estado', 'Presente'] }, 1, 0] },
          },
          ausentes: {
            $sum: { $cond: [{ $eq: ['$estado', 'Ausente'] }, 1, 0] },
          },
          tarde: {
            $sum: { $cond: [{ $eq: ['$estado', 'Tarde'] }, 1, 0] },
          },
          justificado: {
            $sum: { $cond: [{ $eq: ['$estado', 'Justificado'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'estudiantes',
          localField: '_id',
          foreignField: '_id',
          as: 'estudiante',
        },
      },
      { $unwind: '$estudiante' },
      {
        $project: {
          _id: 0,
          studentId: '$_id',
          estudiante: {
            nombre: '$estudiante.nombre',
            curso: '$estudiante.curso',
            division: '$estudiante.division',
            codigo: '$estudiante.codigo',
          },
          presentes: 1,
          ausentes: 1,
          tarde: 1,
          justificado: 1,
        },
      },
    ]);

    res.json({ ok: true, count: resumen.length, resumen });
  } catch (error) {
    next(error);
  }
});

export default router;
