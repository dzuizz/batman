'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Types
interface LocationData {
    latitude: number;
    longitude: number;
    regionName?: string;
}

interface LocationContextType {
    location: LocationData | null;
    setLocation: (location: LocationData | null) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
}

// Context
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Provider
export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    return (
        <LocationContext.Provider
            value={{
                location,
                setLocation,
                isLoading,
                setIsLoading,
                error,
                setError
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}

// Hook
export function useLocation() {
    const context = useContext(LocationContext);

    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }

    return context;
}
