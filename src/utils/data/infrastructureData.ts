const cache = new Map<string, any>();

import roadsData from '@/../public/data/roads.json';
import waterData from '@/../public/data/water.json';
import powerData from '@/../public/data/power.json';
import governmentData from '@/../public/data/government.json';

import {
    Road,
    Pipeline,
    Substation,
    TransmissionLine,
    GovernmentProject,
    Status,
    ProjectType,
    RoadInfrastructureData,
    WaterInfrastructureData,
    PowerInfrastructureData,
    GovernmentProjectsData,
} from '@/types/infrastructure';

// Add more specific error types
class InfrastructureError extends Error {
    constructor(message: string, public code?: string) {
        super(message);
        this.name = 'InfrastructureError';
    }
}

// Add error codes
const ErrorCodes = {
    INVALID_DATA: 'INVALID_DATA',
    INVALID_COORDINATES: 'INVALID_COORDINATES',
    NO_DATA: 'NO_DATA',
} as const;

// Utility type for infrastructure data returns
type InfrastructureReturn = {
    roads: RoadInfrastructureData;
    water: WaterInfrastructureData;
    power: PowerInfrastructureData;
    government: GovernmentProjectsData;
}

// Main functions
export function getInfrastructureData(type: keyof InfrastructureReturn): InfrastructureReturn[keyof InfrastructureReturn] {
    const cacheKey = `infra_${type}`;

    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    try {
        switch (type) {
            case 'roads':
                if (!roadsData?.major_highways || !roadsData?.arterial_roads) {
                    throw new InfrastructureError('Invalid roads data structure');
                }
                return {
                    major_highways: roadsData.major_highways.map(h => ({
                        ...h,
                        status: validateStatus(h.status),
                        coordinates: validateCoordinatesArray(h.coordinates)
                    })),
                    arterial_roads: roadsData.arterial_roads.map(h => ({
                        ...h,
                        status: validateStatus(h.status),
                        coordinates: validateCoordinatesArray(h.coordinates)
                    }))
                };
            case 'water':
                if (!waterData?.main_pipelines || !waterData?.treatment_plants) {
                    throw new InfrastructureError('Invalid water data structure');
                }
                return {
                    main_pipelines: waterData.main_pipelines.map(p => ({
                        ...p,
                        status: validateStatus(p.status),
                        coordinates: validateCoordinatesArray(p.coordinates)
                    })),
                    treatment_plants: waterData.treatment_plants.map(t => ({
                        ...t,
                        status: validateStatus(t.status),
                        coordinates: validateCoordinatesArray(t.coordinates)
                    }))
                };
            case 'power':
                if (!powerData?.substations || !powerData?.transmission_lines) {
                    throw new InfrastructureError('Invalid power data structure');
                }
                return {
                    substations: powerData.substations.map(s => ({
                        ...s,
                        status: validateStatus(s.status),
                        coordinates: validateCoordinatesArray(s.coordinates),
                        voltage: s.voltage
                    })),
                    transmission_lines: powerData.transmission_lines.map(t => ({
                        ...t,
                        status: validateStatus(t.status),
                        voltage: t.voltage,
                        coordinates: validateCoordinatesArray(t.coordinates)
                    }))
                };
            case 'government':
                if (!governmentData?.big_projects || !governmentData?.small_projects) {
                    throw new InfrastructureError('Invalid government data structure');
                }
                return {
                    big_projects: governmentData.big_projects.map(p => ({
                        ...p,
                        status: validateStatus(p.status),
                        type: validateProjectType(p.type),
                        coordinates: validateCoordinatesArray(p.coordinates),
                    })),
                    small_projects: governmentData.small_projects.map(p => ({
                        ...p,
                        status: validateStatus(p.status),
                        type: validateProjectType(p.type),
                        coordinates: validateCoordinatesArray(p.coordinates),
                    }))
                };
            default:
                throw new InfrastructureError(`Unsupported infrastructure type: ${type}`);
        }
    } catch (error) {
        console.error('Error getting infrastructure data:', error);
        throw error instanceof InfrastructureError
            ? error
            : new InfrastructureError('Failed to get infrastructure data', ErrorCodes.INVALID_DATA);
    }
}

export function getNearbyInfrastructure(
    type: keyof InfrastructureReturn,
    latitude: number,
    longitude: number,
    radius: number = 50 // km
): InfrastructureReturn[keyof InfrastructureReturn] {
    try {
        // Validate inputs first
        if (!type) {
            throw new InfrastructureError('Infrastructure type is required', ErrorCodes.INVALID_DATA);
        }

        validateCoordinates(latitude, longitude);
        validateRadius(radius);

        const data = getInfrastructureData(type);

        // Add null check for data
        if (!data) {
            throw new InfrastructureError('No data available', ErrorCodes.NO_DATA);
        }

        // Optimized distance calculation using Haversine formula
        const getDistance = (lat2: number, lng2: number): number => {
            const R = 6371; // Earth's radius in km
            const lat1 = latitude * Math.PI / 180;
            const lat2Rad = lat2 * Math.PI / 180;
            const dLat = lat2Rad - lat1;
            const dLon = (lng2 - longitude) * Math.PI / 180;

            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2Rad) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

            return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
        };

        const isPointInRadius = (lat: number, lng: number): boolean => {
            return getDistance(lat, lng) <= radius;
        };

        const filterByDistance = (item: Road | Pipeline | Substation | TransmissionLine | GovernmentProject): boolean => {
            try {
                if (!item || typeof item !== 'object') {
                    return false;
                }

                if ('coordinates' in item && Array.isArray(item.coordinates)) {
                    return item.coordinates.some(coord => {
                        if (!coord || typeof coord.lat !== 'number' || typeof coord.lng !== 'number') {
                            return false;
                        }
                        return isPointInRadius(coord.lat, coord.lng);
                    });
                }
                return false;
            } catch {
                return false;
            }
        };

        switch (type) {
            case 'roads': {
                const roadsData = data as RoadInfrastructureData;
                if (!roadsData.major_highways || !roadsData.arterial_roads) {
                    throw new InfrastructureError('Invalid roads data structure', ErrorCodes.INVALID_DATA);
                }
                return {
                    major_highways: roadsData.major_highways.filter(filterByDistance),
                    arterial_roads: roadsData.arterial_roads.filter(filterByDistance)
                };
            }
            case 'water': {
                const waterData = data as WaterInfrastructureData;
                if (!waterData.main_pipelines || !waterData.treatment_plants) {
                    throw new InfrastructureError('Invalid water data structure', ErrorCodes.INVALID_DATA);
                }
                return {
                    main_pipelines: waterData.main_pipelines.filter(filterByDistance),
                    treatment_plants: waterData.treatment_plants.filter(filterByDistance)
                };
            }
            case 'power': {
                const powerData = data as PowerInfrastructureData;
                if (!powerData.substations || !powerData.transmission_lines) {
                    throw new InfrastructureError('Invalid power data structure', ErrorCodes.INVALID_DATA);
                }
                return {
                    substations: powerData.substations.filter(filterByDistance),
                    transmission_lines: powerData.transmission_lines.filter(filterByDistance)
                };
            }
            case 'government': {
                const govData = data as GovernmentProjectsData;
                if (!govData.big_projects || !govData.small_projects) {
                    throw new InfrastructureError('Invalid government data structure', ErrorCodes.INVALID_DATA);
                }
                return {
                    big_projects: govData.big_projects.filter(filterByDistance),
                    small_projects: govData.small_projects.filter(filterByDistance)
                };
            }
            default:
                throw new InfrastructureError(`Unsupported infrastructure type: ${type}`);
        }
    } catch (error) {
        console.error('Error getting nearby infrastructure:', error);
        if (error instanceof InfrastructureError) {
            throw error;
        }
        throw new InfrastructureError('Failed to get nearby infrastructure', ErrorCodes.INVALID_DATA);
    }
}

// Validation functions
function validateCoordinates(lat: number, lng: number): void {
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
        throw new InfrastructureError(
            'Invalid coordinates: Values must be numbers',
            ErrorCodes.INVALID_COORDINATES
        );
    }
    if (lat < -90 || lat > 90) {
        throw new InfrastructureError(
            `Invalid latitude: ${lat}. Must be between -90 and 90`,
            ErrorCodes.INVALID_COORDINATES
        );
    }
    if (lng < -180 || lng > 180) {
        throw new InfrastructureError(
            `Invalid longitude: ${lng}. Must be between -180 and 180`,
            ErrorCodes.INVALID_COORDINATES
        );
    }
}

function validateRadius(radius: number): void {
    if (radius <= 0 || isNaN(radius)) {
        throw new InfrastructureError('Radius must be positive');
    }
}

function validateStatus(status: unknown): Status {
    const validStatuses: Status[] = [
        'Abandoned', 'Operational', 'Development', 'Proposal'
    ];

    if (typeof status !== 'string' || !validStatuses.includes(status as Status)) {
        throw new InfrastructureError(`Invalid status: ${status}`);
    }
    return status as Status;
}

function validateProjectType(type: unknown): ProjectType {
    const validTypes: ProjectType[] = ['infrastructure', 'education', 'healthcare', 'housing', 'other'];

    if (typeof type !== 'string' || !validTypes.includes(type as ProjectType)) {
        throw new InfrastructureError(`Invalid project type: ${type}`);
    }
    return type as ProjectType;
}

function validateCoordinatesArray(coordinates: unknown): { lat: number; lng: number }[] {
    if (!Array.isArray(coordinates)) {
        throw new InfrastructureError('Invalid coordinates array');
    }

    return coordinates.map(coord => {
        if (!coord || typeof coord !== 'object') {
            throw new InfrastructureError('Invalid coordinate object');
        }

        const { lat, lng } = coord as { lat?: number; lng?: number };
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            throw new InfrastructureError('Invalid coordinate values');
        }

        validateCoordinates(lat, lng);
        return { lat, lng };
    });
}