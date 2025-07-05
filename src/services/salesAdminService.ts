import axios from 'axios';

// Pick base URL from environment so that we can easily switch between dev/staging/prod
// Vite: use `VITE_API_BASE_URL`, CRA: use `REACT_APP_API_BASE_URL`
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  'http://localhost:5000';

const API_URL = `${API_BASE_URL}/api/sales-admins`;

interface SalesAdmin {
  id?: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  status?: 'active' | 'inactive';
  lastLogin?: string;
  password?: string;
}

export const getSalesAdmins = async (token: string) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getSalesAdmin = async (id: string, token: string) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createSalesAdmin = async (admin: SalesAdmin, token: string) => {
  const response = await axios.post(API_URL, admin, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateSalesAdmin = async (id: string, admin: Partial<SalesAdmin>, token: string) => {
  const response = await axios.put(`${API_URL}/${id}`, admin, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteSalesAdmin = async (id: string, token: string) => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const toggleSalesAdminStatus = async (id: string, currentStatus: 'active' | 'inactive', token: string) => {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  const response = await axios.patch(
    `${API_URL}/${id}/status`,
    { status: newStatus },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
