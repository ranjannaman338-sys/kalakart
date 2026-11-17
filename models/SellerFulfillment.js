import mongoose from 'mongoose';

const fulfillmentItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productNameSnapshot: {
    type: String,
    required: true,
  },
  productImageSnapshot: {
    type: String,
    default: '',
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitPriceSnapshot: {
    type: Number,
    required: true,
  },
  lineTotal: {
    type: Number,
    required: true,
  },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

const sellerFulfillmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [fulfillmentItemSchema],
    fulfillmentStatus: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PENDING',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    shippedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SellerFulfillment ||
  mongoose.model('SellerFulfillment', sellerFulfillmentSchema);
