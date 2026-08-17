import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['inquiry', 'view', 'click'],
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    value: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model('Analytics', analyticsSchema);
