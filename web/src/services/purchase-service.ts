import api from './api';
import { IProduct } from './product-service';

export interface IPurchaseItem {
  product: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
}

export interface ICreatePurchase {
  invoiceNumber: string;
  supplier: string;
  items: IPurchaseItem[];
}

export interface IPurchase {
  _id: string;
  invoiceNumber: string;
  supplier: string;
  items: Array<{
    product: IProduct;
    quantity: number;
    purchasePrice: number;
    salePrice: number;
  }>;
  total: number;
  status: 'completed' | 'cancelled' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface IPurchaseReport {
  totalPurchases: number;
  totalItems: number;
  purchaseCount: number;
  purchases: IPurchase[];
}

const purchaseService = {
  create: async (purchase: ICreatePurchase) => {
    const response = await api.post('/purchases', purchase);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/purchases');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  },

  update: async (id: string, purchase: Partial<ICreatePurchase>) => {
    const response = await api.put(`/purchases/${id}`, purchase);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/purchases/${id}`);
    return response.data;
  },

  getReport: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/purchases/report?${params.toString()}`);
    return response.data;
  }
};

export default purchaseService;
