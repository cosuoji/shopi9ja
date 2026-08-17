import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  type: { type: String, enum: ['view', 'inquiry'], required: true },
  value: { type: Number, default: 0 }, // Product price at time of inquiry
  clientPhone: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('AnalyticsEvent', analyticsEventSchema);
