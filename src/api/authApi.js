import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((res) => res.data),
  login: (data) => api.post('/auth/login', data).then((res) => res.data),
  logout: () => api.post('/auth/logout').then((res) => res.data),
  getMe: () => api.get('/auth/me').then((res) => res.data),
  updateProfile: (data) => api.patch('/auth/profile', data).then((res) => res.data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data).then((res) => res.data),
  resetPassword: (data) => api.post('/auth/reset-password', data).then((res) => res.data),
  getAddresses: () => api.get('/auth/address').then((res) => res.data),
  addAddress: (data) => api.post('/auth/address', data).then((res) => res.data),
  deleteAddress: (id) => api.delete(`/auth/address/${id}`).then((res) => res.data),
  setDefaultAddress: (id) => api.patch(`/auth/address/${id}`, { setDefault: true }).then((res) => res.data),
};
