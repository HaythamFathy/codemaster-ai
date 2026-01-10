"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getComments, postComment } from "@/lib/api";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
    id: number;
    content: string;
    created_at: string;
    user: {
        full_name: string;
        avatar_url?: string;
    }
}

export function LessonComments({ lessonId }: { lessonId: number }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        loadComments();
    }, [lessonId]);

    const loadComments = async () => {
        setLoading(true);
        try {
            const res = await getComments(lessonId);
            setComments(res.data);
        } catch (error) {
            console.error("Failed to load comments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setPosting(true);
        try {
            const res = await postComment({ lessonId, content: newComment });
            // Add new comment to list immediately (optimistic update or re-fetch)
            // Ideally backend returns the full user object, but for now let's re-fetch to be safe
            await loadComments();
            setNewComment("");
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="mt-12 border-t pt-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Discussion
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
                <div className="flex-1">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ask a question or share your thoughts..."
                        className="min-h-[100px]"
                    />
                </div>
                <Button type="submit" disabled={posting || !newComment.trim()} className="h-auto px-6">
                    {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No comments yet. Be the first to start the discussion!</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={comment.user?.avatar_url} />
                                    <AvatarFallback>{comment.user?.full_name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between mb-1">
                                        <span className="font-bold text-sm text-gray-900">{comment.user?.full_name || "Anonymous"}</span>
                                        <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
