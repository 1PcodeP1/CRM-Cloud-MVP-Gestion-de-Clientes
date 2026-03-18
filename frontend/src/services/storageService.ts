// frontend/src/services/storageService.ts
import { User } from '../types/auth';

const TOKEN_KEY = 'crm_token';
const USER_KEY = 'crm_user';
const TIMESTAMP_KEY = 'crm_timestamp';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

export const storageService = {
    saveAuth(token: string, user: User): void {
        const timestamp = Date.now();
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(TIMESTAMP_KEY, timestamp.toString());
    },

    getAuth(): { token: string | null; user: User | null; isExpired: boolean } {
        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);
        const timestampStr = localStorage.getItem(TIMESTAMP_KEY);

        if (!token || !userStr || !timestampStr) {
            return { token: null, user: null, isExpired: false };
        }

        const timestamp = parseInt(timestampStr, 10);
        const now = Date.now();
        const isExpired = (now - timestamp) > SESSION_DURATION;

        if (isExpired) {
            this.clearAuth();
            return { token: null, user: null, isExpired: true };
        }

        try {
            const user = JSON.parse(userStr) as User;
            return { token, user, isExpired: false };
        } catch {
            this.clearAuth();
            return { token: null, user: null, isExpired: false };
        }
    },
    
    clearAuth(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TIMESTAMP_KEY);
    },

    hasAuth(): boolean {
        return !!localStorage.getItem(TOKEN_KEY);
    }
};
