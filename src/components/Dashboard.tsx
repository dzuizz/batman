'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Location
import { useLocation } from '@/context/LocationContext';
import { LocationFaker } from '@/components/helper/LocationFaker';

// AI Chatbot
import ChatBot from '@/components/ai/ChatBot';

// Location Header
import { LocationHeader } from '@/components/helper/LocationHeader';

// Infrastructure Data
import useInfrastructureData from '@/hooks/useInfrastructureData';
import useWelfareData from '@/hooks/useWelfareData';

// Notification Context
import { useNotification } from '@/context/NotificationContext';

// Infrastructure Cards
import RoadInfrastructureCard from '@/components/databases/RoadInfrastructureCard';
import WaterInfrastructureCard from '@/components/databases/WaterInfrastructureCard';
import PowerInfrastructureCard from '@/components/databases/PowerInfrastructureCard';
import GovernmentProjectsCard from '@/components/databases/GovernmentProjectsCard';

// Welfare Cards
import WelfareCard from '@/components/databases/WelfareCard';

// Dynamic Map
const Map = dynamic(() => import('./Map'), {
    ssr: false, loading: () => (
        <div className="h-[400px] w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
    )
});

const Dashboard = () => {
    const { showNotification } = useNotification();
    const { location } = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: infrastructureData, isLoading: isInfrastructureLoading, error: infrastructureError } = useInfrastructureData({
        latitude: location?.latitude ?? 0,
        longitude: location?.longitude ?? 0,
    });

    const { data: welfareData, isLoading: isWelfareLoading, error: welfareError } = useWelfareData({
        latitude: location?.latitude ?? 0,
        longitude: location?.longitude ?? 0,
    });

    // Emergency Notifications
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
        infrastructureData.power?.transmission_lines.forEach(line => {
            if (line.status === 'Operational' && line.voltage < 200) {
                showNotification(
                    `Low voltage alert: ${line.name} at ${line.voltage}kV`,
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

    if (isInfrastructureLoading || isWelfareLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-violet-600 dark:text-violet-400" />
            </div>
        );
    }

    if (infrastructureError || welfareError || !location) {
        return (
            <div className="min-h-screen p-6">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {infrastructureError instanceof Error ? infrastructureError.message : 'Failed to load infrastructure data'}<br />
                        {welfareError instanceof Error ? welfareError.message : 'Failed to load welfare data'}
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
        welfare: welfareData?.programs?.filter(welfare => welfare.nama.toLowerCase().includes(searchQuery.toLowerCase())) || [],
    };

    return (
        <div className="min-h-screen p-6">
            <LocationHeader location={location} />
            <div className="mb-4">
                <LocationFaker />
            </div>

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
                        welfareData={welfareData || null}
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

            <ChatBot />
        </div>
    );
};

export default Dashboard;