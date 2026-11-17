import api from './axios';

export const sellerApi = {
  apply: (data) => api.post('/seller/apply', data).then((res) => res.data),
  getProfile: () => api.get('/seller/profile').then((res) => res.data),
  updateProfile: (data) => api.patch('/seller/profile', data).then((res) => res.data),
  getDashboard: () => api.get('/seller/dashboard').then((res) => res.data),
  getProducts: () => api.get('/seller/products').then((res) => res.data),
  getOrders: () => api.get('/seller/orders').then((res) => res.data),
  updateFulfillmentStatus: (id, data) => api.patch(`/seller/fulfillments/${id}/status`, data).then((res) => res.data),
  getArtisans: () => api.get('/artisans').then((res) => res.data),
  getArtisanDetail: (slug) => api.get(`/artisans/${slug}`).then((res) => res.data),
};
