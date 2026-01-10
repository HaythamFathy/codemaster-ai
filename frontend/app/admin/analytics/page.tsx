"use client"

import { useEffect, useState } from "react"
import { StatsCard, OverviewCharts } from "@/components/admin/AnalyticsDashboard"
import { Users, DollarSign, BookOpen, Activity, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

export default function AnalyticsPage() {
    const [overview, setOverview] = useState<any>(null)
    const [growth, setGrowth] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [overviewRes, growthRes] = await Promise.all([
                api.get('/admin/stats/overview'),
                api.get('/admin/stats/growth?days=30')
            ])
            setOverview(overviewRes.data)
            setGrowth(growthRes.data)
        } catch (error) {
            console.error("Failed to fetch analytics", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Analytics</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={fetchData} variant="outline" size="sm">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value={`$${overview?.total_revenue || 0}`}
                    icon={DollarSign}
                    description="Estimated based on pro users"
                />
                <StatsCard
                    title="Active Students"
                    value={`+${overview?.active_students || 0}`}
                    icon={Users}
                    description="Active learners this month"
                />
                <StatsCard
                    title="Total Courses"
                    value={overview?.total_courses || 0}
                    icon={BookOpen}
                    description="Published content"
                />
                <StatsCard
                    title="Enrollments"
                    value={overview?.total_enrollments || 0}
                    icon={Activity}
                    description="Total course signups"
                />
            </div>

            {/* Charts */}
            <OverviewCharts growthData={growth} />
        </div>
    )
}
