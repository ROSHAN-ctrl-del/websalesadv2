import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SalesPerson',
    required: true 
  },
  assignedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SalesAdmin',
    required: true 
  },
  dueDate: { type: Date },
  completedAt: { type: Date },
  notes: { type: String },
  attachments: [{ 
    name: String, 
    url: String, 
    type: String 
  }],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
    address: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
TaskSchema.index({ location: '2dsphere' });

// Virtual for task age
TaskSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
TaskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && new Date() > this.dueDate && this.status !== 'completed';
});

export default mongoose.model('Task', TaskSchema);