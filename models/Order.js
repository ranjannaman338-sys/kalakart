import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  unitPriceSnapshot: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  lineTotal: {
    type: Number,
    required: true,
  },
});

const addressSnapshotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSnapshotSchema],
    addressSnapshot: {
      type: addressSnapshotSchema,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    discountAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'RAZORPAY'],
      default: 'COD',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'ORDER_PLACED',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'ORDER_PLACED',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
