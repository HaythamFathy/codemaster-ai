"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, BookOpen, TrendingUp, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export function StatsCard({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: any, description?: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    )
}

export function OverviewCharts({ growthData }: { growthData: any[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={growthData}>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip />
                            <Line type="monotone" dataKey="users" stroke="#adfa1d" strokeWidth={2} activeDot={{ r: 8 }} name="New Users" />
                            <Line type="monotone" dataKey="enrollments" stroke="#2563eb" strokeWidth={2} name="Enrollments" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Revenue (Estimated)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-gray-500 py-10">
                        {/* Placeholder for Revenue Chart if we had monthly data */}
                        <p>Monthly Revenue Trend</p>
                        <p className="text-xs">(Requires transactional history table)</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
