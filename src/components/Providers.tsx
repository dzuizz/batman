'use client';

import { ThemeProvider } from 'next-themes';
import { LocationProvider } from '@/context/LocationContext';
import { ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
        >
            <LocationProvider>
                {children}
            </LocationProvider>
        </ThemeProvider>
    );
} 