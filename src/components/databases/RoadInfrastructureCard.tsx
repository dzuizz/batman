import { Router, CheckCircle, Clock, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import getStatusColor from '@/utils/statusColors';
import { RoadInfrastructureData } from '@/types/infrastructure';

interface RoadInfrastructureCardProps {
    data?: RoadInfrastructureData;
}

const RoadInfrastructureCard = ({ data }: RoadInfrastructureCardProps) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-violet-200/50 dark:border-violet-800/50"
            role="region"
            aria-label="Road Infrastructure Status"
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl text-black dark:text-slate-300 font-semibold">
                    Road Infrastructure
                </CardTitle>
                <Router className="h-6 w-6 text-violet-600 dark:text-violet-400" aria-hidden="true" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...(data?.major_highways || []), ...(data?.arterial_roads || [])].map((road) => (
                        <div
                            key={road.id}
                            className="border-b border-violet-200/30 dark:border-violet-800/30 pb-3"
                            role="article"
                            aria-label={`Road: ${road.name}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-black dark:text-slate-300 font-medium">{road.name}</h3>
                                <span
                                    className={`flex items-center gap-1 ${getStatusColor(road.status)}`}
                                    role="status"
                                    aria-label={`Status: ${road.status}`}
                                >
                                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                    {road.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                <div className="flex justify-between" role="group" aria-label="Traffic Density">
                                    <span>Traffic Density:</span>
                                    <span aria-label={`${road.trafficDensity}% traffic density`}>{road.trafficDensity}%</span>
                                </div>
                                <div
                                    className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"
                                    role="progressbar"
                                    aria-valuenow={road.trafficDensity}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                >
                                    <div
                                        className="bg-violet-600 dark:bg-violet-400 h-2 rounded-full"
                                        style={{ width: `${road.trafficDensity}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center" role="group" aria-label="Maintenance Dates">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" aria-hidden="true" /> Last Maintenance:
                                    </span>
                                    <span>{formatDate(road.lastMaintenance)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" aria-hidden="true" /> Next Maintenance:
                                    </span>
                                    <span>{formatDate(road.nextMaintenance)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!data?.major_highways?.length && !data?.arterial_roads?.length) && (
                        <div
                            className="text-center py-4"
                            role="alert"
                            aria-label="No roads found"
                        >
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No roads found in this area</p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Please check your location settings or contact support</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default RoadInfrastructureCard;