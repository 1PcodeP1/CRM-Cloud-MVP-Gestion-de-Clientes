// frontend/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, AuthResponse } from '../types/auth';
import { useNavigate } from 'react-router-dom';

let globalUser: User | null = null;
let globalToken: string | null = null;
let listeners: Array<() => void> = [];

const notifyListeners = () => {
    listeners.forEach(listener => listener());
};

export const useAuth = () => {
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
        notifyListeners();
    };

    const logout = (message?: string) => {
        globalUser = null;
        globalToken = null;
        notifyListeners();
        navigate('/login', { replace: true, state: { message: message || 'Tu sesión ha expirado. Por favor ingresa de nuevo' } });
    };

    return { user, token, setAuth, logout, isAuthenticated: !!globalToken };
};
