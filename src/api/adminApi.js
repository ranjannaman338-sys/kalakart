import api from './axios';

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard').then((res) => res.data),
  getUsers: (params) => api.get('/admin/users', { params }).then((res) => res.data),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data).then((res) => res.data),
  getSellers: (params) => api.get('/admin/sellers', { params }).then((res) => res.data),
  updateSellerStatus: (id, data) => api.patch(`/admin/sellers/${id}`, data).then((res) => res.data),
  getProducts: (params) => api.get('/admin/products', { params }).then((res) => res.data),
  updateProductStatus: (id, status) => api.patch(`/admin/products/${id}/status`, { status }).then((res) => res.data),
  getOrders: (params) => api.get('/admin/orders', { params }).then((res) => res.data),
  updateOrderStatus: (id, data) => api.patch(`/orders/${id}`, data).then((res) => res.data),
  getCategories: () => api.get('/categories').then((res) => res.data),
  createCategory: (data) => api.post('/categories', data).then((res) => res.data),
  updateCategory: (id, data) => api.patch(`/categories/${id}`, data).then((res) => res.data),
  deleteCategory: (id) => api.delete(`/categories/${id}`).then((res) => res.data),
  getCoupons: () => api.get('/admin/coupons').then((res) => res.data),
  createCoupon: (data) => api.post('/admin/coupons', data).then((res) => res.data),
  updateCoupon: (id, data) => api.patch(`/admin/coupons/${id}`, data).then((res) => res.data),
};
