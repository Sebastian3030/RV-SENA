import { api } from './client'

const data = (response) => response.data

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials).then(data),
  register: (payload) => api.post('/auth/register', payload).then(data),
  logout: () => api.post('/auth/logout').then(data),
  me: () => api.get('/auth/me').then(data),
  updateProfile: (payload) => api.put('/auth/profile', payload).then(data),
}

export const menuApi = {
  categories: () => api.get('/categories').then(data),
  products: (params) => api.get('/products', { params }).then(data),
  product: (slug) => api.get(`/products/${slug}`).then(data),
  review: (productId, payload) => api.post(`/products/${productId}/reviews`, payload).then(data),
}

export const favoriteApi = {
  list: () => api.get('/favorites').then(data),
  toggle: (productId) => api.post(`/favorites/${productId}`).then(data),
}

export const orderApi = {
  list: (page = 1) => api.get('/orders', { params: { page } }).then(data),
  create: (payload) => api.post('/orders', payload).then(data),
  show: (code) => api.get(`/orders/${code}`).then(data),
  cancel: (code) => api.post(`/orders/${code}/cancel`).then(data),
  validateCoupon: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }).then(data),
}

export const kitchenApi = {
  orders: () => api.get('/kitchen/orders').then(data),
  updateStatus: (code, status) => api.patch(`/kitchen/orders/${code}/status`, { status }).then(data),
}

/** Envía un producto como multipart; en edición usa _method=PUT porque PHP no lee archivos en PUT. */
const productForm = (values, method) => {
  const form = new FormData()
  Object.entries(values).forEach(([key, value]) => {
    // '' se envía para poder borrar un campo opcional (Laravel lo convierte en null).
    if (value === null || value === undefined) return
    form.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value)
  })
  if (method) form.append('_method', method)
  return form
}

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard').then(data),

  products: (params) => api.get('/admin/products', { params }).then(data),
  createProduct: (values) => api.post('/admin/products', productForm(values)).then(data),
  updateProduct: (id, values) => api.post(`/admin/products/${id}`, productForm(values, 'PUT')).then(data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`).then(data),

  categories: () => api.get('/admin/categories').then(data),
  createCategory: (values) => api.post('/admin/categories', values).then(data),
  updateCategory: (id, values) => api.put(`/admin/categories/${id}`, values).then(data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`).then(data),

  coupons: () => api.get('/admin/coupons').then(data),
  createCoupon: (values) => api.post('/admin/coupons', values).then(data),
  updateCoupon: (id, values) => api.put(`/admin/coupons/${id}`, values).then(data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`).then(data),

  orders: (params) => api.get('/admin/orders', { params }).then(data),
  users: (params) => api.get('/admin/users', { params }).then(data),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }).then(data),
}
