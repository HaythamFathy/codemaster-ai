
import { Flame, Star } from "lucide-react";

interface StatsCardProps {
    streak: number;
    xp: number;
    className?: string; // Allow optional styling from parent
}

export function StatsCard({ streak, xp, className }: StatsCardProps) {
    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <div className="flex items-center gap-1 rounded bg-orange-100 px-3 py-1 text-orange-600 font-bold border border-orange-200">
                <Flame className="fill-orange-500 h-4 w-4" />
                <span>{streak} Day Streak</span>
            </div>

            <div className="flex items-center gap-1 rounded bg-yellow-100 px-3 py-1 text-yellow-700 font-bold border border-yellow-200">
                <Star className="fill-yellow-500 h-4 w-4" />
                <span>{xp} XP</span>
            </div>
        </div>
    );
}
