"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Loader2, BrainCircuit } from "lucide-react";
import api from "@/lib/api";

export function VoiceTutor({ lessonId, context }: { lessonId: number, context: string }) {
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [lastResponse, setLastResponse] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setIsListening(false);
                handleVoiceInput(transcript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [lessonId]);

    const handleVoiceInput = async (text: string) => {
        setIsThinking(true);
        try {
            // Send to AI
            const res = await api.post("/ai/hint", {
                lesson_id: lessonId,
                code_snippet: context,
                user_question: text
            });

            const aiResponse = res.data.hint;
            setLastResponse(aiResponse);
            speak(aiResponse);

        } catch (error) {
            console.error("AI Voice Error", error);
            speak("Sorry, I had trouble thinking of an answer.");
        } finally {
            setIsThinking(false);
        }
    };

    const speak = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    if (!recognitionRef.current) return null; // Hide if not supported

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {lastResponse && (
                <div className="absolute bottom-16 right-0 w-80 bg-white p-4 rounded-xl shadow-2xl border border-blue-100 mb-2 animate-in slide-in-from-bottom-5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-blue-600 flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4" /> AI Tutor
                        </span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setLastResponse(null)}>&times;</Button>
                    </div>
                    <p className="text-sm text-gray-700">{lastResponse}</p>
                </div>
            )}

            <Button
                onClick={toggleListening}
                className={`h-14 w-14 rounded-full shadow-xl transition-all ${isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" :
                        isThinking ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                {isThinking ? <Loader2 className="h-6 w-6 animate-spin" /> :
                    isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
        </div>
    );
}
