import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ ok: false, message: 'Token requerido' });
    }

    const [, token] = authHeader.split(' ');
    if (!token) {
      return res.status(401).json({ ok: false, message: 'Token inválido' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;

    if (!req.user?.uid) {
      return res.status(401).json({ ok: false, message: 'Token inválido' });
    }

    const dbUser = await User.findById(req.user.uid).lean();
    if (!dbUser) {
      return res.status(401).json({ ok: false, message: 'Usuario no encontrado' });
    }

    req.currentUser = dbUser;
    return next();
  } catch (error) {
    error.status = 401;
    return next(error);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.rol || !roles.includes(req.user.rol)) {
      return res
        .status(403)
        .json({ ok: false, message: 'No tiene permisos para esta acción' });
    }
    return next();
  };
};
