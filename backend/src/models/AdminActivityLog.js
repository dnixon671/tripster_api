import mongoose from 'mongoose';

const AdminActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'role_update',
      'user_ban',
      'user_create',
      'user_update',
      'user_delete',
      'vehicle_approval',
      'trip_cancel',
      'payment_refund'
    ]
  },
  targetType: {
    type: String,
    required: true,
    enum: ['user', 'driver', 'vehicle', 'trip', 'payment']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  changes: {
    type: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices compuestos para búsquedas rápidas
AdminActivityLogSchema.index({ adminId: 1, createdAt: -1 });
AdminActivityLogSchema.index({ targetType: 1, targetId: 1 });

// Virtual para relación con el administrador
AdminActivityLogSchema.virtual('admin', {
  ref: 'User',
  localField: 'adminId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'username email role' }
});

// Middleware para limpieza automática después de 6 meses
AdminActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 });

export default mongoose.model('AdminActivityLog', AdminActivityLogSchema);