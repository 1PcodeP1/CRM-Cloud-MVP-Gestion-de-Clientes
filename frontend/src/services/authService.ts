// frontend/src/services/authService.ts
import axios from 'axios';
import { AuthResponse, RegisterResponse } from '../types/auth';
import { LoginFormValues } from '../schemas/loginSchema';
import { RegisterFormValues } from '../schemas/registerSchema';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authService = {
    async register(data: RegisterFormValues): Promise<RegisterResponse> {
        try {
            const response = await api.post<RegisterResponse>('/auth/register', data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                const messages = error.response.data.message;
                const msg = Array.isArray(messages) ? messages[0] : messages;
                throw new Error(msg || 'No fue posible crear la cuenta. Por favor intenta de nuevo más tarde');
            }
            throw new Error('No fue posible crear la cuenta. Por favor intenta de nuevo más tarde');
        }
    },

    async login(data: LoginFormValues): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/auth/login', data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                // If it's an array of messages (like class-validator validation errors)
                const messages = error.response.data.message;
                const msg = Array.isArray(messages) ? messages[0] : messages;
                throw new Error(msg || 'El correo o la contraseña son incorrectos');
            }
            throw new Error('El correo o la contraseña son incorrectos');
        }
    }
};
