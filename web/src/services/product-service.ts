import api from './api';

export interface IProduct {
  _id: string;
  name: string;
  purchasePrice: number;
  price: number;
  tva?: number;
  stock: number;
  barcode?: string;
  ref?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateProduct {
  name: string;
  purchasePrice: number;
  price: number;
  tva?: number;
  stock?: number;
  barcode?: string;
  ref?: string;
}

const productService = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (product: ICreateProduct) => {
    const response = await api.post('/products', product);
    return response.data;
  },

  update: async (id: string, product: Partial<ICreateProduct>) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getByBarcode: async (barcode: string) => {
    const response = await api.get(`/products/barcode/${barcode}`);
    return response.data;
  },

  updateStock: async (id: string, quantity: number) => {
    const response = await api.put(`/products/${id}/stock`, { quantity });
    return response.data;
  }
};

export default productService;
