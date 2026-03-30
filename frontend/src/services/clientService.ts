import axios from 'axios';
import { Client, ClientsResponse, CreateClientData } from '../types/client.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const clientService = {
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ClientsResponse> {
    try {
      const response = await api.get<ClientsResponse>('/clients', { params });
      return response.data;
    } catch (error) {
      throw new Error('No fue posible cargar la lista de clientes');
    }
  },

  async createClient(data: CreateClientData): Promise<Client> {
    try {
      const response = await api.post<Client>('/clients', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        const msg = error.response.data.message;
        throw new Error(Array.isArray(msg) ? msg[0] : msg);
      }
      throw new Error('No fue posible crear el cliente. Por favor intenta de nuevo más tarde');
    }
  },

  async getClientById(id: string): Promise<Client> {
    try {
      const response = await api.get<Client>(`/clients/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Este cliente no existe');
      }
      throw new Error('No fue posible cargar la información del cliente');
    }
  },

  async updateClient(id: string, data: Partial<CreateClientData>): Promise<Client> {
    try {
      const response = await api.put<Client>(`/clients/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        const msg = error.response.data.message;
        throw new Error(Array.isArray(msg) ? msg[0] : msg);
      }
      throw new Error('No fue posible guardar los cambios. Por favor intenta de nuevo');
    }
  },
};
