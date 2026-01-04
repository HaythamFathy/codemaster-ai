"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Cast to any to avoid type issues with dynamic import props in strict mode
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

interface VideoPlayerProps {
    url: string;
    onCompleted?: () => void;
}

export function VideoPlayer({ url, onCompleted }: VideoPlayerProps) {
    const [hasWindow, setHasWindow] = useState(false);

    useEffect(() => {
        setHasWindow(true);
    }, []);

    if (!hasWindow) return <div className="aspect-video w-full animate-pulse bg-gray-200 rounded-lg" />;

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg bg-black">
            <ReactPlayer
                url={url}
                width="100%"
                height="100%"
                controls
                onEnded={onCompleted}
                config={{
                    youtube: {
                        playerVars: { showinfo: 1 }
                    }
                }}
            />
        </div>
    );
}
