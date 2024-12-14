import roadsData from '@/data/infrastructure/roads.json';
import waterData from '@/data/infrastructure/water.json';
import powerData from '@/data/infrastructure/power.json';

export type InfrastructureType = 'roads' | 'water' | 'power';

// Add error handling and validation
export function getInfrastructureData(type: InfrastructureType) {
    try {
        switch (type) {
            case 'roads':
                if (!roadsData?.roads?.major_highways) throw new Error('Invalid roads data structure');
                return roadsData.roads;
            case 'water':
                if (!waterData?.water_network?.main_pipelines) throw new Error('Invalid water data structure');
                return waterData.water_network;
            case 'power':
                if (!powerData?.power_grid?.substations) throw new Error('Invalid power data structure');
                return powerData.power_grid;
            default:
                return null;
        }
    } catch (error) {
        console.error('Error getting infrastructure data:', error);
        return null;
    }
}

export function getNearbyInfrastructure(
    type: InfrastructureType,
    latitude: number,
    longitude: number,
    radius: number = 5 // km
) {
    try {
        // Validate inputs
        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
            throw new Error('Invalid coordinates');
        }

        if (radius <= 0) {
            throw new Error('Radius must be positive');
        }

        const data = getInfrastructureData(type);
        if (!data) return null;

        // Helper function to calculate distance between two points
        const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371; // Earth's radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        // Filter infrastructure based on distance with validation
        const filterByDistance = (item: any) => {
            try {
                if (Array.isArray(item.coordinates)) {
                    return item.coordinates.some((coord: any) => {
                        if (!coord?.lat || !coord?.lng) return false;
                        return getDistance(latitude, longitude, coord.lat, coord.lng) <= radius;
                    });
                } else if (item.location?.lat && item.location?.lng) {
                    return getDistance(latitude, longitude, item.location.lat, item.location.lng) <= radius;
                }
                return false;
            } catch (error) {
                console.error('Error filtering distance:', error);
                return false;
            }
        };

        // Apply filters based on infrastructure type with validation
        switch (type) {
            case 'roads': {
                const roadsData = data as { major_highways?: any[]; arterial_roads?: any[] };
                if (!roadsData.major_highways || !roadsData.arterial_roads) {
                    throw new Error('Invalid roads data structure');
                }
                return {
                    major_highways: roadsData.major_highways.filter(filterByDistance),
                    arterial_roads: roadsData.arterial_roads.filter(filterByDistance)
                };
            }
            case 'water': {
                const waterData = data as { main_pipelines?: any[]; treatment_plants?: any[] };
                if (!waterData.main_pipelines || !waterData.treatment_plants) {
                    throw new Error('Invalid water data structure');
                }
                return {
                    main_pipelines: waterData.main_pipelines.filter(filterByDistance),
                    treatment_plants: waterData.treatment_plants.filter(filterByDistance)
                };
            }
            case 'power': {
                const powerData = data as { substations?: any[]; transmission_lines?: any[] };
                if (!powerData.substations || !powerData.transmission_lines) {
                    throw new Error('Invalid power data structure');
                }
                return {
                    substations: powerData.substations.filter(filterByDistance),
                    transmission_lines: powerData.transmission_lines.filter(filterByDistance)
                };
            }
            default:
                return null;
        }
    } catch (error) {
        console.error('Error getting nearby infrastructure:', error);
        return null;
    }
}