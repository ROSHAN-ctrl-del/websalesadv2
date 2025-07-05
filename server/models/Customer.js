import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SalesPerson'
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'potential'], 
    default: 'potential' 
  },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrder: { type: Date },
  items: [{
    name: String,
    quantity: { type: Number, default: 1 }
  }],
  notes: { type: String },
  tags: [String],
}, { timestamps: true });

// Index for geospatial queries
CustomerSchema.index({ location: '2dsphere' });
CustomerSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.model('Customer', CustomerSchema);