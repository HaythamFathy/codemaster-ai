import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    size === "default" && "h-9 px-4 py-2",
                    size === "sm" && "h-8 rounded-md px-3 text-xs",
                    size === "lg" && "h-10 rounded-md px-8",
                    size === "icon" && "h-9 w-9",
                    variant === "default" && "bg-slate-900 text-white hover:bg-slate-900/90 shadow",
                    variant === "outline" && "border border-input bg-transparent shadow-sm hover:bg-slate-100",
                    variant === "ghost" && "hover:bg-slate-100",
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
