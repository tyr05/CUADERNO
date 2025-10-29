import dotenv from 'dotenv';
import mongoose from 'mongoose';

import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Falta la variable de entorno MONGO_URI');
  process.exit(1);
}

mongoose.set('strictQuery', false);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB', err);
    process.exit(1);
  });
