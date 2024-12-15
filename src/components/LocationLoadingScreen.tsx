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

            const options = {
                enableHighAccuracy: true,
                timeout: 15000,        // 15 seconds timeout
                maximumAge: 0,        // Force fresh location
            };

            let retryCount = 0;
            const maxRetries = 3;

            const attemptLocationFetch = () => {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
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
                        } catch (error) {
                            console.error('Error fetching region information:', error);
                            handleLocationError(new Error('Failed to get region information'));
                        }
                    },
                    (error) => {
                        if (retryCount < maxRetries) {
                            retryCount++;
                            setTimeout(attemptLocationFetch, 2000); // Retry after 2 seconds
                            return;
                        }
                        handleLocationError(error);
                    },
                    options
                );
            };

            const handleLocationError = (error: GeolocationPositionError | Error) => {
                let errorMessage = 'An unknown error occurred';

                if (error instanceof GeolocationPositionError) {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Please allow location access to use this feature';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is temporarily unavailable. Please try again.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out. Please check your connection and try again';
                            break;
                    }
                } else {
                    errorMessage = error.message;
                }

                setError(errorMessage);
                setIsLoading(false);
            };

            attemptLocationFetch();
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