// frontend/src/schemas/registerSchema.ts
import { z } from 'zod';

export const registerSchema = z.object({
    firstName: z.string().min(1, 'Este campo es obligatorio').max(100, 'Máximo 100 caracteres'),
    lastName: z.string().min(1, 'Este campo es obligatorio').max(100, 'Máximo 100 caracteres'),
    email: z.string().min(1, 'Este campo es obligatorio').email('Ingresa una dirección de correo válida').max(255, 'Máximo 255 caracteres'),
    phone: z.string()
        .min(1, 'Este campo es obligatorio')
        .length(10, 'El teléfono debe tener exactamente 10 dígitos numéricos')
        .regex(/^[0-9]+$/, 'Solo se permiten números'),
    company: z.string().min(1, 'Este campo es obligatorio').max(150, 'Máximo 150 caracteres'),
    industry: z.enum(['Tecnología', 'Comercio', 'Servicios', 'Educación', 'Salud'], {
        errorMap: () => ({ message: 'Este campo es obligatorio' })
    }),
    password: z.string()
        .min(1, 'Este campo es obligatorio')
        .min(8, 'Mínimo 8 caracteres')
        .max(255, 'Máximo 255 caracteres')
        .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'La contraseña debe tener al menos 1 letra y 1 número'),
    confirmPassword: z.string().min(1, 'Este campo es obligatorio')
}).superRefine((data, ctx) => {
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Las contraseñas no coinciden',
            path: ['confirmPassword'],
        });
    }
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
