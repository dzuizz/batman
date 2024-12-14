import roadsData from '@/data/infrastructure/roads.json';
import waterData from '@/data/infrastructure/water.json';
import powerData from '@/data/infrastructure/power.json';
import { INFRASTRUCTURE_PROMPT } from '@/config/prompts';

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

    // Process Roads (only if coordinates are within range)
    roadsData.roads.major_highways
        .filter(highway =>
            highway.coordinates.some(coord =>
                isNearby(latitude, longitude, coord.lat, coord.lng)
            )
        )
        .forEach(highway => {
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

    // Process Water Infrastructure
    waterData.water_network.main_pipelines
        .filter(pipeline =>
            pipeline.coordinates.some(coord =>
                isNearby(latitude, longitude, coord.lat, coord.lng)
            )
        )
        .forEach(pipeline => {
            infrastructureStatuses.push({
                type: 'Water Pipeline',
                name: pipeline.name,
                status: pipeline.status,
                lastMaintenance: pipeline.lastInspection,
                nextMaintenance: pipeline.nextMaintenance,
                metrics: {
                    pressure: pipeline.pressure,
                    flowRate: pipeline.flow_rate,
                }
            });
        });

    // Process Power Infrastructure
    powerData.power_grid.substations
        .filter(substation =>
            isNearby(latitude, longitude, substation.location.lat, substation.location.lng)
        )
        .forEach(substation => {
            infrastructureStatuses.push({
                type: 'Power Substation',
                name: substation.name,
                status: substation.status,
                lastMaintenance: substation.lastMaintenance,
                metrics: {
                    capacity: substation.capacity,
                    voltage: substation.voltage,
                }
            });
        });

    // Only include transmission lines if their endpoints are nearby
    powerData.power_grid.transmission_lines
        .filter(line =>
            line.coordinates.some(coord =>
                isNearby(latitude, longitude, coord.lat, coord.lng)
            )
        )
        .forEach(line => {
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