import { Router } from 'express';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('familia'));

router.post('/vinculos', async (req, res, next) => {
  try {
    const { codigo } = req.body;
    if (!codigo) {
      return res.status(400).json({ ok: false, message: 'Código requerido' });
    }

    const student = await Student.findOne({ codigo }).lean();
    if (!student) {
      return res.status(404).json({ ok: false, message: 'Estudiante no encontrado' });
    }
    if (student.codigoUsado) {
      return res.status(400).json({ ok: false, message: 'El código ya fue utilizado' });
    }

    const alreadyLinked = (req.currentUser.hijos || []).some((h) =>
      h.studentRef?.toString() === student._id.toString(),
    );
    if (alreadyLinked) {
      return res.status(400).json({ ok: false, message: 'El estudiante ya está vinculado' });
    }

    await Student.updateOne({ _id: student._id }, { $set: { codigoUsado: true } });

    const hijo = {
      nombre: student.nombre,
      curso: String(student.curso),
      division: String(student.division),
      studentRef: student._id,
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.currentUser._id,
      {
        $push: {
          hijos: {
            nombre: hijo.nombre,
            curso: hijo.curso,
            division: hijo.division,
            studentRef: hijo.studentRef,
          },
        },
      },
      { new: true, lean: true },
    );

    res
      .status(201)
      .json({ ok: true, hijo, hijos: updatedUser.hijos ?? [] });
  } catch (error) {
    next(error);
  }
});

router.get('/mis-hijos', async (req, res, next) => {
  try {
    const user = await User.findById(req.currentUser._id).select('hijos nombre email').lean();
    res.json({ ok: true, hijos: user.hijos ?? [] });
  } catch (error) {
    next(error);
  }
});

export default router;
