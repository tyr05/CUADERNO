import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import cursoRoutes from './routes/cursos.js';
import studentRoutes from './routes/students.js';
import familiaRoutes from './routes/familias.js';
import anuncioRoutes from './routes/anuncios.js';
import asistenciaRoutes from './routes/asistencias.js';
import { mongoState } from './utils/mongoState.js';

const app = express();

const frontendOrigin = process.env.FRONTEND_ORIGIN || '*';

app.use(
  cors({
    origin: frontendOrigin === '*' ? '*' : frontendOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    mongo: mongoState(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/familias', familiaRoutes);
app.use('/api/anuncios', anuncioRoutes);
app.use('/api/asistencias', asistenciaRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Recurso no encontrado' });
});

app.use((err, req, res, next) => {
  console.error('Error handler:', err);
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    message: err.message || 'Error interno del servidor',
    details: err.details || undefined,
  });
  next();
});

export default app;
