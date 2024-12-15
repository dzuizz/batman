'use client';

import { getIndonesianRegion } from '@/utils/geocoding';
import { createContext, useContext, useState, ReactNode } from 'react';

// Types
interface LocationData {
    latitude: number;
    longitude: number;
    regionName?: string;
    isFaked?: boolean;
}

interface LocationContextType {
    location: LocationData | null;
    setLocation: (location: LocationData | null) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
    setFakeLocation: (lat: number, lng: number) => void;
    resetToRealLocation: () => void;
}

// Context
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Provider
export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [realLocation, setRealLocation] = useState<LocationData | null>(null);

    const setFakeLocation = async (lat: number, lng: number) => {
        const regionName = await getIndonesianRegion(lat, lng);
        setLocation({
            latitude: lat,
            longitude: lng,
            regionName,
            isFaked: true
        });
    };

    const resetToRealLocation = () => {
        if (realLocation) {
            setLocation(realLocation);
        } else {
            // Re-fetch real location
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const regionName = await getIndonesianRegion(
                        position.coords.latitude,
                        position.coords.longitude
                    );
                    const newLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        regionName
                    };
                    setLocation(newLocation);
                    setRealLocation(newLocation);
                },
                (error) => {
                    setError(`Failed to get real location: ${error.message}`);
                }
            );
        }
    };

    return (
        <LocationContext.Provider
            value={{
                location,
                setLocation,
                isLoading,
                setIsLoading,
                error,
                setError,
                setFakeLocation,
                resetToRealLocation
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