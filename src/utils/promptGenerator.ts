import { INFRASTRUCTURE_PROMPT } from '@/config/prompts';
import { getNearbyInfrastructure } from './infrastructureData';
import {
    RoadInfrastructureData,
    WaterInfrastructureData,
    PowerInfrastructureData,
    Highway,
    Pipeline,
    Substation,
    TransmissionLine
} from '@/types/infrastructure';

interface InfrastructureStatus {
    type: string;
    name: string;
    status: string;
    lastMaintenance?: string;
    nextMaintenance?: string;
    metrics: Record<string, number | string>;
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Helper function to check if infrastructure is nearby (within 5km)
function isNearby(latitude: number, longitude: number, infraLat: number, infraLon: number): boolean {
    const distance = calculateDistance(latitude, longitude, infraLat, infraLon);
    return distance <= 5; // 5km radius
}

export function generateInfrastructurePrompt(latitude: number, longitude: number, userQuestion: string): string {
    const infrastructureStatuses: InfrastructureStatus[] = [];

    // Process Roads
    const nearbyRoads = getNearbyInfrastructure('roads', latitude, longitude) as RoadInfrastructureData;
    if (nearbyRoads?.major_highways) {
        nearbyRoads.major_highways.forEach((highway: Highway) => {
            infrastructureStatuses.push({
                type: 'Highway',
                name: highway.name,
                status: highway.status,
                lastMaintenance: highway.lastMaintenance,
                metrics: {
                    trafficDensity: highway.trafficDensity,
                }
            });
        });
    }

    // Process Water Infrastructure 
    const nearbyWater = getNearbyInfrastructure('water', latitude, longitude) as WaterInfrastructureData;
    if (nearbyWater?.main_pipelines) {
        nearbyWater.main_pipelines.forEach((pipeline: Pipeline) => {
            infrastructureStatuses.push({
                type: 'Water Pipeline',
                name: pipeline.name,
                status: pipeline.status,
                metrics: {
                    pressure: pipeline.pressure,
                    flowRate: pipeline.flow_rate,
                }
            });
        });
    }

    // Process Power Infrastructure
    const nearbyPower = getNearbyInfrastructure('power', latitude, longitude) as PowerInfrastructureData;
    if (nearbyPower?.substations) {
        nearbyPower.substations.forEach((substation: Substation) => {
            infrastructureStatuses.push({
                type: 'Power Substation',
                name: substation.name,
                status: substation.status,
                metrics: {
                    capacity: substation.capacity,
                    voltage: substation.voltage,
                }
            });
        });
    }

    if (nearbyPower?.transmission_lines) {
        nearbyPower.transmission_lines.forEach((line: TransmissionLine) => {
            infrastructureStatuses.push({
                type: 'Power Transmission Line',
                name: `Line ${line.id}`,
                status: line.status,
                lastMaintenance: line.lastInspection,
                metrics: {
                    capacity: line.capacity,
                    voltage: line.voltage,
                }
            });
        });
    }

    const infrastructureData = infrastructureStatuses.length > 0
        ? infrastructureStatuses.map(infra =>
            `• ${infra.type} - ${infra.name}
  Status: ${infra.status}
  ${infra.lastMaintenance ? `Pemeliharaan Terakhir: ${infra.lastMaintenance}` : ''}
  ${infra.nextMaintenance ? `Jadwal Pemeliharaan: ${infra.nextMaintenance}` : ''}
  Metrik: ${Object.entries(infra.metrics).map(([key, value]) => `${key}: ${value}`).join(' | ')}`
        ).join('\n')
        : 'Tidak ada infrastruktur kritis dalam radius 5km.';

    return INFRASTRUCTURE_PROMPT(latitude, longitude, infrastructureData, userQuestion);
}