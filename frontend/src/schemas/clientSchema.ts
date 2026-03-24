import { z } from 'zod';
import { ClientStatus } from '../types/client.types';

export const createClientSchema = z.object({
  firstName: z.string().min(1, 'Este campo es obligatorio'),
  lastName: z.string().min(1, 'Este campo es obligatorio'),
  company: z.string().min(1, 'Este campo es obligatorio'),
  email: z.string().min(1, 'Este campo es obligatorio').email('Ingresa una dirección de correo válida'),
  phone: z.string().min(1, 'Este campo es obligatorio').length(10, 'El teléfono debe tener 10 dígitos'),
  status: z.nativeEnum(ClientStatus, {
    errorMap: () => ({ message: 'Este campo es obligatorio' })
  }),
});

export type CreateClientFormData = z.infer<typeof createClientSchema>;
