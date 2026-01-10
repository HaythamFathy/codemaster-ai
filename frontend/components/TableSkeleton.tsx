import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 5 }) {
    return (
        <div className="space-y-3">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg bg-white">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <Skeleton className="h-4 w-[50px]" />
                </div>
            ))}
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 p-8 space-y-8">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-16 w-32 rounded-xl" />
                    <Skeleton className="h-16 w-32 rounded-xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-80 bg-white rounded-xl overflow-hidden border border-gray-100">
                        <Skeleton className="h-44 w-full" />
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-10 w-full mt-4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
