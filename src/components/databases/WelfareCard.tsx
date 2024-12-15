import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home } from "lucide-react"
import { WelfareProgramsData } from "@/types/welfare"

interface WelfareCardProps {
    data?: WelfareProgramsData
}

export default function WelfareCard({ data }: WelfareCardProps) {
    return (
        <Card
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-violet-200/50 dark:border-violet-800/50"
            role="region"
            aria-label="Welfare Programs Status"
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl text-black dark:text-slate-300 font-semibold">
                    Welfare Programs
                </CardTitle>
                <Home className="h-6 w-6 text-violet-600 dark:text-violet-400" aria-hidden="true" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data?.programs?.map((program) => (
                        <div
                            key={program.id}
                            className="border-b border-violet-200/30 dark:border-violet-800/30 pb-3"
                            role="article"
                            aria-label={`Program: ${program.nama}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-black dark:text-slate-300 font-medium">{program.nama}</h3>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                <div className="flex justify-between">
                                    <span>Location:</span>
                                    <span>{program.kelurahan}, {program.kecamatan}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Building Status:</span>
                                    <span>{program.status_bangunan}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Building Area:</span>
                                    <span>{program.luas_bangunan}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Rooms:</span>
                                    <span>{program.kamar}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Power:</span>
                                    <span>{program.daya_terpasang}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!data?.programs?.length && (
                        <div
                            className="text-center py-4"
                            role="alert"
                            aria-label="No welfare programs found"
                        >
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No welfare programs found in this area</p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Please check your location settings or contact support</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}