import { useQuery } from '@tanstack/react-query';
import { getNearbyInfrastructure } from '@/utils/data/infrastructureData';
import {
    InfrastructureData,
    RoadInfrastructureData,
    WaterInfrastructureData,
    PowerInfrastructureData,
    GovernmentProjectsData,
} from '@/types/infrastructure';

interface UseInfrastructureDataProps {
    latitude: number;
    longitude: number;
}

const useInfrastructureData = ({ latitude, longitude }: UseInfrastructureDataProps) => {
    return useQuery({
        queryKey: ['infrastructure', latitude, longitude],
        queryFn: async (): Promise<InfrastructureData> => {
            try {
                const roads = getNearbyInfrastructure('roads', latitude, longitude) as RoadInfrastructureData;
                const water = getNearbyInfrastructure('water', latitude, longitude) as WaterInfrastructureData;
                const power = getNearbyInfrastructure('power', latitude, longitude) as PowerInfrastructureData;
                const government = getNearbyInfrastructure('government', latitude, longitude) as GovernmentProjectsData;

                return {
                    roads,
                    water,
                    power,
                    government,
                };
            } catch {
                throw new Error('Failed to fetch infrastructure data');
            }
        },
        enabled: Boolean(latitude && longitude),
    });
}

export default useInfrastructureData;