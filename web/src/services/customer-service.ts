import api from './api';

export interface ICustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  seller: any;
  createdAt: string;
  updatedAt: string;
}

const customerService = {
  getBySeller: async () => {
    const response = await api.get('/customers/me');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  update: async (id: string, customer: any) => {
    const response = await api.put(`/customers/${id}`, customer);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

export default customerService;
