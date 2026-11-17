import api from './axios';

export const cartApi = {
  getCart: () => api.get('/cart').then((res) => res.data),
  addItem: (productId, quantity = 1) => api.post('/cart/items', { productId, quantity }).then((res) => res.data),
  updateQuantity: (productId, quantity) => api.patch(`/cart/items/${productId}`, { quantity }).then((res) => res.data),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`).then((res) => res.data),
  clearCart: () => api.delete('/cart').then((res) => res.data),
  mergeCart: (items) => api.post('/cart/merge', { items }).then((res) => res.data),
};
