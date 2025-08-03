import api from './api';
import { IProduct } from './product-service';

export interface ISaleItem {
  product: string;
  quantity: number;
  price: number;
}

export interface ICreateSale {
  items: ISaleItem[];
  paymentMethod: 'cash' | 'card';
}

export interface ISale {
  _id: string;
  invoiceNumber: string;
  items: Array<{
    product: IProduct;
    quantity: number;
    price: number;
  }>;
  total: number;
  seller: string;
  paymentMethod: string;
  status: 'completed' | 'cancelled' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface ISalesReport {
  totalSales: number;
  totalItems: number;
  salesCount: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  sales: ISale[];
}

const saleService = {
  create: async (sale: ICreateSale) => {
    const response = await api.post('/sales', sale);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/sales');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.put(`/sales/${id}`, { status: 'cancelled' });
    return response.data;
  },

  getReport: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/sales/report?${params.toString()}`);
    return response.data;
  }
};

export default saleService;
