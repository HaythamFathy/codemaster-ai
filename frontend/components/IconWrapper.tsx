import React, { Suspense } from 'react';
import { LucideProps } from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react'; // Fallback icon

interface IconWrapperProps extends LucideProps {
    name?: string;
    icon?: React.ComponentType<LucideProps>;
    ariaLabel?: string;
}

// IconWrapper component
// Acts as a unified interface for rendering icons
export const IconWrapper = ({
    name,
    icon: IconComponent,
    className,
    ariaLabel,
    ...props
}: IconWrapperProps) => {

    // 1. Prioritize direct component passing (Best for tree-shaking)
    if (IconComponent) {
        return (
            <IconComponent
                className={cn("w-5 h-5", className)}
                aria-label={ariaLabel || name || "icon"}
                aria-hidden={!ariaLabel}
                {...props}
            />
        );
    }

    // 2. Handle dynamic string names
    // Note: In a real large app, you might map this to specific imports 
    // to avoid including the entire icon set or breaking splitting.
    // For this implementation, we use next/dynamic to lazily load the requested icon.
    if (name) {
        // Convert kebab-case or snake_exe to PascalCase for component name matching
        // e.g., 'arrow-right' -> 'ArrowRight'
        const iconName = name
            .split(/[-_]/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');

        const LucideIcon = dynamic(() =>
            import('lucide-react').then((mod: any) => {
                const Component = mod[iconName];
                if (!Component) {
                    // Fallback if name not found in export
                    console.warn(`Icon "${iconName}" not found in lucide-react`);
                    return mod.HelpCircle; // Return a default icon
                }
                return Component;
            }),
            {
                loading: () => <Loader2 className="w-4 h-4 animate-spin" />,
                ssr: false // Client-side hydration for dynamic icons often safer
            }
        );

        return (
            <Suspense fallback={<Loader2 className="w-4 h-4 animate-spin" />}>
                <LucideIcon
                    className={cn("w-5 h-5", className)}
                    aria-label={ariaLabel || name}
                    {...props}
                />
            </Suspense>
        );
    }

    return null;
};
