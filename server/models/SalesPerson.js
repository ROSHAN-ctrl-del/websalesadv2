import mongoose from 'mongoose';

const SalesPersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  region: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  currentLocation: { type: String },
  totalSales: { type: Number, default: 0 },
  dealsCount: { type: Number, default: 0 },
  lastActivity: { type: Date },
  salesAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesAdmin' },
  password: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('SalesPerson', SalesPersonSchema);
