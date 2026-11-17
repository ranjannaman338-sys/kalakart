import api from './axios';

export const productApi = {
  getProducts: (params) => api.get('/products', { params }).then((res) => res.data),
  getProduct: (id) => api.get(`/products/${id}`).then((res) => res.data),
  getFeatured: () => api.get('/products/featured').then((res) => res.data),
  getRelated: (id) => api.get(`/products/related/${id}`).then((res) => res.data),
  createProduct: (data) => api.post('/products', data).then((res) => res.data),
  updateProduct: (id, data) => api.patch(`/products/${id}`, data).then((res) => res.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then((res) => res.data),
  uploadImage: (data) => api.post('/upload', data).then((res) => res.data),
};
