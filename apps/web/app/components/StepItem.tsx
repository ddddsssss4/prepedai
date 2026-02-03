'use client';

import { useState } from 'react';
import { Step } from '../types/schemas';
import { useAppStore } from '../store/appStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface StepItemProps {
    phaseId: string;
    step: Step;
}

export function StepItem({ phaseId, step }: StepItemProps) {
    const { toggleStep, updateStepDescription } = useAppStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState(step.description);

    const handleToggle = () => {
        if (step.status === 'pending') {
            toggleStep(phaseId, step.id);
        }
    };

    const handleDoubleClick = () => {
        if (step.status === 'pending') {
            setIsEditing(true);
        }
    };

    const handleSave = () => {
        if (editedDescription.trim()) {
            updateStepDescription(phaseId, step.id, editedDescription.trim());
        } else {
            setEditedDescription(step.description);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            setEditedDescription(step.description);
            setIsEditing(false);
        }
    };

    const getStatusIcon = () => {
        switch (step.status) {
            case 'completed': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
            default: return null;
        }
    };

    const getStatusVariant = () => {
        switch (step.status) {
            case 'completed': return 'success';
            case 'running': return 'default';
            case 'error': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <div
            className={cn(
                "group flex items-center gap-4 p-4 border border-border bg-card hover:bg-accent/50 transition-colors animate-in fade-in duration-300",
                !step.enabled && "opacity-50 grayscale bg-muted/50"
            )}
        >
            <div>
                <Checkbox
                    checked={step.enabled}
                    onCheckedChange={handleToggle}
                    disabled={step.status !== 'pending'}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
            </div>

            <div className="flex-1 space-y-2 h-full" onDoubleClick={handleDoubleClick}>
                {isEditing ? (
                    <Input
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="h-7 text-sm"
                    />
                ) : (
                    <div className="flex flex-col gap-1">
                        <span className={cn(
                            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                            step.status === 'completed' && "line-through text-muted-foreground"
                        )}>
                            {step.description}
                        </span>
                        {step.result && (
                            <div className="text-xs text-muted-foreground font-mono bg-muted p-2 border border-border">
                                {">"} {step.result}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {step.status !== 'pending' && (
                    <Badge variant={getStatusVariant()} className="h-6 gap-1.5 capitalize font-mono text-[10px]">
                        {getStatusIcon()}
                        {step.status}
                    </Badge>
                )}
            </div>
        </div>
    );
}
