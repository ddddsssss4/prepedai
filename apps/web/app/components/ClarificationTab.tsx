'use client';

import { useAppStore } from '../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircleQuestion, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export function ClarificationTab() {
    const {
        clarifications,
        clarificationStatus,
        updateClarificationAnswer,
        submitClarificationsAndGenerateArchitecture,
    } = useAppStore();

    const allAnswered = clarifications.every(c => c.answer?.trim());

    if (clarificationStatus === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-muted-foreground font-mono text-sm animate-pulse">
                    {clarifications.length === 0
                        ? 'Generating clarifying questions...'
                        : 'Generating architecture design...'}
                </p>
            </div>
        );
    }

    if (clarificationStatus === 'completed') {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <p className="text-foreground text-xl font-semibold">Clarification Complete</p>
                <p className="text-muted-foreground">Switch to the Architecture tab to see your system design.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-primary">
                    <MessageCircleQuestion className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Clarifying Questions</h2>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Help us understand your requirements better. Answer these questions to generate a tailored architecture.
                </p>
            </div>

            <div className="grid gap-6 max-w-3xl mx-auto">
                {clarifications.map((clarification, index) => (
                    <div
                        key={index}
                        className="rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm p-6 space-y-4 transition-all hover:border-white/20"
                    >
                        <div className="flex items-start space-x-3">
                            <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/20 text-primary text-sm font-bold">
                                {index + 1}
                            </span>
                            <p className="text-foreground font-medium leading-relaxed pt-0.5">
                                {clarification.question}
                            </p>
                        </div>
                        <Input
                            placeholder="Type your answer here..."
                            value={clarification.answer || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateClarificationAnswer(index, e.target.value)}
                            className="bg-background/50 border-white/10 focus:border-primary/50"
                        />
                    </div>
                ))}
            </div>

            <div className="flex justify-center pt-8">
                <Button
                    size="lg"
                    disabled={!allAnswered}
                    onClick={submitClarificationsAndGenerateArchitecture}
                    className="h-14 px-10 text-lg font-semibold shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all bg-gradient-to-r from-primary to-primary/80 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Generate Architecture
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>

            {!allAnswered && (
                <p className="text-center text-sm text-muted-foreground">
                    Please answer all questions to continue
                </p>
            )}
        </div>
    );
}
