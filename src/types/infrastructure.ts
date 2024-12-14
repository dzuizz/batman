export interface Coordinate {
    lat: number;
    lng: number;
}

export interface Location {
    lat: number;
    lng: number;
}

interface BaseInfrastructure {
    id: string;
    name: string;
    status: string;
}

interface Highway extends BaseInfrastructure {
    coordinates: Coordinate[];
    trafficDensity: number;
    lastMaintenance: string;
}

interface Pipeline extends BaseInfrastructure {
    coordinates: Coordinate[];
    pressure: number;
    flow_rate: number;
}

interface Substation extends BaseInfrastructure {
    location: Location;
    capacity: number;
    voltage: string;
}

export interface InfrastructureData {
    roads?: {
        major_highways?: Highway[];
    };
    water?: {
        main_pipelines?: Pipeline[];
    };
    power?: {
        substations?: Substation[];
    };
}