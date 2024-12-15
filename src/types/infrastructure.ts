// ! Location Data
export interface LocationData {
    latitude: number;
    longitude: number;
    regionName?: string;
}

// ! Databases

// * Custom Types
export type Status = 'Abandoned' | 'Operational' | 'Development' | 'Proposal';
export type ProjectType = 'infrastructure' | 'education' | 'healthcare' | 'housing' | 'other';

export interface Road {
    id: string;
    name: string;
    status: Status;
    coordinates: { lat: number; lng: number }[];
    lastMaintenance: string; // ISO date string
    nextMaintenance: string; // ISO date string
    trafficDensity: number; // Percentage
}

export interface Pipeline {
    id: string;
    name: string;
    status: Status;
    coordinates: { lat: number; lng: number }[];
    lastMaintenance: string; // ISO date string
    nextMaintenance: string; // ISO date string
    pressure: number; // PSI
}

export interface Substation {
    id: string;
    name: string;
    status: Status;
    coordinates: { lat: number; lng: number }[];
    capacity: number; // MW
    voltage: number; // kV
}

export interface TransmissionLine {
    id: string;
    name: string;
    status: Status;
    coordinates: { lat: number; lng: number }[];
    capacity: number; // MW
    voltage: number; // kV
}

export interface GovernmentProject {
    id: string;
    name: string;
    status: Status;
    coordinates: { lat: number; lng: number }[];

    type: ProjectType;
    budget: number; // Currency amount
    startDate: string; // ISO date string
    estimatedCompletion: string; // ISO date string
    progress: number; // Percentage
    contractor: string;
    description: string;
}

export interface RoadInfrastructureData {
    major_highways: Road[];
    arterial_roads: Road[];
}

export interface WaterInfrastructureData {
    main_pipelines: Pipeline[];
    treatment_plants: Pipeline[];
}

export interface PowerInfrastructureData {
    substations: Substation[];
    transmission_lines: TransmissionLine[];
}

export interface GovernmentProjectsData {
    small_projects: GovernmentProject[];
    big_projects: GovernmentProject[];
}

// * Welfare Data
export interface WelfareProgram {
    nama: string,
    latitude: string,
    longitude: string,
    kelurahan: string,
    kecamatan: string,
    status_lahan: string,
    status_bangunan: string,
    luas_bangunan: string,
    jenis_lantai: string,
    jenis_dinding: string,
    kondisi_dinding: string,
    jenis_atap: string,
    kondisi_atap: string,
    kamar: string,
    sumber_air: string,
    memperoleh_air: string,
    sumber_penerangan: string,
    daya_terpasang: string,
    bahan_bakar: string,
    fasilitas_bab: string,
    jenis_kloset: string,
    tpa_kloset: string,
    smartphone: string,
    televisi: string,
    komputer: string,
    internet: string
}

export interface WelfareProgramsData {
    programs: WelfareProgram[];
}

export interface InfrastructureData {
    roads?: RoadInfrastructureData;
    water?: WaterInfrastructureData;
    power?: PowerInfrastructureData;
    government?: GovernmentProjectsData;
    welfare?: WelfareProgramsData;
}