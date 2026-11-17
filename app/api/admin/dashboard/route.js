import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import SellerProfile from '@/models/SellerProfile';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    await connectDB();

    const [
      totalUsers,
      totalSellers,
      pendingSellers,
      totalProducts,
      totalOrders,
      orders,
    ] = await Promise.all([
      User.countDocuments(),
      SellerProfile.countDocuments({ applicationStatus: 'approved' }),
      SellerProfile.countDocuments({ applicationStatus: 'pending' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find({ orderStatus: { $ne: 'CANCELLED' }, paymentStatus: { $ne: 'FAILED' } }).select('totalAmount createdAt orderStatus').lean(),
    ]);

    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Monthly analytics for Recharts
    const monthsMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthsMap[key] = { revenue: 0, orders: 0 };
    }

    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (monthsMap[key]) {
        monthsMap[key].revenue += o.totalAmount || 0;
        monthsMap[key].orders += 1;
      }
    });

    const monthlyTrends = Object.keys(monthsMap).map((m) => ({
      name: m,
      revenue: monthsMap[m].revenue,
      orders: monthsMap[m].orders,
    }));

    return apiSuccess({
      stats: {
        totalUsers,
        totalSellers,
        pendingSellers,
        totalProducts,
        totalOrders,
        totalSales,
      },
      monthlyTrends,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return apiError(error.message || 'Failed to fetch admin stats', 500);
  }
}
