import { CHAT_PROMPT } from '@/config/prompts';
import { getNearbyInfrastructure } from './data/infrastructureData';
import { RoadInfrastructureData, WaterInfrastructureData, PowerInfrastructureData, Road, Pipeline, Substation, TransmissionLine, GovernmentProjectsData, GovernmentProject } from '@/types/infrastructure';
import { WelfareProgramsData } from '@/types/welfare';
import { getNearbyWelfareData } from './data/welfareData';


interface InfrastructureStatus {
    type: string;
    name: string;
    status: string;
    lastMaintenance?: string;
    nextMaintenance?: string;
    metrics: Record<string, number | string>;
}

export function generatePrompt(latitude: number, longitude: number, userQuestion: string): string {
    const infrastructureData = generateInfrastructureData(latitude, longitude);
    console.log('Infrastructure Data:', infrastructureData);

    const welfareData = generateWelfareData(latitude, longitude);
    console.log('Welfare Data:', welfareData);

    const prompt = CHAT_PROMPT(latitude, longitude, infrastructureData, welfareData, userQuestion);
    console.log('Final Prompt:', prompt);
    return prompt;
}

export function generateInfrastructureData(latitude: number, longitude: number): string {
    const infrastructureStatuses: InfrastructureStatus[] = [];

    // Process Roads Infrastructure
    const nearbyRoads = getNearbyInfrastructure('roads', latitude, longitude) as RoadInfrastructureData;
    if (nearbyRoads?.major_highways) {
        nearbyRoads.major_highways.forEach((highway: Road) => {
            infrastructureStatuses.push({
                type: 'Jalan Raya Utama',
                name: highway.name,
                status: highway.status,
                metrics: {
                    trafficDensity: highway.trafficDensity,
                }
            });
        });
    }
    if (nearbyRoads?.arterial_roads) {
        nearbyRoads.arterial_roads.forEach((road: Road) => {
            infrastructureStatuses.push({
                type: 'Jalan Arteri',
                name: road.name,
                status: road.status,
                metrics: {
                    trafficDensity: road.trafficDensity,
                }
            });
        });
    }

    // Process Water Infrastructure
    const nearbyWater = getNearbyInfrastructure('water', latitude, longitude) as WaterInfrastructureData;
    if (nearbyWater?.main_pipelines) {
        nearbyWater.main_pipelines.forEach((pipeline: Pipeline) => {
            infrastructureStatuses.push({
                type: 'Pipa Air Utama',
                name: pipeline.name,
                status: pipeline.status,
                metrics: {
                    pressure: pipeline.pressure,
                    flowRate: pipeline.flow_rate,
                }
            });
        });
    }
    if (nearbyWater?.treatment_plants) {
        nearbyWater.treatment_plants.forEach((plant: Pipeline) => {
            infrastructureStatuses.push({
                type: 'Peralatan Pengolahan Air',
                name: plant.name,
                status: plant.status,
                metrics: {
                    flowRate: plant.flow_rate,
                }
            });
        });
    }

    // Process Power Infrastructure
    const nearbyPower = getNearbyInfrastructure('power', latitude, longitude) as PowerInfrastructureData;
    if (nearbyPower?.substations) {
        nearbyPower.substations.forEach((substation: Substation) => {
            infrastructureStatuses.push({
                type: 'Pembangkit Listrik',
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
                type: 'Jaringan Listrik',
                name: line.name,
                status: line.status,
                metrics: {
                    voltage: line.voltage,
                }
            });
        });
    }

    // Process Government Projects
    const nearbyGovernment = getNearbyInfrastructure('government', latitude, longitude) as GovernmentProjectsData;
    if (nearbyGovernment?.big_projects) {
        nearbyGovernment.big_projects.forEach((project: GovernmentProject) => {
            infrastructureStatuses.push({
                type: 'Proyek Pemerintah',
                name: project.name,
                status: project.status,
                lastMaintenance: project.lastMaintenance,
                nextMaintenance: project.nextMaintenance,
                metrics: {
                    budget: project.budget,
                    startDate: project.startDate,
                    estimatedCompletion: project.estimatedCompletion,
                    progress: project.progress,
                    contractor: project.contractor,
                    description: project.description,
                }
            });
        });
    }
    if (nearbyGovernment?.small_projects) {
        nearbyGovernment.small_projects.forEach((project: GovernmentProject) => {
            infrastructureStatuses.push({
                type: 'Proyek Pemerintah',
                name: project.name,
                status: project.status,
                metrics: {}
            });
        });
    }

    const infrastructureData = infrastructureStatuses.length > 0 ?
        `Terdapat ${infrastructureStatuses.length} infrastruktur dalam radius 5km:\n\n` +
        infrastructureStatuses.map(infra =>
            `* ${infra.type} - ${infra.name}\n  Status: ${infra.status}
${infra.lastMaintenance ? `  Pemeliharaan Terakhir: ${infra.lastMaintenance}\n` : ''}
${infra.nextMaintenance ? `  Jadwal Pemeliharaan: ${infra.nextMaintenance}\n` : ''}
  Metrik: ${Object.entries(infra.metrics).map(([key, value]) => `${key}: ${value}`).join(' | ')}`).join('\n')
        : 'Tidak ada infrastruktur kritis dalam radius 5km.';

    return infrastructureData;
}

export function generateWelfareData(latitude: number, longitude: number): string {
    try {
        let welfareStatuses: WelfareProgramsData = { programs: [] };
        welfareStatuses = getNearbyWelfareData(latitude, longitude) as WelfareProgramsData;

        if (!welfareStatuses?.programs?.length) {
            return 'Tidak ada data warga miskin dalam radius 1km.';
        }

        const nearestPrograms = welfareStatuses.programs.slice(0, 5);

        const welfareData = `Terdapat ${welfareStatuses.programs.length} warga miskin dalam radius 1km:\nIni adalah data 5 warga miskin paling dekat:\n\n` +
            nearestPrograms.map(program => {
                const criticalDetails = [
                    `Lokasi: ${program.kelurahan}`,
                    `Status: ${program.status_lahan}`,
                    `Status Bangunan: ${program.status_bangunan}`,
                    `Utilitas: ${[
                        program.sumber_air && `Air: ${program.sumber_air}`,
                        program.sumber_penerangan && `Listrik: ${program.sumber_penerangan}`,
                    ].filter(Boolean).join(' | ')}`
                ];

                return `* ${program.nama}\n  ${criticalDetails.join('\n  ')}`;
            }).join('\n\n');

        console.log('Welfare Data:', welfareData);

        return welfareData;
    } catch (error) {
        console.error('Error generating welfare data:', error);
        return 'Terjadi kesalahan dalam mengambil data kesejahteraan.';
    }
}
