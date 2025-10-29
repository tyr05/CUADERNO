import mongoose from 'mongoose';

const cursoSchema = new mongoose.Schema(
  {
    anio: { type: Number, required: true },
    division: { type: String, required: true },
    turno: { type: String, required: true },
    nombre: { type: String, required: true },
  },
  { timestamps: true },
);

cursoSchema.index({ anio: 1, division: 1, turno: 1 }, { unique: true });

export default mongoose.model('Curso', cursoSchema);
