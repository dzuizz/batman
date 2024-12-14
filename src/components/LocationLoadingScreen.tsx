'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getIndonesianRegion } from '@/utils/geocoding';
import { useLocation } from '@/context/LocationContext';

const LocationLoadingScreen = () => {
    const { setLocation, setError, isLoading, setIsLoading, error } = useLocation();

    useEffect(() => {
        const getLocation = async () => {
            if (!navigator.geolocation) {
                setError('Geolocation is not supported by your browser');
                setIsLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const regionName = await getIndonesianRegion(
                        position.coords.latitude,
                        position.coords.longitude
                    );

                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        regionName
                    });
                    setIsLoading(false);
                },
                (error) => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            setError('Please allow location access to use this feature');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            setError('Location information is unavailable');
                            break;
                        case error.TIMEOUT:
                            setError('Location request timed out');
                            break;
                        default:
                            setError('An unknown error occurred');
                    }
                    setIsLoading(false);
                }
            );
        };

        getLocation();
    }, [setLocation, setError, setIsLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-gray-600 dark:text-gray-400 animate-spin" />
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    Fetching your location...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    return null;
};

export default LocationLoadingScreen;