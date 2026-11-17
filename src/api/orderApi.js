import api from './axios';

export const orderApi = {
  validateCheckout: (data) => api.post('/checkout/validate', data).then((res) => res.data),
  createOrder: (data) => api.post('/orders', data).then((res) => res.data),
  getOrders: () => api.get('/orders').then((res) => res.data),
  getOrder: (id) => api.get(`/orders/${id}`).then((res) => res.data),
  cancelOrder: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }).then((res) => res.data),
  createRazorpayOrder: (orderId) => api.post('/payments/razorpay/create-order', { orderId }).then((res) => res.data),
  verifyRazorpayPayment: (data) => api.post('/payments/razorpay/verify', data).then((res) => res.data),
};
