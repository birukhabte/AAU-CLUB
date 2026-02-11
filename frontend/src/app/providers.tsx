"use client";

import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <Toaster position="top-right" />
            {children}
        </AuthProvider>
    );
}
