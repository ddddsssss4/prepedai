'use client';

import { CodingAgent } from '../../types/schemas';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Bot, Sparkles, Brain, User } from 'lucide-react';

interface AgentSelectorProps {
    value?: CodingAgent;
    onChange: (agent: CodingAgent) => void;
    className?: string;
}

const AGENTS: { value: CodingAgent; label: string; icon: React.ReactNode; description: string }[] = [
    {
        value: 'gemini',
        label: 'Gemini',
        icon: <Sparkles className="h-4 w-4 text-blue-400" />,
        description: 'Best for frontend & UI'
    },
    {
        value: 'claude',
        label: 'Claude',
        icon: <Brain className="h-4 w-4 text-orange-400" />,
        description: 'Best for backend & logic'
    },
    {
        value: 'gpt4',
        label: 'GPT-4',
        icon: <Bot className="h-4 w-4 text-green-400" />,
        description: 'General purpose'
    },
    {
        value: 'manual',
        label: 'Manual',
        icon: <User className="h-4 w-4 text-muted-foreground" />,
        description: 'Implement yourself'
    },
];

export function AgentSelector({ value, onChange, className }: AgentSelectorProps) {
    return (
        <Select value={value || 'manual'} onValueChange={(v) => onChange(v as CodingAgent)}>
            <SelectTrigger className={`w-[140px] h-8 text-xs ${className}`}>
                <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
                {AGENTS.map((agent) => (
                    <SelectItem key={agent.value} value={agent.value}>
                        <div className="flex items-center gap-2">
                            {agent.icon}
                            <div className="flex flex-col">
                                <span className="font-medium">{agent.label}</span>
                            </div>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
