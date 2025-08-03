import api from './api';

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCategory {
  name: string;
  description?: string;
  color: string;
}

const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (category: ICreateCategory) => {
    const response = await api.post('/categories', category);
    return response.data;
  },

  update: async (id: string, category: Partial<ICreateCategory>) => {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export default categoryService;
