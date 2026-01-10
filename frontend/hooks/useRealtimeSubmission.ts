"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/hooks/use-toast'

type SubmissionStatus = 'pending' | 'success' | 'failure' | 'error'

interface UseRealtimeSubmissionProps {
    submissionId: number | null
    initialStatus?: SubmissionStatus
    onComplete?: (status: SubmissionStatus) => void
}

export function useRealtimeSubmission({ submissionId, initialStatus = 'pending', onComplete }: UseRealtimeSubmissionProps) {
    const [status, setStatus] = useState<SubmissionStatus>(initialStatus)
    const { toast } = useToast()

    useEffect(() => {
        if (!submissionId) return

        // Subscribe to changes in the submissions table for this specific submission
        const channel = supabase
            .channel(`submission-${submissionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'submissions',
                    filter: `id=eq.${submissionId}`,
                },
                (payload) => {
                    const newStatus = payload.new.status as SubmissionStatus
                    setStatus(newStatus)

                    if (newStatus === 'success') {
                        toast({
                            title: "Submission Passed! 🎉",
                            description: "Great job! All test cases passed.",
                            variant: "default", // Success style (or add custom success variant)
                        })
                        if (onComplete) onComplete(newStatus)
                    } else if (newStatus === 'failure') {
                        toast({
                            title: "Submission Failed ❌",
                            description: "Some test cases failed. Check the output.",
                            variant: "destructive",
                        })
                        if (onComplete) onComplete(newStatus)
                    } else if (newStatus === 'error') {
                        toast({
                            title: "Execution Error ⚠️",
                            description: "There was an error running your code.",
                            variant: "destructive",
                        })
                        if (onComplete) onComplete(newStatus)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [submissionId, toast, onComplete])

    return { status }
}
