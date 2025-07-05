import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'warning', 'error', 'success', 'task_assigned', 'task_updated', 'order_update'], 
    default: 'info' 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['SalesPerson', 'SalesAdmin']
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    enum: ['SalesPerson', 'SalesAdmin', 'System']
  },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  data: { type: mongoose.Schema.Types.Mixed }, // Additional data for the notification
  expiresAt: { type: Date }, // Auto-delete after this date
}, { timestamps: true });

// Index for efficient queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Notification', NotificationSchema);