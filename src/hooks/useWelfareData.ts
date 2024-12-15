import { useQuery } from '@tanstack/react-query';
import { WelfareProgramsData } from '@/types/welfare';
import { getNearbyWelfareData } from '@/utils/data/welfareData';

interface UseWelfareDataProps {
    latitude: number;
    longitude: number;
}

const useWelfareData = ({ latitude, longitude }: UseWelfareDataProps) => {
    return useQuery({
        queryKey: ['welfare', latitude, longitude],
        queryFn: async (): Promise<WelfareProgramsData> => {
            try {
                const welfare = getNearbyWelfareData(latitude, longitude) as WelfareProgramsData;

                return welfare;
            } catch {
                throw new Error('Failed to fetch welfare data');
            }
        },
        enabled: Boolean(latitude && longitude),
    });
};

export default useWelfareData;