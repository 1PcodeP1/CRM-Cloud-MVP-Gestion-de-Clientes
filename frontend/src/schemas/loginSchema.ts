// frontend/src/schemas/loginSchema.ts
import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().min(1, 'Este campo es obligatorio').email('Ingresa una dirección de correo válida'),
    password: z.string().min(1, 'Este campo es obligatorio')
});

export type LoginFormValues = z.infer<typeof loginSchema>;
