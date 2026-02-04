'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { IntentSchema } from '../types/schemas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Loader2, Sparkles, ArrowRight, Zap, Code, Send, AlertCircle } from 'lucide-react';

// Suggested prompts for users
const suggestedPrompts = [
    'Add authentication to my web app',
    'Refactor the dashboard component',
    'Create a new user profile feature',
    'Fix the data fetching bug',
    'Add dark mode toggle',
    'Implement form validation',
];

export default function IntentScreen() {
    const { setIntent, fetchClarifyingQuestions, setCurrentScreen, generatePlanFromIntent, intent } = useAppStore();
    const [localIntent, setLocalIntent] = useState(intent);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Focus textarea on mount
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    const handleSubmit = async () => {
        // Validate input
        const result = IntentSchema.safeParse({ text: localIntent });

        if (!result.success) {
            setError(result.error.issues[0]?.message || 'Invalid intent');
            return;
        }

        setError(null);
        setIsGenerating(true);

        // Update store
        setIntent(localIntent);

        // Generate base plan and navigate to planning screen
        generatePlanFromIntent();

        // Fetch clarifying questions in parallel
        await fetchClarifyingQuestions();

        setIsGenerating(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-80px)] relative overflow-hidden">
            {/* Ambient Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none mix-blend-screen" />

            <main className="flex-1 container max-w-5xl mx-auto px-6 py-12 flex flex-col justify-center gap-12 relative z-10">

                {/* Hero Section */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-2 text-muted-foreground/80">
                        <Zap className="h-4 w-4 fill-current" />
                        <span className="text-xs font-mono uppercase tracking-widest">Start Planning</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl leading-[1.1] drop-shadow-sm">
                        Transform <span className="text-muted-foreground">Ideas</span><br />
                        into Execution Plans
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Tell PrepedAI what you want to build. We analyze it, break it into phases, and create a
                        structured execution plan—pure orchestration, no fluff.
                    </p>
                </div>

                {/* Input Section - Apple Style Glassmorphism */}
                <div className="w-full max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="relative group">
                        {/* Glow effect on hover */}
                        <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-lg blur opacity-20 group-hover:opacity-60 transition duration-1000 ${error ? 'from-destructive/50 to-destructive/50 opacity-80' : ''}`}></div>

                        <div className="relative rounded-none border border-white/10 bg-black/40 backdrop-blur-xl backdrop-saturate-150 shadow-2xl transition-all duration-300">
                            <Textarea
                                ref={textareaRef}
                                value={localIntent}
                                onChange={(e) => setLocalIntent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Describe what you want to build... e.g., 'Add OAuth authentication, email verification, and user dashboard'"
                                className="min-h-[160px] resize-none bg-transparent border-none text-lg placeholder:text-muted-foreground/50 focus-visible:ring-0 p-6 text-foreground/90 selection:bg-primary/30"
                            />

                            <div className="flex justify-between items-center px-4 pb-4">
                                <div className="text-xs text-muted-foreground font-mono pl-2">
                                    {error && <span className="text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-left-2"><AlertCircle className="h-3 w-3" /> {error}</span>}
                                </div>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!localIntent.trim() || isGenerating}
                                    size="lg"
                                    className="rounded-none bg-white/10 hover:bg-white/20 text-foreground border border-white/10 backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    {isGenerating ? (
                                        <>Generating <span className="animate-pulse">...</span></>
                                    ) : (
                                        <>Generate Plan <ArrowRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-8">
                        <h3 className="text-sm font-semibold text-foreground/80 play-font ml-1">Try these examples:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {suggestedPrompts.slice(0, 4).map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => setLocalIntent(prompt)}
                                    className="flex items-center justify-between p-4 text-left border border-white/5 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group rounded-none hover:border-white/10"
                                >
                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                        {prompt}
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Powered By Footer */}
                <div className="pt-16 pb-8 border-t border-white/5 mt-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                    <p className="text-sm text-foreground/60 font-semibold mb-6">Powered by:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: 'OpenAI', status: 'Active', color: 'text-emerald-500' },
                            { name: 'Anthropic', status: 'Active', color: 'text-emerald-500' },
                            { name: 'Ollama', status: 'Active', color: 'text-emerald-500' },
                            { name: 'Local LLM', status: 'Setup Required', color: 'text-amber-500' }
                        ].map((provider) => (
                            <div key={provider.name} className="p-4 bg-white/5 border border-white/10 backdrop-blur-sm rounded-none hover:bg-white/10 transition-colors">
                                <div className="font-bold text-foreground">{provider.name}</div>
                                <div className={`text-xs font-mono mt-1 ${provider.color}`}>{provider.status}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>

            {/* Grain/Noise Overlay for Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] mix-blend-overlay" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }} />
        </div>
    );
}
