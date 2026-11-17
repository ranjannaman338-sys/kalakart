import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sellerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile',
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
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
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      validate: [(val) => val.length > 0, 'At least one image is required'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    compareAtPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    materials: {
      type: String,
      default: '',
    },
    dimensions: {
      type: String,
      default: '',
    },
    weight: {
      type: String,
      default: '',
    },
    preparationTime: {
      type: String,
      default: '2-4 business days',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
productSchema.index({
  name: 'text',
  description: 'text',
  materials: 'text',
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
