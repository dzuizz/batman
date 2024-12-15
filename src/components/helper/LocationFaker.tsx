import { useState } from 'react';
import { useLocation } from '@/context/LocationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, RotateCcw } from 'lucide-react';

export const LocationFaker = () => {
    const { setFakeLocation, resetToRealLocation, location } = useLocation();
    const [lat, setLat] = useState(location?.latitude?.toString() || '');
    const [lng, setLng] = useState(location?.longitude?.toString() || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        if (isNaN(latitude) || isNaN(longitude)) {
            return;
        }

        // Basic validation for Indonesian coordinates
        if (latitude < -11 || latitude > 6 || longitude < 95 || longitude > 141) {
            alert('Please enter coordinates within Indonesia');
            return;
        }

        setFakeLocation(latitude, longitude);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Input
                        type="number"
                        step="any"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        placeholder="Latitude (-11 to 6)"
                        className="w-full"
                    />
                    <Input
                        type="number"
                        step="any"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        placeholder="Longitude (95 to 141)"
                        className="w-full"
                    />
                </div>
                <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        Set Location
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={resetToRealLocation}
                        className="flex-1"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                </div>
            </form>
        </div>
    );
}; 