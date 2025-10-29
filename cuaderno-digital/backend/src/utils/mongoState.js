import mongoose from 'mongoose';

const states = ['desconectado', 'conectando', 'conectado', 'desconectando'];

export const mongoState = () => {
  const index = mongoose.connection.readyState;
  if (index === 1) return 'connected';
  if (index === 0) return 'disconnected';
  return states[index] ?? 'unknown';
};
