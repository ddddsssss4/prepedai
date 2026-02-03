'use client';

import { useState, useEffect } from 'react';
import { Phase, Step } from '../types/schemas';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lightbulb, Check, Trash2 } from 'lucide-react';

interface StepDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    phase: Phase | null;
    step: Step | null;
    onSave?: (stepId: string, description: string) => void;
    onDelete?: (stepId: string) => void;
}

export function StepDetailDialog({
    isOpen,
    onClose,
    phase,
    step,
    onSave,
    onDelete
}: StepDetailDialogProps) {
    const [description, setDescription] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (step) {
            setDescription(step.description);
        }
    }, [step]);

    if (!phase || !step) return null;

    const handleSave = () => {
        onSave?.(step.id, description);
        onClose();
    };

    const handleDelete = () => {
        onDelete?.(step.id);
        onClose();
    };

    const handleAiGenerate = () => {
        setIsAiLoading(true);
        // Simulate AI generation
        setTimeout(() => {
            const aiSuggestions = [
                "Implement secure authentication middleware to validate JWT tokens and manage user sessions.",
                "Set up API endpoints for user login, registration, and password recovery using secure hashing algorithms.",
                "Create responsive UI components for the authentication flow, including form validation and error handling.",
                "Integrate third-party OAuth providers to allow users to sign in with their existing accounts."
            ];
            // Pick based on step id hash or random
            const suggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
            setDescription(prev => `${prev || ''}\n\n${suggestion}`);
            setIsAiLoading(false);
        }, 1500);
    };

    const getRiskColor = (risk: string): "destructive" | "outline" | "secondary" => {
        switch (risk) {
            case 'high': return 'destructive';
            case 'medium': return 'secondary';
            case 'low': return 'outline';
            default: return 'outline';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl p-0 gap-0 overflow-hidden">
                {/* Header Section */}
                <div className="p-6 pb-2">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-muted-foreground/80 font-medium text-sm">
                            Phase {phase.id}: {phase.name}
                        </div>
                        <Badge variant={getRiskColor(phase.risk)} className="uppercase tracking-wider font-mono text-[10px] h-6">
                            {phase.risk} Risk
                        </Badge>
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-6 pb-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                                {step.title}
                            </DialogTitle>
                            <Lightbulb
                                className={`h-5 w-5 cursor-pointer text-yellow-500 hover:text-yellow-400 transition-colors ${isAiLoading ? 'animate-pulse' : ''}`}
                                onClick={handleAiGenerate}
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[150px] bg-white/5 border-white/10 resize-none text-base focus-visible:ring-0 relative z-10"
                                placeholder="Detailed explanation of content inside..."
                            />
                            {/* AI Helper Tooltip Simulation */}
                            <div className="absolute -right-2 -top-10 bg-muted/80 backdrop-blur-md px-3 py-1 rounded-md text-xs text-muted-foreground border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                AI can help finalize this
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="rounded-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 px-6"
                        >
                            Done <Check className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
