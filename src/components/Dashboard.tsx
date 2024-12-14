'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Droplet, Zap, AlertTriangle, CheckCircle, Clock, Router } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { getNearbyInfrastructure } from '@/utils/infrastructureData';
import { AIChatbot } from './AIChatbot';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InfrastructureData } from '@/types/infrastructure';

const Map = dynamic(() => import('./Map'), {
    ssr: false, // Disable server-side rendering
    loading: () => (
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
                const nearbyRoads = getNearbyInfrastructure('roads', location.latitude, location.longitude);
                const nearbyWater = getNearbyInfrastructure('water', location.latitude, location.longitude);
                const nearbyPower = getNearbyInfrastructure('power', location.latitude, location.longitude);

                console.log('Nearby Roads:', nearbyRoads);
                console.log('Nearby Water:', nearbyWater);
                console.log('Nearby Power:', nearbyPower);

                if (nearbyRoads || nearbyWater || nearbyPower) {
                    setInfrastructureData({
                        roads: nearbyRoads ? { major_highways: nearbyRoads.major_highways } : undefined,
                        water: nearbyWater ? { main_pipelines: nearbyWater.main_pipelines } : undefined,
                        power: nearbyPower ? { substations: nearbyPower.substations } : undefined
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'good':
            case 'optimal':
            case 'operational':
            case 'online':
                return 'text-green-500';
            case 'fair':
                return 'text-yellow-500';
            default:
                return 'text-red-500';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-violet-600 dark:text-violet-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-violet-950 dark:text-violet-100">Mahakam AI</h1>
                <div className="space-y-1">
                    <p className="text-violet-700 dark:text-violet-300">
                        Location: {location?.latitude.toFixed(4)}°N, {location?.longitude.toFixed(4)}°E
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Region: {location?.regionName || 'Loading...'}
                    </p>
                </div>
            </div>

            {/* Add Map */}
            {location && (
                <div className="mb-8">
                    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-violet-200/50 dark:border-violet-800/50">
                        <CardHeader>
                            <CardTitle>Infrastructure Map</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Map
                                center={[location.latitude, location.longitude]}
                                infrastructureData={infrastructureData}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Infrastructure Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Roads Card */}
                <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-violet-200/50 dark:border-violet-800/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-semibold">Road Infrastructure</CardTitle>
                        <Router className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {infrastructureData?.roads?.major_highways?.map((highway) => (
                                <div key={highway.id} className="border-b border-violet-200/30 dark:border-violet-800/30 pb-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium">{highway.name}</h3>
                                        <span className={`flex items-center gap-1 ${getStatusColor(highway.status)}`}>
                                            {highway.status === 'Good' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                            {highway.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Traffic Density:</span>
                                            <span>{highway.trafficDensity}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" /> Last Maintenance:
                                            </span>
                                            <span>{new Date(highway.lastMaintenance).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {infrastructureData?.roads?.major_highways?.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No nearby highways found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Water Infrastructure Card */}
                <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-violet-200/50 dark:border-violet-800/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-semibold">Water Network</CardTitle>
                        <Droplet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {infrastructureData?.water?.main_pipelines?.map((pipeline) => (
                                <div key={pipeline.id} className="border-b border-violet-200/30 dark:border-violet-800/30 pb-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium">{pipeline.name}</h3>
                                        <span className={`flex items-center gap-1 ${getStatusColor(pipeline.status)}`}>
                                            <CheckCircle className="w-4 h-4" />
                                            {pipeline.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Pressure:</span>
                                            <span>{pipeline.pressure} PSI</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Flow Rate:</span>
                                            <span>{pipeline.flow_rate} m³/h</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {infrastructureData?.water?.main_pipelines?.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No nearby water pipelines found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Power Infrastructure Card */}
                <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-violet-200/50 dark:border-violet-800/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-semibold">Power Grid</CardTitle>
                        <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {infrastructureData?.power?.substations?.map((substation) => (
                                <div key={substation.id} className="border-b border-violet-200/30 dark:border-violet-800/30 pb-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium">{substation.name}</h3>
                                        <span className={`flex items-center gap-1 ${getStatusColor(substation.status)}`}>
                                            <CheckCircle className="w-4 h-4" />
                                            {substation.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Capacity:</span>
                                            <span>{substation.capacity}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Voltage:</span>
                                            <span>{substation.voltage}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {infrastructureData?.power?.substations?.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No nearby power substations found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AIChatbot />
        </div>
    );
};

export default Dashboard;