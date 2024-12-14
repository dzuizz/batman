import { LocationData } from '@/types/infrastructure';

interface LocationHeaderProps {
    location: LocationData | null;
}

export const LocationHeader = ({ location }: LocationHeaderProps) => {
    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-violet-950 dark:text-violet-100">Mahakam AI</h1>
            <div className="space-y-1">
                <p className="text-violet-700 dark:text-violet-300">
                    Location: {location?.latitude.toFixed(4)}°N, {location?.longitude.toFixed(4)}°E
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Region: {location?.regionName || 'Loading...'}
                </p>
            </div>
        </div>
    );
}; 