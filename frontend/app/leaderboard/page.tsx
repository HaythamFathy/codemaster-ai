"use client";

import { useEffect, useState } from "react";
import api, { getLeaderboard } from "@/lib/api";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Loader2, Trophy, Medal } from "lucide-react";

interface User {
    id: number;
    full_name: string;
    xp_points: number;
    current_streak: number;
    avatar_url?: string;
}

export default function LeaderboardPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLeaderboard()
            .then(res => setUsers(res.data))
            .catch(err => console.error("Failed to fetch leaderboard", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-blue-900 mb-2 flex items-center justify-center gap-3">
                    <Trophy className="h-10 w-10 text-yellow-500" /> Leaderboard
                </h1>
                <p className="text-gray-600">Top learners competing for glory!</p>
            </div>
            <TableSkeleton rows={8} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-blue-900 mb-2 flex items-center justify-center gap-3">
                    <Trophy className="h-10 w-10 text-yellow-500" /> Leaderboard
                </h1>
                <p className="text-gray-600">Top learners competing for glory!</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Rank</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Student</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider text-right">XP Points</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider text-center">Streak</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user, index) => (
                                <tr key={user.id} className={`hover:bg-blue-50/50 transition-colors ${index < 3 ? 'bg-yellow-50/30' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {index === 0 && <Medal className="h-6 w-6 text-yellow-500 mr-2" />}
                                            {index === 1 && <Medal className="h-6 w-6 text-gray-400 mr-2" />}
                                            {index === 2 && <Medal className="h-6 w-6 text-amber-600 mr-2" />}
                                            <span className={`font-bold ${index < 3 ? 'text-gray-800' : 'text-gray-500'}`}>#{index + 1}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg mr-3 border-2 border-white shadow-sm">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.full_name} className="h-full w-full rounded-full object-cover" />
                                                ) : (
                                                    user.full_name?.charAt(0) || "U"
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{user.full_name || "Anonymous User"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {user.xp_points} XP
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="text-sm text-gray-900 font-medium">🔥 {user.current_streak} days</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
