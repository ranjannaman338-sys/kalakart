import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED'],
      required: true,
      default: 'PERCENTAGE',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },
    minimumOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 100,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
