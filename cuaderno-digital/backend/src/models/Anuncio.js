import mongoose from 'mongoose';

const anuncioSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    mensaje: { type: String, required: true },
    alcance: {
      type: String,
      enum: ['General', 'Curso', 'Estudiante'],
      required: true,
    },
    cursoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Curso' },
    estudianteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    autorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

anuncioSchema.index({ createdAt: -1 });

export default mongoose.model('Anuncio', anuncioSchema);
