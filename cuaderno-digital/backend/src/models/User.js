import mongoose from 'mongoose';

const hijoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    curso: { type: String },
    division: { type: String },
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    rol: { type: String, enum: ['admin', 'docente', 'familia'], required: true },
    hijos: [hijoSchema],
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
