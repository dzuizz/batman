import { Droplet, CheckCircle, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getStatusColor } from '@/utils/statusColors';
import { WaterInfrastructureData } from '@/types/infrastructure';

interface WaterInfrastructureCardProps {
    data?: WaterInfrastructureData;
}

export const WaterInfrastructureCard = ({ data }: WaterInfrastructureCardProps) => {
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
            aria-label="Water Network Status"
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl text-black dark:text-slate-300 font-semibold">Water Network</CardTitle>
                <Droplet className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...(data?.main_pipelines || []), ...(data?.treatment_plants || [])].map((pipeline) => (
                        <div
                            key={pipeline.id}
                            className="border-b border-violet-200/30 dark:border-violet-800/30 pb-3"
                            role="article"
                            aria-label={`Water Pipeline: ${pipeline.name}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-black dark:text-slate-300 font-medium">{pipeline.name}</h3>
                                <span
                                    className={`flex items-center gap-1 ${getStatusColor(pipeline.status)}`}
                                    role="status"
                                    aria-label={`Status: ${pipeline.status}`}
                                >
                                    {pipeline.status === 'Operational' ? (
                                        <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                                    )}
                                    {pipeline.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                <div className="flex justify-between" role="group" aria-label="Pressure Information">
                                    <span>Pressure:</span>
                                    <span aria-label={`${pipeline.pressure} pounds per square inch`}>{pipeline.pressure} PSI</span>
                                </div>
                                <div className="flex justify-between" role="group" aria-label="Flow Rate Information">
                                    <span>Flow Rate:</span>
                                    <span aria-label={`${pipeline.flow_rate} cubic meters per hour`}>{pipeline.flow_rate} m³/h</span>
                                </div>
                                <div className="flex justify-between items-center" role="group" aria-label="Maintenance Dates">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" aria-hidden="true" /> Last Maintenance:
                                    </span>
                                    <span>{formatDate(pipeline.lastMaintenance)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" aria-hidden="true" /> Next Maintenance:
                                    </span>
                                    <span>{formatDate(pipeline.nextMaintenance)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!data?.main_pipelines?.length && !data?.treatment_plants?.length) && (
                        <div
                            className="text-center py-4"
                            role="alert"
                            aria-label="No water infrastructure found"
                        >
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No water infrastructure found in this area</p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Please check your location settings or contact support</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};