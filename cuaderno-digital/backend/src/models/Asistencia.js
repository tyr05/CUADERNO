import mongoose from 'mongoose';

const asistenciaSchema = new mongoose.Schema(
  {
    fecha: { type: Date, required: true },
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    estado: {
      type: String,
      enum: ['Presente', 'Ausente', 'Tarde', 'Justificado'],
      required: true,
    },
    curso: { type: Number, required: true },
    division: { type: String, required: true },
    autorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

asistenciaSchema.index({ studentRef: 1, fecha: 1 }, { unique: true });
asistenciaSchema.index({ curso: 1, division: 1, fecha: 1 });

export default mongoose.model('Asistencia', asistenciaSchema);
