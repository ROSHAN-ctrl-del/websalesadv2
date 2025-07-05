import axios from 'axios';

const API_URL = 'http://localhost:3002';

export interface StockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export const getStockItems = async (): Promise<StockItem[]> => {
  const response = await axios.get(`${API_URL}/stockItems`);
  return response.data;
};

export const getStockItem = async (id: string): Promise<StockItem> => {
  const response = await axios.get(`${API_URL}/stockItems/${id}`);
  return response.data;
};

export const createStockItem = async (item: Omit<StockItem, 'id' | 'status' | 'totalValue' | 'lastUpdated'>): Promise<StockItem> => {
  const totalValue = item.currentStock * item.unitPrice;
  const status = calculateStatus(item.currentStock, item.minStock);
  const lastUpdated = new Date().toISOString();
  
  const response = await axios.post(`${API_URL}/stockItems`, {
    ...item,
    totalValue,
    status,
    lastUpdated
  });
  
  return response.data;
};

export const updateStockItem = async (id: string, item: Omit<StockItem, 'id' | 'status' | 'totalValue' | 'lastUpdated'>): Promise<StockItem> => {
  const totalValue = item.currentStock * item.unitPrice;
  const status = calculateStatus(item.currentStock, item.minStock);
  const lastUpdated = new Date().toISOString();
  
  const response = await axios.put(`${API_URL}/stockItems/${id}`, {
    ...item,
    id,
    totalValue,
    status,
    lastUpdated
  });
  
  return response.data;
};

export const deleteStockItem = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/stockItems/${id}`);
};

const calculateStatus = (current: number, min: number): 'in_stock' | 'low_stock' | 'out_of_stock' => {
  if (current <= 0) return 'out_of_stock';
  if (current <= min) return 'low_stock';
  return 'in_stock';
};
