'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

import { useLocation } from '@/context/LocationContext';
import { AIChatbot } from '@/components/AIChatbot';
import { LocationHeader } from '@/components/LocationHeader';
import { RoadInfrastructureCard } from '@/components/infrastructure/RoadInfrastructureCard';
import { WaterInfrastructureCard } from '@/components/infrastructure/WaterInfrastructureCard';
import { PowerInfrastructureCard } from '@/components/infrastructure/PowerInfrastructureCard';
import { GovernmentProjectsCard } from '@/components/infrastructure/GovernmentProjectsCard';
import { useInfrastructureData } from '@/hooks/useInfrastructureData';
import { useNotification } from '@/context/NotificationContext';
import WelfareCard from '@/components/infrastructure/WelfareCard';

const Map = dynamic(() => import('./Map'), {
    ssr: false, loading: () => (
        <div className="h-[400px] w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
    )
});

const Dashboard = () => {
    const { showNotification } = useNotification();
    const { location } = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: infrastructureData, isLoading, error } = useInfrastructureData({
        latitude: location?.latitude ?? 0,
        longitude: location?.longitude ?? 0,
    });

    useEffect(() => {
        if (!infrastructureData) return;

        infrastructureData.power?.substations.forEach(substation => {
            if (substation.status === 'Development' && substation.capacity < 20) {
                showNotification(
                    `Low power capacity alert: ${substation.name} is operating at ${substation.capacity}MW`,
                    'warning'
                );
            }
        });

        infrastructureData.water?.main_pipelines.forEach(pipeline => {
            if (pipeline.status === 'Operational' && pipeline.pressure > 90) {
                showNotification(
                    `High pressure alert: ${pipeline.name} at ${pipeline.pressure} PSI`,
                    'critical'
                );
            }
        });
    }, [infrastructureData, showNotification]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-violet-600 dark:text-violet-400" />
            </div>
        );
    }

    if (error || !location) {
        return (
            <div className="min-h-screen p-6">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error instanceof Error ? error.message : 'Failed to load dashboard data'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const filteredData = {
        roads: infrastructureData?.roads?.major_highways?.filter(road => road.name.toLowerCase().includes(searchQuery.toLowerCase())) || [],
        water: infrastructureData?.water?.main_pipelines?.filter(water => water.name.toLowerCase().includes(searchQuery.toLowerCase())) || [],
        power: infrastructureData?.power?.substations?.filter(power => power.name.toLowerCase().includes(searchQuery.toLowerCase())) || [],
        government: infrastructureData?.government?.big_projects?.filter(gov => gov.name.toLowerCase().includes(searchQuery.toLowerCase())) || [],
        welfare: infrastructureData?.welfare?.programs?.filter(welfare => welfare.nama.toLowerCase().includes(searchQuery.toLowerCase())) || [],
    };

    return (
        <div className="min-h-screen p-6">
            <LocationHeader location={location} />

            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search infrastructure..."
                className="mb-4 p-2 border rounded"
            />

            {location && (
                <div className="mb-8">
                    <Map
                        center={[location.latitude, location.longitude]}
                        infrastructureData={infrastructureData || null}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                <RoadInfrastructureCard data={{
                    major_highways: filteredData.roads,
                    arterial_roads: []
                }} />
                <WaterInfrastructureCard data={{
                    main_pipelines: filteredData.water,
                    treatment_plants: []
                }} />
                <PowerInfrastructureCard data={{
                    substations: filteredData.power,
                    transmission_lines: []
                }} />
                <GovernmentProjectsCard data={{
                    big_projects: filteredData.government,
                    small_projects: []
                }} />
                <WelfareCard data={{ programs: filteredData.welfare }} />
            </div>

            <AIChatbot />
        </div>
    );
};

export default Dashboard;