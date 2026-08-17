import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, // e.g. "nike-lagos" -> yourplatform.com/nike-lagos
    },
    whatsappNumber: {
      type: String,
      required: true, // Formatted as country code without "+", e.g., "2348012345678"
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    bio: {
          type: String,
          default: '',
        },
    logoUrl: String,
    bannerUrl: String,
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro'],
      default: 'free',
    },
    subscriptionExpiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Store || mongoose.model('Store', storeSchema);
