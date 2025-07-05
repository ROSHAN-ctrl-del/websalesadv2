import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on a login page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/super-admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string; role: string }) =>
    api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
};

// Users API
export const usersAPI = {
  getSalesAdmins: () => api.get('/sales-admins'),
  createSalesAdmin: (data: any) => api.post('/sales-admins', data),
  updateSalesAdmin: (id: string, data: any) => api.put(`/sales-admins/${id}`, data),
  deleteSalesAdmin: (id: string) => api.delete(`/sales-admins/${id}`),
  
  getSalesPersons: () => api.get('/sales-persons'),
  createSalesPerson: (data: any) => api.post('/sales-persons', data),
  updateSalesPerson: (id: string, data: any) => api.put(`/sales-persons/${id}`, data),
  deleteSalesPerson: (id: string) => api.delete(`/sales-persons/${id}`),
};

// Stock API
export const stockAPI = {
  getStock: () => api.get('/stock'),
  createProduct: (data: any) => api.post('/stock', data),
  updateProduct: (id: string, data: any) => api.put(`/stock/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/stock/${id}`),
  getLowStockAlerts: () => api.get('/stock/alerts'),
};

// Sales API
export const salesAPI = {
  getSales: (params?: any) => api.get('/sales', { params }),
  createSale: (data: any) => api.post('/sales', data),
  updateSale: (id: string, data: any) => api.put(`/sales/${id}`, data),
  deleteSale: (id: string) => api.delete(`/sales/${id}`),
  getSalesStats: () => api.get('/sales/stats'),
};

// Reports API
export const reportsAPI = {
  getSalesReport: (params: any) => api.get('/reports/sales', { params }),
  getStockReport: (params: any) => api.get('/reports/stock', { params }),
  getUserActivityReport: (params: any) => api.get('/reports/activity', { params }),
  exportReport: (type: string, params: any) => api.get(`/reports/export/${type}`, { params, responseType: 'blob' }),
};

// Customers API
export const customersAPI = {
  getCustomers: () => api.get('/customers'),
  createCustomer: (data: any) => api.post('/customers', data),
  updateCustomer: (id: string, data: any) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id: string) => api.delete(`/customers/${id}`),
};

export default api;