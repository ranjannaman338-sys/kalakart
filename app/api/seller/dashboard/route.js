import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import SellerFulfillment from '@/models/SellerFulfillment';
import { requireSeller } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const { user, sellerProfile, errorResponse } = await requireSeller(req);
    if (errorResponse) return errorResponse;

    await connectDB();

    const sellerId = user._id;

    const [totalProducts, activeProducts, fulfillments] = await Promise.all([
      Product.countDocuments({ sellerId }),
      Product.countDocuments({ sellerId, status: 'active' }),
      SellerFulfillment.find({ sellerId })
        .populate('orderId', 'createdAt orderStatus addressSnapshot paymentMethod')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const totalOrders = fulfillments.length;
    let pendingOrders = 0;
    let completedOrders = 0;
    let totalRevenue = 0;

    // Monthly sales aggregation for Recharts
    const monthsMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthsMap[key] = 0;
    }

    fulfillments.forEach((f) => {
      const status = f.fulfillmentStatus;
      if (status === 'DELIVERED') {
        completedOrders++;
        const fulfillmentTotal = f.items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
        totalRevenue += fulfillmentTotal;

        const date = new Date(f.deliveredAt || f.createdAt);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        if (monthsMap[key] !== undefined) {
          monthsMap[key] += fulfillmentTotal;
        }
      } else if (status !== 'CANCELLED') {
        pendingOrders++;
      }
    });

    const salesTrend = Object.keys(monthsMap).map((month) => ({
      name: month,
      revenue: monthsMap[month],
    }));

    const recentOrders = fulfillments.slice(0, 5).map((f) => ({
      _id: f._id,
      orderId: f.orderId?._id,
      date: f.orderId?.createdAt || f.createdAt,
      status: f.fulfillmentStatus,
      itemCount: f.items.reduce((s, it) => s + it.quantity, 0),
      total: f.items.reduce((s, it) => s + it.lineTotal, 0),
      customerName: f.orderId?.addressSnapshot?.name || 'Customer',
    }));

    return apiSuccess({
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
      },
      salesTrend,
      recentOrders,
      shop: sellerProfile,
    });
  } catch (error) {
    console.error('Seller dashboard error:', error);
    return apiError(error.message || 'Failed to fetch seller dashboard data', 500);
  }
}
