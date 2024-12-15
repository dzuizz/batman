import { CHAT_PROMPT } from '@/config/prompts';
import { getNearbyInfrastructure } from './data/infrastructureData';
import { RoadInfrastructureData, WaterInfrastructureData, PowerInfrastructureData, Road, Pipeline, Substation, TransmissionLine, GovernmentProjectsData, GovernmentProject } from '@/types/infrastructure';
import { WelfareProgramsData } from '@/types/welfare';
import { getNearbyWelfareData } from '@/utils/data/welfareData';


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
    const welfareData = generateWelfareData(latitude, longitude);

    const prompt = CHAT_PROMPT(latitude, longitude, [infrastructureData, welfareData], userQuestion);
    console.log('Generated Prompt:', prompt);
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
                lastMaintenance: highway.lastMaintenance,
                nextMaintenance: highway.nextMaintenance,
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
                lastMaintenance: pipeline.lastMaintenance,
                nextMaintenance: pipeline.nextMaintenance,
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
                type: 'Jaringan Listrik',
                name: line.name,
                status: line.status,
                metrics: {
                    capacity: line.capacity,
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

    const infrastructureData = infrastructureStatuses.length > 0 ? infrastructureStatuses.map(infra =>
        `* ${infra.type} - ${infra.name}\n  Status: ${infra.status}
${infra.lastMaintenance ? `  Pemeliharaan Terakhir: ${infra.lastMaintenance}\n` : ''}
${infra.nextMaintenance ? `  Jadwal Pemeliharaan: ${infra.nextMaintenance}\n` : ''}
  Metrik: ${Object.entries(infra.metrics).map(([key, value]) => `${key}: ${value}`).join(' | ')}`).join('\n')
        : 'Tidak ada infrastruktur kritis dalam radius 5km.';

    return infrastructureData;
}

export function generateWelfareData(latitude: number, longitude: number): string {
    const welfareStatuses = getNearbyWelfareData(latitude, longitude) as WelfareProgramsData;

    const welfareData = welfareStatuses?.programs?.length > 0 ? welfareStatuses?.programs?.map(program =>
        `* ${program.nama}
  Kelurahan: ${program.kelurahan}
  Kecamatan: ${program.kecamatan}
  Status Lahan: ${program.status_lahan}
  Status Bangunan: ${program.status_bangunan}
  Luas Bangunan: ${program.luas_bangunan}
  Jenis Lantai: ${program.jenis_lantai}
  Jenis Dinding: ${program.jenis_dinding}
  Kondisi Dinding: ${program.kondisi_dinding}
  Jenis Atap: ${program.jenis_atap}
  Kondisi Atap: ${program.kondisi_atap}
  Jumlah Kamar: ${program.kamar}
  Sumber Air: ${program.sumber_air}
  Cara Memperoleh Air: ${program.memperoleh_air}
  Sumber Penerangan: ${program.sumber_penerangan}
  Daya Terpasang: ${program.daya_terpasang}
  Bahan Bakar: ${program.bahan_bakar}
  Fasilitas BAB: ${program.fasilitas_bab}
  Jenis Kloset: ${program.jenis_kloset}
  TPA Kloset: ${program.tpa_kloset}
  Smartphone: ${program.smartphone}
  Televisi: ${program.televisi}
  Komputer: ${program.komputer}
  Internet: ${program.internet}`).join('\n\n')
        : 'Tidak ada program kesejahteraan kritis dalam radius 5km.';

    return welfareData;
}

// export function generateInfrastructurePrompt(latitude: number, longitude: number, userQuestion: string): string {


//     // Process Water Infrastructure 
//     const nearbyWater = getNearbyInfrastructure('water', latitude, longitude) as WaterInfrastructureData;
//     if (nearbyWater?.main_pipelines) {
//         nearbyWater.main_pipelines.forEach((pipeline: Pipeline) => {
//             infrastructureStatuses.push({
//                 type: 'Water Pipeline',
//                 name: pipeline.name,
//                 status: pipeline.status,
//                 lastMaintenance: pipeline.lastMaintenance,
//                 nextMaintenance: pipeline.nextMaintenance,
//                 metrics: {
//                     pressure: pipeline.pressure,
//                     flowRate: pipeline.flow_rate,
//                 }
//             });
//         });
//     }

//     // Process Power Infrastructure
//     const nearbyPower = getNearbyInfrastructure('power', latitude, longitude) as PowerInfrastructureData;
//     if (nearbyPower?.substations) {
//         nearbyPower.substations.forEach((substation: Substation) => {
//             infrastructureStatuses.push({
//                 type: 'Power Substation',
//                 name: substation.name,
//                 status: substation.status,
//                 lastMaintenance: substation.lastMaintenance,
//                 nextMaintenance: substation.nextMaintenance,
//                 metrics: {
//                     capacity: substation.capacity,
//                     voltage: substation.voltage,
//                 }
//             });
//         });
//     }

//     if (nearbyPower?.transmission_lines) {
//         nearbyPower.transmission_lines.forEach((line: TransmissionLine) => {
//             infrastructureStatuses.push({
//                 type: 'Power Transmission Line',
//                 name: `Line ${line.id}`,
//                 status: line.status,
//                 lastMaintenance: line.lastMaintenance,
//                 nextMaintenance: line.nextMaintenance,
//                 metrics: {
//                     capacity: line.capacity,
//                     voltage: line.voltage,
//                 }
//             });
//         });
//     }

//     // Process Government Projects
//     const nearbyGovernment = getNearbyInfrastructure('government', latitude, longitude) as GovernmentProjectsData;
//     if (nearbyGovernment?.big_projects) {
//         nearbyGovernment.big_projects.forEach((project: GovernmentProject) => {
//             infrastructureStatuses.push({
//                 type: 'Government Project',
//                 name: project.name,
//                 status: project.status,
//                 metrics: {}
//             });
//         });
//     }

//     // Process Welfare Programs
//     const nearbyWelfare = getNearbyInfrastructure('welfare', latitude, longitude) as WelfareProgramsData;
//     if (nearbyWelfare?.programs) {
//         nearbyWelfare.programs.forEach((program: WelfareProgram) => {
//             infrastructureStatuses.push({
//                 type: 'Warga Miskin',
//                 name: program.nama,
//                 status: program.status_lahan,
//                 metrics: {}
//             });
//         });
//     }

//     const infrastructureData = infrastructureStatuses.length > 0
//         ? infrastructureStatuses.map(infra =>
//             `• ${infra.type} - ${infra.name}
//   Status: ${infra.status}
//   ${infra.lastMaintenance ? `Pemeliharaan Terakhir: ${infra.lastMaintenance}` : ''}
//   ${infra.nextMaintenance ? `Jadwal Pemeliharaan: ${infra.nextMaintenance}` : ''}
//   Metrik: ${Object.entries(infra.metrics).map(([key, value]) => `${key}: ${value}`).join(' | ')}`
//         ).join('\n')
//         : 'Tidak ada infrastruktur kritis dalam radius 5km.';

//     const prompt = INFRASTRUCTURE_PROMPT(latitude, longitude, infrastructureData, userQuestion);
//     console.log('Generated Prompt:', prompt);
//     return prompt;
// }