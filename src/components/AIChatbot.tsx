import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateInfrastructurePrompt } from '@/utils/promptGenerator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// Types and Interfaces
interface TTSConfig {
    subscriptionKey: string;
    region: string;
}

interface TextSegment {
    text: string;
    language: 'id' | 'en';
}

// Language Detection Constants
const INDONESIAN_MARKERS = {
    particles: ['lah', 'kah', 'pun', 'lho', 'kok', 'sih', 'deh', 'dong', 'kan'],
    prepositions: ['di', 'ke', 'dari', 'pada', 'dalam', 'dengan', 'oleh', 'kepada', 'untuk'],
    conjunctions: ['dan', 'atau', 'tetapi', 'namun', 'serta', 'karena', 'jika', 'kalau', 'bila'],
    pronouns: ['saya', 'aku', 'kamu', 'anda', 'dia', 'mereka', 'kita', 'kami'],
    common: ['yang', 'ini', 'itu', 'juga', 'sudah', 'akan', 'bisa', 'ada', 'tidak', 'belum', 'sedang', 'telah']
};

const TECHNICAL_TERMS = [
    // Infrastructure terms
    'traffic', 'density', 'pipeline', 'highway', 'road', 'maintenance',
    'flow rate', 'pressure', 'substation', 'transmission', 'voltage',
    // Status terms
    'online', 'offline', 'status', 'pending', 'active', 'inactive',
    // Technical terms
    'server', 'system', 'database', 'network', 'backup', 'gateway',
    // Measurement terms
    'meter', 'kilometer', 'watt', 'voltage', 'ampere', 'frequency'
];

class BilingualTextProcessor {
    private readonly technicalTermsRegex: RegExp;

    constructor() {
        this.technicalTermsRegex = new RegExp(
            `\\b(${TECHNICAL_TERMS.join('|')})\\b`,
            'i'
        );
    }

    isIndonesianWord(word: string): boolean {
        const normalizedWord = word.toLowerCase();
        return Object.values(INDONESIAN_MARKERS).flat().includes(normalizedWord);
    }

    isTechnicalTerm(word: string): boolean {
        return this.technicalTermsRegex.test(word);
    }

    private cleanWord(word: string): string {
        return word.replace(/[.,!?;:"()[\]{}]/g, '').trim();
    }

    processText(text: string): TextSegment[] {
        const segments: TextSegment[] = [];
        let currentSegment: TextSegment = { text: '', language: 'id' };

        const words = text.split(/(\s+)/);

        words.forEach((word) => {
            if (/^\s+$/.test(word)) {
                currentSegment.text += word;
                return;
            }

            const cleanWord = this.cleanWord(word);
            let wordLanguage: 'id' | 'en';

            if (this.isTechnicalTerm(cleanWord)) {
                wordLanguage = 'en';
            } else if (this.isIndonesianWord(cleanWord)) {
                wordLanguage = 'id';
            } else {
                wordLanguage = currentSegment.language || 'id';
            }

            if (wordLanguage !== currentSegment.language && currentSegment.text.trim()) {
                segments.push({ ...currentSegment });
                currentSegment = { text: '', language: wordLanguage };
            }

            currentSegment.text += word;
            currentSegment.language = wordLanguage;
        });

        if (currentSegment.text.trim()) {
            segments.push(currentSegment);
        }

        return this.mergeAdjacentSegments(segments);
    }

    private mergeAdjacentSegments(segments: TextSegment[]): TextSegment[] {
        return segments.reduce((merged: TextSegment[], current) => {
            if (merged.length === 0) {
                return [current];
            }

            const previous = merged[merged.length - 1];
            if (previous.language === current.language) {
                previous.text += current.text;
                return merged;
            }

            return [...merged, current];
        }, []);
    }
}

class TTS {
    private speechConfig: sdk.SpeechConfig;
    private currentSynthesizer: sdk.SpeechSynthesizer | null = null;
    private textProcessor: BilingualTextProcessor;

    constructor(config: TTSConfig) {
        this.speechConfig = sdk.SpeechConfig.fromSubscription(
            config.subscriptionKey,
            config.region
        );
        this.speechConfig.speechSynthesisVoiceName = 'id-ID-GadisNeural';
        this.textProcessor = new BilingualTextProcessor();
    }

    async speak(text: string): Promise<void> {
        try {
            this.stop();

            if (!this.currentSynthesizer) {
                this.currentSynthesizer = new sdk.SpeechSynthesizer(this.speechConfig);
            }

            const segments = this.textProcessor.processText(text);
            const combinedText = segments
                .map(segment => segment.text.trim())
                .filter(text => text.length > 0)
                .join(' ');

            await new Promise<void>((resolve, reject) => {
                if (!this.currentSynthesizer) {
                    reject(new Error('Synthesizer not initialized'));
                    return;
                }

                this.currentSynthesizer.speakTextAsync(
                    combinedText,
                    result => {
                        resolve();
                    },
                    error => {
                        reject(error);
                    }
                );
            });
        } catch (error) {
            console.error('TTS Error:', error);
            throw error;
        }
    }

    stop(): void {
        if (this.currentSynthesizer) {
            this.currentSynthesizer.close();
            this.currentSynthesizer = null;
        }
    }
}

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

interface Message {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

interface GeoLocation {
    latitude: number;
    longitude: number;
}

export const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [location, setLocation] = useState<GeoLocation | null>(null);
    const [sessionId, setSessionId] = useState<string>('');
    const [tts] = useState(() => new TTS({
        subscriptionKey: process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || '',
        region: process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || ''
    }));

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        });
    }, []);

    const clearSession = () => {
        if (!sessionId) return;
        localStorage.removeItem(`messages_${sessionId}`);
        localStorage.removeItem('chatSessionId');
        setMessages([]);
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
        localStorage.setItem('chatSessionId', newSessionId);
    };

    useEffect(() => {
        return () => {
            if (tts) {
                tts.stop();
            }
        };
    }, [isOpen]);

    useEffect(() => {
        const existingSessionId = localStorage.getItem('chatSessionId');
        if (existingSessionId) {
            setSessionId(existingSessionId);
            const savedMessages = localStorage.getItem(`messages_${existingSessionId}`);
            if (savedMessages) {
                const parsedMessages = JSON.parse(savedMessages).map((msg: Message) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                setMessages(parsedMessages);
            }
        } else {
            const newSessionId = uuidv4();
            setSessionId(newSessionId);
            localStorage.setItem('chatSessionId', newSessionId);
        }
    }, []);

    useEffect(() => {
        if (sessionId && messages.length > 0) {
            localStorage.setItem(`messages_${sessionId}`, JSON.stringify(messages));
        }
    }, [messages, sessionId]);

    const speakResponse = async (text: string) => {
        try {
            await tts.speak(text);
        } catch (error) {
            console.error('Failed to speak response:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if location exists
        if (!input.trim() || !location) {
            console.log('Missing input or location:', { input, location });
            return;
        }

        try {
            // Add user message
            const userMessage: Message = {
                id: Date.now().toString(),
                type: 'user',
                content: input,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);
            setInput('');
            setIsLoading(true);

            // Log the request data
            console.log('Sending request with:', {
                location,
                input,
                messagesCount: messages.length
            });

            const contextPrompt = generateInfrastructurePrompt(location.latitude, location.longitude, input);
            const conversationHistory = messages.map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));

            // Make the API call
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: conversationHistory,
                    contextPrompt,
                    sessionId,
                }),
            });

            // Log the response status
            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response from AI');
            }

            if (!data.response) {
                throw new Error('No response received from AI');
            }

            // Add AI response
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
            speakResponse(data.response);

        } catch (error) {
            console.error('Detailed error:', {
                error,
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                stack: error instanceof Error ? error.stack : undefined
            });

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: "Mohon maaf, terjadi kesalahan dalam memproses permintaan Anda. Silakan coba lagi nanti.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed right-6 bottom-6 z-50">
            {/* Chat Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-full w-14 h-14 bg-violet-400 hover:bg-violet-500 text-white shadow-xl transition-all duration-200 ease-in-out transform hover:scale-105"
            >
                {isOpen ?
                    <X className="w-6 h-6 text-white" /> :
                    <MessageSquare className="w-6 h-6 text-white" />
                }
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[450px] h-[85vh] bg-white dark:bg-black rounded-2xl shadow-2xl flex flex-col border border-violet-200 transition-all duration-200 ease-in-out">
                    {/* Header */}
                    <div className="p-6 border-b border-violet-200 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-violet-950 dark:text-violet-50">
                                AI City Assistant
                            </h3>
                            <p className="text-sm text-violet-600 dark:text-violet-200 mt-1">
                                Ask about infrastructure, metrics, and insights
                            </p>
                        </div>
                        <Button
                            onClick={clearSession}
                            variant="ghost"
                            className="hover:bg-violet-100 dark:hover:bg-violet-900"
                        >
                            <Trash2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl p-4 ${message.type === 'user'
                                        ? 'text-slate-100 bg-violet-400 ml-auto rounded-br-sm'
                                        : 'text-black bg-violet-50 mr-auto rounded-bl-sm'
                                        } shadow-sm`}
                                >
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    return (
                                                        <code
                                                            className={`${className} ${inline
                                                                ? 'bg-violet-100 text-violet-900 px-1 py-0.5 rounded'
                                                                : 'block bg-violet-100 text-violet-900 p-2 rounded-lg overflow-x-auto'
                                                                }`}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                    <div className={`text-xs mt-1 ${message.type === 'user'
                                        ? 'text-violet-200'
                                        : 'text-violet-400'
                                        }`}>
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-violet-50 dark:bg-violet-900/50 rounded-2xl p-4 shadow-sm">
                                    <Loader2 className="w-5 h-5 animate-spin text-violet-600 dark:text-violet-400" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-6 border-t border-violet-200">
                        <form onSubmit={handleSubmit} className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about city insights..."
                                className="flex-1 rounded-xl border border-violet-200 bg-white dark:bg-black p-4 text-violet-950 dark:text-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-600 placeholder-violet-400 dark:placeholder-violet-200"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="rounded-xl bg-violet-400 hover:bg-violet-500 text-white px-6 transition-all duration-200 ease-in-out transform hover:scale-105"
                            >
                                <Send className="w-5 h-5 text-white" />
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
