import api from './axios';

export const categoryApi = {
  getCategories: () => api.get('/categories').then((res) => res.data),
  getCategory: (id) => api.get(`/categories/${id}`).then((res) => res.data),
};
