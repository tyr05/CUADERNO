import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Curso from '../models/Curso.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Falta MONGO_URI en el entorno');
  process.exit(1);
}

const divisiones = ['1', '2'];
const turnos = ['TM', 'TT'];

const generateCursoNombre = (anio, division, turno) => {
  const turnoTexto = turno === 'TM' ? 'Turno Mañana' : 'Turno Tarde';
  return `${anio}° ${division} ${turnoTexto}`;
};

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const generateCodigo = (counter) => {
  const letter1 = letters[(counter >> 4) % letters.length];
  const letter2 = letters[(counter >> 2) % letters.length];
  const letter3 = letters[counter % letters.length];
  const bloque1 = `${letter1}${letter2}${letter3}`;
  const bloque2 = String(counter % 100).padStart(2, '0');
  const bloque3 = String((counter * 13) % 1000).padStart(3, '0');
  return `${bloque1}-${bloque2}-${bloque3}`;
};

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Mongo conectado');

  await Promise.all([Curso.deleteMany({}), Student.deleteMany({})]);

  let counter = 1;

  for (let anio = 1; anio <= 5; anio += 1) {
    for (const division of divisiones) {
      for (const turno of turnos) {
        await Curso.create({
          anio,
          division,
          turno,
          nombre: generateCursoNombre(anio, division, turno),
        });

        for (let i = 0; i < 10; i += 1) {
          const codigo = generateCodigo(counter);
          counter += 1;
          await Student.create({
            nombre: `Estudiante ${anio}${division}-${i + 1}`,
            curso: anio,
            division,
            codigo,
            codigoUsado: false,
          });
        }
      }
    }
  }

  const usersSeed = [
    {
      nombre: 'Docente Demo',
      email: 'docente@cuaderno.com',
      password: 'docente123',
      rol: 'docente',
    },
    {
      nombre: 'Familia Demo',
      email: 'familia@cuaderno.com',
      password: 'familia123',
      rol: 'familia',
    },
  ];

  for (const seedUser of usersSeed) {
    const existing = await User.findOne({ email: seedUser.email });
    const passwordHash = await bcrypt.hash(seedUser.password, 10);
    if (!existing) {
      await User.create({
        nombre: seedUser.nombre,
        email: seedUser.email,
        passwordHash,
        rol: seedUser.rol,
      });
      console.log(`Usuario ${seedUser.email} creado`);
    } else {
      existing.passwordHash = passwordHash;
      existing.rol = seedUser.rol;
      await existing.save();
      console.log(`Usuario ${seedUser.email} actualizado`);
    }
  }

  console.log('Seed completado');
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('Seed falló', error);
  process.exit(1);
});
