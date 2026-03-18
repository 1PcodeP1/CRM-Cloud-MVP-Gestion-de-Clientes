// frontend/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, AuthResponse } from '../types/auth';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';

let globalUser: User | null = null;
let globalToken: string | null = null;
let isInitialized = false;
let listeners: Array<() => void> = [];

const notifyListeners = () => {
    listeners.forEach(listener => listener());
};

// Inicializar desde localStorage
const initializeAuth = () => {
    if (isInitialized) return;
    const { token, user, isExpired } = storageService.getAuth();
    if (!isExpired && token && user) {
        globalToken = token;
        globalUser = user;
    }
    isInitialized = true;
};

export const useAuth = () => {
    // Inicializar antes de crear el estado
    initializeAuth();

    const [user, setUser] = useState<User | null>(globalUser);
    const [token, setToken] = useState<string | null>(globalToken);
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthChange = () => {
            setUser(globalUser);
            setToken(globalToken);
        };

        listeners.push(handleAuthChange);
        return () => {
            listeners = listeners.filter(l => l !== handleAuthChange);
        };
    }, []);

    const setAuth = (authData: AuthResponse) => {
        globalUser = authData.user;
        globalToken = authData.access_token;
        storageService.saveAuth(authData.access_token, authData.user);
        notifyListeners();
    };

    //El JWT es eliminado del almacenamiento del navegador (localStorage) y el estado de autenticación se restablece. Luego, el usuario es redirigido a la página de inicio de sesión con un mensaje opcional.
    const logout = (message?: string, isSuccess: boolean = false) => {
        globalUser = null;
        globalToken = null;
        storageService.clearAuth();
        notifyListeners();
        navigate('/login', { 
            replace: true, 
            state: { 
                message,
                type: isSuccess ? 'success' : 'error'
            } 
        });
    };

    const checkSessionExpiration = (): boolean => {
        const { isExpired } = storageService.getAuth();
        if (isExpired && globalToken) {
            logout('Tu sesión ha expirado. Por favor ingresa de nuevo', false);
            return true;
        }
        return false;
    };

    return { 
        user, 
        token, 
        setAuth, 
        logout, 
        checkSessionExpiration,
        isAuthenticated: !!globalToken 
    };
};
