import { Building2, CheckCircle, Calendar, DollarSign, Users, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getStatusColor } from '@/utils/statusColors';
import { GovernmentProjectsData } from '@/types/infrastructure';

interface GovernmentProjectsCardProps {
    data?: GovernmentProjectsData;
}

export const GovernmentProjectsCard = ({ data }: GovernmentProjectsCardProps) => {
    const formatBudget = (budget: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(budget);
    };

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
            aria-label="Government Projects Status"
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl text-black dark:text-slate-300 font-semibold">
                    Government Projects
                </CardTitle>
                <Building2 className="h-6 w-6 text-violet-600 dark:text-violet-400" aria-hidden="true" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...(data?.big_projects || []), ...(data?.small_projects || [])].map((project) => (
                        <div
                            key={project.id}
                            className="border-b border-violet-200/30 dark:border-violet-800/30 pb-3"
                            role="article"
                            aria-label={`Project: ${project.name}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-black dark:text-slate-300 font-medium">{project.name}</h3>
                                <span
                                    className={`flex items-center gap-1 ${getStatusColor(project.status)}`}
                                    role="status"
                                    aria-label={`Project status: ${project.status}`}
                                >
                                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                    {project.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
                                <p className="text-sm italic">{project.description}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-violet-500" />
                                        <span>{project.coordinates.length} locations</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4 text-violet-500" /> Budget:
                                    </span>
                                    <span className="font-medium">{formatBudget(project.budget)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-violet-500" /> Timeline:
                                    </span>
                                    <span>{formatDate(project.startDate)} - {formatDate(project.estimatedCompletion)}</span>
                                </div>
                                <div className="mt-2">
                                    <div className="flex justify-between mb-1"
                                        role="group"
                                        aria-label="Project Progress"
                                    >
                                        <span>Progress:</span>
                                        <span className="font-medium">{project.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"
                                        role="progressbar"
                                        aria-valuenow={project.progress}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={`Project completion: ${project.progress}%`}
                                    >
                                        <div
                                            className="bg-violet-600 dark:bg-violet-400 h-2.5 rounded-full transition-all duration-300"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-violet-200/30 dark:border-violet-800/30">
                                    <div className="flex items-center gap-2"
                                        role="group"
                                        aria-label="Project Information"
                                    >
                                        <span className="text-violet-600 dark:text-violet-400 font-medium">
                                            {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span>{project.contractor}</span>
                                    </div>
                                    <button className="flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline"
                                        role="button"
                                        aria-label={`View details for ${project.name}`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>Details</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!data?.big_projects?.length && !data?.small_projects?.length) && (
                        <div
                            className="text-center py-4"
                            role="alert"
                            aria-label="No government projects found"
                        >
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No government projects found in this area</p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Please check your location settings or contact support</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};