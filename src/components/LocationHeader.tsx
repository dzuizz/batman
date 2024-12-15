import { LocationData } from '@/types/infrastructure';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationHeaderProps {
    location: LocationData | null;
}

export const LocationHeader = ({ location }: LocationHeaderProps) => {
    return (
        <div className="mb-8 flex justify-between items-start">
            <div role="banner">
                <h1 className="text-3xl font-bold text-violet-950 dark:text-violet-100">
                    Mahakam AI
                </h1>
                <div className="space-y-1">
                    <p className="text-violet-700 dark:text-violet-300" aria-label="Geographic coordinates">
                        Location: {location?.latitude.toFixed(4)}°N, {location?.longitude.toFixed(4)}°E
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mt-1" aria-label="Region name">
                        Region: {location?.regionName || 'Loading...'}
                    </p>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = '/profile'}
                className="text-gray-600 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 bg-slate-100 dark:bg-slate-600/30 hover:bg-slate-200 dark:hover:bg-slate-500/30 border-2 border-slate-200 dark:border-slate-500 h-10 w-10 rounded-full hover:rotate-90 transition-transform duration-300"
                aria-label="Go to profile settings"
            >
                <Settings className="h-5 w-5" aria-hidden="true" />
            </Button>
        </div>
    );
};
