'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

import { useLocation } from '@/context/LocationContext';
import { getNearbyInfrastructure } from '@/utils/infrastructureData';
import { AIChatbot } from '@/components/AIChatbot';
import { LocationHeader } from '@/components/LocationHeader';
import { RoadInfrastructureCard } from '@/components/infrastructure/RoadInfrastructureCard';
import { WaterInfrastructureCard } from '@/components/infrastructure/WaterInfrastructureCard';
import { PowerInfrastructureCard } from '@/components/infrastructure/PowerInfrastructureCard';
import { GovernmentProjectsCard } from '@/components/infrastructure/GovernmentProjectsCard';
import { InfrastructureData, RoadInfrastructureData, WaterInfrastructureData, PowerInfrastructureData, GovernmentProjectsData } from '@/types/infrastructure';


const Map = dynamic(() => import('./Map'), {
    ssr: false, loading: () => (
        <div className="h-[400px] w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
    )
});

const Dashboard = () => {
    const { location } = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [infrastructureData, setInfrastructureData] = useState<InfrastructureData | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!location) return;
            setIsLoading(true);

            try {
                const nearbyRoads = getNearbyInfrastructure('roads', location.latitude, location.longitude) as RoadInfrastructureData;
                const nearbyWater = getNearbyInfrastructure('water', location.latitude, location.longitude) as WaterInfrastructureData;
                const nearbyPower = getNearbyInfrastructure('power', location.latitude, location.longitude) as PowerInfrastructureData;
                const nearbyGovernmentProjects = getNearbyInfrastructure('government', location.latitude, location.longitude) as GovernmentProjectsData;

                if (nearbyRoads || nearbyWater || nearbyPower || nearbyGovernmentProjects) {
                    setInfrastructureData({
                        roads: nearbyRoads ? {
                            major_highways: nearbyRoads.major_highways || [],
                            arterial_roads: nearbyRoads.arterial_roads || []
                        } : undefined,
                        water: nearbyWater ? {
                            main_pipelines: nearbyWater.main_pipelines || [],
                            treatment_plants: nearbyWater.treatment_plants || []
                        } : undefined,
                        power: nearbyPower ? {
                            substations: nearbyPower.substations || [],
                            transmission_lines: nearbyPower.transmission_lines || []
                        } : undefined,
                        government: nearbyGovernmentProjects ? {
                            big_projects: nearbyGovernmentProjects.big_projects || [],
                            small_projects: nearbyGovernmentProjects.small_projects || []
                        } : undefined
                    });
                }
            } catch (error) {
                console.error('Error fetching infrastructure data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [location]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-violet-600 dark:text-violet-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <LocationHeader location={location} />

            {location && (
                <div className="mb-8">

                    <Map
                        center={[location.latitude, location.longitude]}
                        infrastructureData={infrastructureData}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                <RoadInfrastructureCard data={infrastructureData?.roads} />
                <WaterInfrastructureCard data={infrastructureData?.water} />
                <PowerInfrastructureCard data={infrastructureData?.power} />
                <GovernmentProjectsCard data={infrastructureData?.government} />
            </div>

            <AIChatbot />
        </div>
    );
};

export default Dashboard;