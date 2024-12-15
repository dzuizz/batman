import { Zap, CheckCircle, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getStatusColor } from '@/utils/statusColors';
import { PowerInfrastructureData } from '@/types/infrastructure';

interface PowerInfrastructureCardProps {
    data?: PowerInfrastructureData;
}

const PowerInfrastructureCard = ({ data }: PowerInfrastructureCardProps) => {
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
            aria-label="Power Grid Status"
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl text-black dark:text-slate-300 font-semibold">Power Grid</CardTitle>
                <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...(data?.substations || []), ...(data?.transmission_lines || [])].map((substation) => (
                        <div
                            key={substation.id}
                            className="border-b border-violet-200/30 dark:border-violet-800/30 pb-3"
                            role="article"
                            aria-label={`Power Substation: ${substation.name}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-black dark:text-slate-300 font-medium">{substation.name}</h3>
                                <span
                                    className={`flex items-center gap-1 ${getStatusColor(substation.status)}`}
                                    role="status"
                                    aria-label={`Status: ${substation.status}`}
                                >
                                    {substation.status === 'Operational' ? (
                                        <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                                    )}
                                    {substation.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                <div className="flex justify-between" role="group" aria-label="Capacity Information">
                                    <span>Capacity:</span>
                                    <span aria-label={`${substation.capacity}% capacity`}>{substation.capacity}%</span>
                                </div>
                                <div
                                    className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"
                                    role="progressbar"
                                    aria-valuenow={substation.capacity}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-label={`Capacity level: ${substation.capacity}%`}
                                >
                                    <div
                                        className={`h-2 rounded-full ${substation.capacity > 90
                                            ? 'bg-red-600 dark:bg-red-400'
                                            : substation.capacity > 75
                                                ? 'bg-orange-600 dark:bg-orange-400'
                                                : 'bg-yellow-600 dark:bg-yellow-400'
                                            }`}
                                        style={{ width: `${substation.capacity}%` }}
                                    />
                                </div>
                                <div className="flex justify-between" role="group" aria-label="Voltage Information">
                                    <span>Voltage:</span>
                                    <span aria-label={`${substation.voltage} kilovolts`}>{substation.voltage} kV</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> Last Maintenance:
                                    </span>
                                    <span>{formatDate(substation.lastMaintenance)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" /> Next Maintenance:
                                    </span>
                                    <span>{formatDate(substation.nextMaintenance)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!data?.substations?.length && !data?.transmission_lines?.length) && (
                        <div
                            className="text-center py-4"
                            role="alert"
                            aria-label="No power infrastructure found"
                        >
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No power infrastructure found in this area</p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Please check your location settings or contact support</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default PowerInfrastructureCard;