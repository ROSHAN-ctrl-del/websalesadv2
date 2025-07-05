import mongoose from 'mongoose';

const SalesAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  region: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastLogin: { type: Date },
  password: { type: String, required: true },
  salesPersonsCount: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('SalesAdmin', SalesAdminSchema); 