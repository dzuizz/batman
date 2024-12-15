import { useQuery } from '@tanstack/react-query';
import { getNearbyInfrastructure } from '@/utils/infrastructureData';
import {
    InfrastructureData,
    RoadInfrastructureData,
    WaterInfrastructureData,
    PowerInfrastructureData,
    GovernmentProjectsData,
    WelfareProgramsData
} from '@/types/infrastructure';

interface UseInfrastructureDataParams {
    latitude: number;
    longitude: number;
}

export function useInfrastructureData({ latitude, longitude }: UseInfrastructureDataParams) {
    return useQuery({
        queryKey: ['infrastructure', latitude, longitude],
        queryFn: async (): Promise<InfrastructureData> => {
            try {
                const roads = getNearbyInfrastructure('roads', latitude, longitude) as RoadInfrastructureData;
                const water = getNearbyInfrastructure('water', latitude, longitude) as WaterInfrastructureData;
                const power = getNearbyInfrastructure('power', latitude, longitude) as PowerInfrastructureData;
                const government = getNearbyInfrastructure('government', latitude, longitude) as GovernmentProjectsData;
                const welfare = getNearbyInfrastructure('welfare', latitude, longitude) as WelfareProgramsData;

                return {
                    roads,
                    water,
                    power,
                    government,
                    welfare,
                };
            } catch {
                throw new Error('Failed to fetch infrastructure data');
            }
        },
        enabled: Boolean(latitude && longitude),
    });
}