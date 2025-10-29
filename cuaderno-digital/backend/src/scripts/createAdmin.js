import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const { MONGO_URI, ADMIN_EMAIL = 'admin@cuaderno.com', ADMIN_PASSWORD = 'admin123' } =
  process.env;

if (!MONGO_URI) {
  console.error('Falta MONGO_URI en el entorno');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Mongo conectado');

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const user = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      $set: {
        nombre: 'Administrador',
        email: ADMIN_EMAIL,
        passwordHash,
        rol: 'admin',
      },
    },
    { new: true, upsert: true },
  );

  console.log(`Admin listo: ${user.email}`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('No se pudo crear admin', error);
  process.exit(1);
});
