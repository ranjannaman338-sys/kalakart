import api from './axios';

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist').then((res) => res.data),
  toggleWishlist: (productId) => api.post('/wishlist', { productId }).then((res) => res.data),
  removeItem: (productId) => api.delete(`/wishlist/${productId}`).then((res) => res.data),
};
