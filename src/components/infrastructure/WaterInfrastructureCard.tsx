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
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-violet-200/50 dark:border-violet-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl text-black dark:text-slate-300 font-semibold">Water Network</CardTitle>
                <Droplet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...(data?.main_pipelines || []), ...(data?.treatment_plants || [])].map((pipeline) => (
                        <div key={pipeline.id} className="border-b border-violet-200/30 dark:border-violet-800/30 pb-3">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-black dark:text-slate-300 font-medium">{pipeline.name}</h3>
                                <span className={`flex items-center gap-1 ${getStatusColor(pipeline.status)}`}>
                                    {pipeline.status === 'Operational' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4" />
                                    )}
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
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> Last Maintenance:
                                    </span>
                                    <span>{formatDate(pipeline.lastMaintenance)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" /> Next Maintenance:
                                    </span>
                                    <span>{formatDate(pipeline.nextMaintenance)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!data?.main_pipelines?.length && !data?.treatment_plants?.length) && (
                        <div className="text-center py-4">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No water infrastructure found in this area</p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Please check your location settings or contact support</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};