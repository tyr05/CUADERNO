import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    curso: { type: Number, required: true },
    division: { type: String, required: true },
    codigo: {
      type: String,
      required: true,
      unique: true,
      match: /^[A-Z]{3}-\d{2}-\d{3}$/,
    },
    codigoUsado: { type: Boolean, default: false },
  },
  { timestamps: true },
);

studentSchema.index({ curso: 1, division: 1, nombre: 1 });

export default mongoose.model('Student', studentSchema, 'estudiantes');
