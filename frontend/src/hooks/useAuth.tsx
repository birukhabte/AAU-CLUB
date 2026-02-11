"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '@/types';
import api from '@/lib/axios';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    logout: () => void;
    register: (data: any) => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/auth/profile');
                    setUser(data.data);
                } catch (error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: any) => {
        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/login', credentials);
            localStorage.setItem('token', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            setUser(data.data.user);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (credentials: any) => {
        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/register', credentials);
            localStorage.setItem('token', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            setUser(data.data.user);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
        window.location.href = '/login';
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, register, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
