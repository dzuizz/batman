import { INFRASTRUCTURE_PROMPT } from '@/config/prompts';
import { getNearbyInfrastructure } from './infrastructureData';
import {
    RoadInfrastructureData,
    WaterInfrastructureData,
    PowerInfrastructureData,
    Road,
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

export function generateInfrastructurePrompt(latitude: number, longitude: number, userQuestion: string): string {
    const infrastructureStatuses: InfrastructureStatus[] = [];

    // Process Roads
    const nearbyRoads = getNearbyInfrastructure('roads', latitude, longitude) as RoadInfrastructureData;
    if (nearbyRoads?.major_highways) {
        nearbyRoads.major_highways.forEach((highway: Road) => {
            infrastructureStatuses.push({
                type: 'Highway',
                name: highway.name,
                status: highway.status,
                lastMaintenance: highway.lastMaintenance,
                nextMaintenance: highway.nextMaintenance,
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
                lastMaintenance: pipeline.lastMaintenance,
                nextMaintenance: pipeline.nextMaintenance,
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
                lastMaintenance: substation.lastMaintenance,
                nextMaintenance: substation.nextMaintenance,
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
                lastMaintenance: line.lastMaintenance,
                nextMaintenance: line.nextMaintenance,
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