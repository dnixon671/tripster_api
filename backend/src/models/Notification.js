import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  body: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['role_update', 'system', 'trip'], 
    default: 'role_update' 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  metadata: { 
    oldData: String,
    newData: String
  }
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);