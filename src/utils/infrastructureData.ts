import roadsData from '@/../public/data/roads.json';
import waterData from '@/../public/data/water.json';
import powerData from '@/../public/data/power.json';
import governmentData from '@/../public/data/government.json';
import welfareData from '@/../private/data/welfare.json';

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
    WelfareProgramsData,
    WelfareProgram
} from '@/types/infrastructure';

class InfrastructureError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InfrastructureError';
    }
}

// Main functions
export function getInfrastructureData(type: keyof InfrastructureReturn): InfrastructureReturn[keyof InfrastructureReturn] {
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
                        coordinates: validateCoordinatesArray(p.coordinates)
                    })),
                    small_projects: governmentData.small_projects.map(p => ({
                        ...p,
                        status: validateStatus(p.status),
                        type: validateProjectType(p.type),
                        coordinates: validateCoordinatesArray(p.coordinates)
                    }))
                };
            case 'welfare':
                if (!welfareData?.programs) {
                    throw new InfrastructureError('Invalid welfare data structure');
                }
                return {
                    programs: welfareData.programs.map((p: Welfare) => ({
                        ...p
                    }))
                };
            default:
                throw new InfrastructureError(`Unsupported infrastructure type: ${type}`);
        }
    } catch (error) {
        console.error('Error getting infrastructure data:', error);
        throw error instanceof InfrastructureError ? error : new InfrastructureError('Failed to get infrastructure data');
    }
}

export function getNearbyInfrastructure(
    type: keyof InfrastructureReturn,
    latitude: number,
    longitude: number,
    radius: number = 50 // km
): InfrastructureReturn[keyof InfrastructureReturn] {
    try {
        validateCoordinates(latitude, longitude);
        validateRadius(radius);

        const data = getInfrastructureData(type);
        if (!data) throw new InfrastructureError('No data available for the specified type');

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
                if ('coordinates' in item && Array.isArray(item.coordinates)) {
                    // For items with coordinate arrays, check if any point is within radius
                    return item.coordinates.some(coord => isPointInRadius(coord.lat, coord.lng));
                }
                return false;
            } catch {
                return false;
            }
        };

        switch (type) {
            case 'roads': {
                const roadsData = data as RoadInfrastructureData;
                return {
                    major_highways: roadsData.major_highways.filter(filterByDistance),
                    arterial_roads: roadsData.arterial_roads.filter(filterByDistance)
                };
            }
            case 'water': {
                const waterData = data as WaterInfrastructureData;
                return {
                    main_pipelines: waterData.main_pipelines.filter(filterByDistance),
                    treatment_plants: waterData.treatment_plants.filter(filterByDistance)
                };
            }
            case 'power': {
                const powerData = data as PowerInfrastructureData;
                return {
                    substations: powerData.substations.filter(filterByDistance),
                    transmission_lines: powerData.transmission_lines.filter(filterByDistance)
                };
            }
            case 'government': {
                const govData = data as GovernmentProjectsData;
                return {
                    big_projects: govData.big_projects.filter(filterByDistance),
                    small_projects: govData.small_projects.filter(filterByDistance)
                };
            }
            case 'welfare': {
                const welfareData = data as WelfareData;
                return {
                    programs: welfareData.programs?.filter(program =>
                        isPointInRadius(parseFloat(program.latitude), parseFloat(program.longitude))
                    )
                } as WelfareData;
            }
            default:
                throw new InfrastructureError(`Unsupported infrastructure type: ${type}`);
        }
    } catch (error) {
        console.error('Error getting nearby infrastructure:', error);
        throw error instanceof InfrastructureError ? error : new InfrastructureError('Failed to get nearby infrastructure');
    }
}

// Validation functions
function validateCoordinates(lat: number, lng: number): void {
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
        throw new InfrastructureError('Invalid coordinates');
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new InfrastructureError('Coordinates out of range');
    }
}

function validateRadius(radius: number): void {
    if (radius <= 0 || isNaN(radius)) {
        throw new InfrastructureError('Radius must be positive');
    }
}

// Utility type for infrastructure data returns
type InfrastructureReturn = {
    roads: RoadInfrastructureData;
    water: WaterInfrastructureData;
    power: PowerInfrastructureData;
    government: GovernmentProjectsData;
    welfare: WelfareData;
}

// Validation helper functions
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