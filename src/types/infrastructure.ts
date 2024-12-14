export type Status = 'Abandoned' | 'Operational' | 'Development' | 'Proposal';

export interface BaseInfrastructure {
    id: string;
    name: string;
    status: Status;
    coordinates: { lat: number; lng: number }[];
    lastMaintenance: string; // ISO date string
    nextMaintenance: string; // ISO date string
}

export interface Road extends BaseInfrastructure {
    trafficDensity: number; // Percentage
}

export interface Pipeline extends BaseInfrastructure {
    pressure: number; // PSI
    flow_rate: number; // m³/h
}

export interface Substation extends BaseInfrastructure {
    capacity: number; // MW
    voltage: number; // kV
}

export interface TransmissionLine extends BaseInfrastructure {
    capacity: number; // MW
    voltage: number; // kV
}

export type ProjectType = 'infrastructure' | 'education' | 'healthcare' | 'housing' | 'other';

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

export interface InfrastructureData {
    roads?: RoadInfrastructureData;
    water?: WaterInfrastructureData;
    power?: PowerInfrastructureData;
    government?: GovernmentProjectsData;
}
