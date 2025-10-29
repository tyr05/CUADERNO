import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

const buildToken = (user) => {
  const payload = {
    uid: user._id.toString(),
    rol: user.rol,
    nombre: user.nombre,
    email: user.email,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '12h' });
  return { token, payload };
};

router.post('/register', async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ ok: false, message: 'Datos incompletos' });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(400).json({ ok: false, message: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ nombre, email, passwordHash, rol: 'familia' });
    const { token, payload } = buildToken(user);
    res.status(201).json({
      ok: true,
      token,
      user: { nombre: payload.nombre, email: payload.email, rol: payload.rol },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Credenciales requeridas' });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }

    const { token, payload } = buildToken(user);
    res.json({
      ok: true,
      token,
      user: { nombre: payload.nombre, email: payload.email, rol: payload.rol },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
