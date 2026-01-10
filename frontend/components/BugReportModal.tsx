"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, X, Loader2, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function BugReportModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSending(false);
        setSent(true);
        setTimeout(() => {
            setSent(false);
            setIsOpen(false);
            setMessage("");
        }, 2000);
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full h-12 w-12 bg-gray-900 hover:bg-black text-white shadow-lg flex items-center justify-center p-0"
                    title="Report a bug"
                >
                    <MessageSquarePlus className="h-6 w-6" />
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-80 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <h3 className="font-bold text-gray-700 text-sm">Report an Issue</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-4">
                    {sent ? (
                        <div className="text-center py-6">
                            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                <Send className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-green-800 font-medium">Thanks for your feedback!</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe the bug or feature request..."
                                className="min-h-[100px] mb-4 text-sm resize-none"
                                required
                            />
                            <Button type="submit" disabled={sending} className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm">
                                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Send Feedback"}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
