import api from './axios';

export const couponApi = {
  validateCoupon: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }).then((res) => res.data),
};

export const reviewApi = {
  submitReview: (data) => api.post('/reviews', data).then((res) => res.data),
};

export const newsletterApi = {
  subscribe: (email) => api.post('/newsletter', { email }).then((res) => res.data),
};
