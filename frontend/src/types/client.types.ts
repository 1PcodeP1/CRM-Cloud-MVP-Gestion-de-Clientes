export enum ClientStatus {
  ACTIVE = 'Activo',
  PROSPECT = 'Prospecto',
  INACTIVE = 'Inactivo',
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  status: ClientStatus;
}

export interface ClientsResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}
