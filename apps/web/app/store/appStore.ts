'use client';

import { create } from 'zustand';
import { Plan, Phase, Step, Screen, Clarification, ClarificationStatus, CodingAgent } from '../types/schemas';

import { executePlan } from '../utils/executor';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Generation steps for progressive unlock
export type GenerationStep = 'idle' | 'clarify' | 'architecture' | 'database' | 'api' | 'complete';

interface StreamingState {
    isStreaming: boolean;
    content: string;
    error: string | null;
}

interface AppState {
    // Current screen
    currentScreen: Screen;
    setCurrentScreen: (screen: Screen) => void;

    // Intent input
    intent: string;
    setIntent: (intent: string) => void;

    // Plan
    plan: Plan | null;
    generatePlanFromIntent: () => void;

    // Generation step tracking
    generationStep: GenerationStep;
    setGenerationStep: (step: GenerationStep) => void;

    // Active Tab tracking
    activeTab: string;
    setActiveTab: (tab: string) => void;

    // Streaming state per layer
    architectureStream: StreamingState;
    databaseStream: StreamingState;
    apiStream: StreamingState;

    // Clarification flow
    clarifications: Clarification[];
    clarificationStatus: ClarificationStatus;
    clarificationError: string | null;
    fetchClarifyingQuestions: () => Promise<void>;
    updateClarificationAnswer: (index: number, answer: string) => void;
    submitClarificationsAndGenerateArchitecture: () => Promise<void>;

    // Streaming actions
    streamArchitecture: () => Promise<void>;
    streamDatabase: () => Promise<void>;
    streamApiDesign: () => Promise<void>;
    streamBlueprint: () => Promise<void>;

    // Blueprint Stream state
    blueprintStream: StreamingState;

    // Plan editing
    toggleStep: (phaseId: string, stepId: string) => void;
    updateStepDescription: (phaseId: string, stepId: string, description: string) => void;
    reorderPhases: (fromIndex: number, toIndex: number) => void;

    // Execution
    isExecuting: boolean;
    executionProgress: number;
    executePlanSteps: () => Promise<void>;
    updateStepStatus: (phaseId: string, stepId: string, update: Partial<Step>) => void;

    // Blueprint Actions
    updatePhaseAgent: (phaseId: string, agent: CodingAgent) => void;
    addStepToPhase: (phaseId: string, title: string) => void;
    deleteStep: (phaseId: string, stepId: string) => void;
    updateStepDetails: (phaseId: string, stepId: string, description: string) => void;

    // Reset
    reset: () => void;
}

const initialStreamState: StreamingState = {
    isStreaming: false,
    content: '',
    error: null,
};

// Helper to consume SSE stream
async function consumeSSEStream(
    url: string,
    body: object,
    onChunk: (chunk: string) => void,
    onComplete: (fullContent: string) => void,
    onError: (error: string) => void
): Promise<void> {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.type === 'chunk') {
                            fullContent += data.content;
                            onChunk(data.content);
                        } else if (data.type === 'done') {
                            onComplete(data.content || fullContent);
                            return;
                        } else if (data.type === 'error') {
                            onError(data.error);
                            return;
                        }
                    } catch {
                        // Ignore parse errors
                    }
                }
            }
        }

        onComplete(fullContent);
    } catch (error) {
        onError(error instanceof Error ? error.message : 'Stream failed');
    }
}

export const useAppStore = create<AppState>((set, get) => ({
    // Initial state
    currentScreen: 'intent',
    intent: '',
    plan: null,
    isExecuting: false,
    executionProgress: 0,
    clarifications: [],
    clarificationStatus: 'idle',
    clarificationError: null,
    generationStep: 'idle',
    activeTab: 'clarification',
    architectureStream: { ...initialStreamState },
    databaseStream: { ...initialStreamState },
    apiStream: { ...initialStreamState },
    blueprintStream: { ...initialStreamState },

    // Actions
    setActiveTab: (tab) => set({ activeTab: tab }),

    // Actions
    setCurrentScreen: (screen) => set({ currentScreen: screen }),
    setIntent: (intent) => set({ intent }),
    setGenerationStep: (step) => set({ generationStep: step }),

    generatePlanFromIntent: () => {
        const { intent } = get();
        if (!intent.trim()) return;

        // Create minimal plan structure - phases will be filled by blueprint generation
        const newPlan = {
            id: `plan-${Date.now()}`,
            intent,
            phases: [],
            createdAt: new Date(),
        };
        set({ plan: newPlan, currentScreen: 'planning' });
    },

    // Clarification flow
    fetchClarifyingQuestions: async () => {
        const { intent } = get();
        if (!intent.trim()) return;

        set({ clarificationStatus: 'loading', clarificationError: null, generationStep: 'clarify' });

        try {
            const response = await fetch(`${API_BASE_URL}/api/clarify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: intent }),
            });

            const data = await response.json();

            if (data.success && data.questions && data.questions.length > 0) {
                const clarifications: Clarification[] = data.questions.map((q: string) => ({
                    question: q,
                    answer: '',
                }));
                set({ clarifications, clarificationStatus: 'ready', clarificationError: null });
            } else {
                set({
                    clarifications: [],
                    clarificationStatus: 'ready',
                    clarificationError: data.error || 'Failed to generate questions. Is LM Studio running?',
                });
            }
        } catch (error) {
            console.error('Failed to fetch clarifying questions:', error);
            set({
                clarifications: [],
                clarificationStatus: 'ready',
                clarificationError: error instanceof Error
                    ? `LLM Error: ${error.message}`
                    : 'Failed to connect to LLM.',
            });
        }
    },

    updateClarificationAnswer: (index, answer) => {
        const { clarifications } = get();
        const updated = [...clarifications];
        if (updated[index]) {
            updated[index] = { ...updated[index], answer };
        }
        set({ clarifications: updated });
    },

    // Stream Architecture
    streamArchitecture: async () => {
        const { intent, clarifications, plan } = get();

        set({
            generationStep: 'architecture',
            activeTab: 'architecture',
            architectureStream: { isStreaming: true, content: '', error: null },
        });

        const basePlan = plan || {
            id: `plan-${Date.now()}`,
            intent,
            phases: [],
            createdAt: new Date(),
        };
        set({ plan: basePlan });

        await consumeSSEStream(
            `${API_BASE_URL}/api/architecture`,
            {
                prompt: intent,
                clarifications: clarifications.filter(c => c.answer?.trim()),
            },
            (chunk) => {
                const current = get().architectureStream.content;
                set({
                    architectureStream: {
                        isStreaming: true,
                        content: current + chunk,
                        error: null,
                    },
                });
            },
            (fullContent) => {
                set({
                    architectureStream: {
                        isStreaming: false,
                        content: fullContent,
                        error: null,
                    },
                    clarificationStatus: 'completed',
                });
            },
            (error) => {
                set({
                    architectureStream: {
                        isStreaming: false,
                        content: get().architectureStream.content,
                        error,
                    },
                });
            }
        );
    },

    // Stream Database
    streamDatabase: async () => {
        const { intent, architectureStream } = get();

        set({
            generationStep: 'database',
            activeTab: 'database',
            databaseStream: { isStreaming: true, content: '', error: null },
        });

        await consumeSSEStream(
            `${API_BASE_URL}/api/database`,
            {
                intent,
                architecture: architectureStream.content,
            },
            (chunk) => {
                const current = get().databaseStream.content;
                set({
                    databaseStream: {
                        isStreaming: true,
                        content: current + chunk,
                        error: null,
                    },
                });
            },
            (fullContent) => {
                set({
                    databaseStream: {
                        isStreaming: false,
                        content: fullContent,
                        error: null,
                    },
                });
            },
            (error) => {
                set({
                    databaseStream: {
                        isStreaming: false,
                        content: get().databaseStream.content,
                        error,
                    },
                });
            }
        );
    },

    // Stream API Design
    streamApiDesign: async () => {
        const { intent, architectureStream, databaseStream } = get();

        set({
            generationStep: 'api',
            activeTab: 'api',
            apiStream: { isStreaming: true, content: '', error: null },
        });

        await consumeSSEStream(
            `${API_BASE_URL}/api/api-design`,
            {
                intent,
                architecture: architectureStream.content,
                database: databaseStream.content,
            },
            (chunk) => {
                const current = get().apiStream.content;
                set({
                    apiStream: {
                        isStreaming: true,
                        content: current + chunk,
                        error: null,
                    },
                });
            },
            (fullContent) => {
                set({
                    apiStream: {
                        isStreaming: false,
                        content: fullContent,
                        error: null,
                    },
                    generationStep: 'complete', // Unlock Blueprint tab after API design completes
                });
                // Auto-trigger blueprint generation? Or let user click?
                // User didn't specify auto-trigger, but "after API Design step completes" implies it.
                // But BlueprintTab has a button. Let's start with button.
            },
            (error) => {
                set({
                    apiStream: {
                        isStreaming: false,
                        content: get().apiStream.content,
                        error,
                    },
                });
            }
        );
    },

    // Stream Blueprint
    streamBlueprint: async () => {
        const { intent, architectureStream, databaseStream, apiStream, plan } = get();

        set({
            generationStep: 'complete', // Move to blueprint view
            activeTab: 'blueprint',
            blueprintStream: { isStreaming: true, content: '', error: null },
        });

        await consumeSSEStream(
            `${API_BASE_URL}/api/blueprint`,
            {
                intent,
                architecture: architectureStream.content,
                database: databaseStream.content,
                api: apiStream.content,
            },
            (chunk) => {
                const current = get().blueprintStream.content;
                set({
                    blueprintStream: {
                        isStreaming: true,
                        content: current + chunk,
                        error: null,
                    },
                });
            },
            (fullContent) => {
                set({
                    blueprintStream: {
                        isStreaming: false,
                        content: fullContent,
                        error: null,
                    },
                });

                // Parse and update Plan with robust JSON extraction
                try {
                    let jsonString = fullContent.trim();

                    // Try multiple extraction patterns
                    // 1. Check for markdown code blocks
                    const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
                    if (codeBlockMatch) {
                        jsonString = codeBlockMatch[1].trim();
                    }

                    // 2. Find JSON object boundaries
                    const jsonStart = jsonString.indexOf('{');
                    const jsonEnd = jsonString.lastIndexOf('}');
                    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                        jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
                    }

                    const parsed = JSON.parse(jsonString);
                    if (parsed && parsed.phases) {
                        const currentPlan = plan || {
                            id: `plan-${Date.now()}`,
                            intent,
                            createdAt: new Date(),
                            phases: [],
                            techStack: [],
                        };

                        set({
                            plan: {
                                ...currentPlan,
                                phases: parsed.phases
                            }
                        });
                        console.log('Blueprint parsed successfully:', parsed.phases.length, 'phases');
                    } else {
                        console.warn('Parsed blueprint has no phases:', parsed);
                    }
                } catch (e) {
                    console.error('Failed to parse blueprint JSON:', e);
                    console.error('Raw content length:', fullContent.length);
                    set({
                        blueprintStream: {
                            isStreaming: false,
                            content: fullContent,
                            error: 'Failed to parse generated plan. Check console for details.',
                        }
                    });
                }
            },
            (error) => {
                set({
                    blueprintStream: {
                        isStreaming: false,
                        content: get().blueprintStream.content,
                        error,
                    },
                });
            }
        );
    },

    // Legacy function - now starts streaming flow
    submitClarificationsAndGenerateArchitecture: async () => {
        await get().streamArchitecture();
    },

    toggleStep: (phaseId, stepId) => {
        const { plan } = get();
        if (!plan) return;

        const updatedPhases = plan.phases.map((phase) => {
            if (phase.id !== phaseId) return phase;
            return {
                ...phase,
                steps: phase.steps.map((step) =>
                    step.id === stepId ? { ...step, enabled: !step.enabled } : step
                ),
            };
        });

        set({ plan: { ...plan, phases: updatedPhases } });
    },

    updateStepDescription: (phaseId, stepId, description) => {
        const { plan } = get();
        if (!plan) return;

        const updatedPhases = plan.phases.map((phase) => {
            if (phase.id !== phaseId) return phase;
            return {
                ...phase,
                steps: phase.steps.map((step) =>
                    step.id === stepId ? { ...step, description } : step
                ),
            };
        });

        set({ plan: { ...plan, phases: updatedPhases } });
    },

    reorderPhases: (fromIndex, toIndex) => {
        const { plan } = get();
        if (!plan) return;

        const phases = [...plan.phases];
        const [removed] = phases.splice(fromIndex, 1);
        if (removed) {
            phases.splice(toIndex, 0, removed);
        }

        set({ plan: { ...plan, phases } });
    },

    updateStepStatus: (phaseId, stepId, update) => {
        const { plan } = get();
        if (!plan) return;

        const updatedPhases = plan.phases.map((phase) => {
            if (phase.id !== phaseId) return phase;
            return {
                ...phase,
                steps: phase.steps.map((step) =>
                    step.id === stepId ? { ...step, ...update } : step
                ),
            };
        });

        set({ plan: { ...plan, phases: updatedPhases } });
    },

    updatePhaseAgent: (phaseId, agent) => {
        const { plan } = get();
        if (!plan) return;

        const newPhases = plan.phases.map((phase) => {
            if (phase.id !== phaseId) return phase;
            return { ...phase, assignedAgent: agent };
        });

        set({ plan: { ...plan, phases: newPhases } });
    },

    addStepToPhase: (phaseId, title) => {
        const { plan } = get();
        if (!plan) return;

        const newPhases = plan.phases.map((phase) => {
            if (phase.id !== phaseId) return phase;

            const newStep = { // Assuming Step type is defined elsewhere or inferred
                id: `manual-${Date.now()}`,
                title,
                description: 'Manually added step',
                enabled: true,
                status: 'pending' as const
            };

            return {
                ...phase,
                steps: [...phase.steps, newStep]
            };
        });

        set({ plan: { ...plan, phases: newPhases } });
    },

    deleteStep: (phaseId, stepId) => {
        const { plan } = get();
        if (!plan) return;

        const newPhases = plan.phases.map((phase) => {
            if (phase.id !== phaseId) return phase;
            return {
                ...phase,
                steps: phase.steps.filter(s => s.id !== stepId)
            };
        });

        const newPlan = { ...plan, phases: newPhases };
        // Recalculate phases if empty? No, keep empty phase.
        set({ plan: newPlan });
    },

    updateStepDetails: (phaseId, stepId, description) => {
        const { plan } = get();
        if (!plan) return;

        const newPhases = plan.phases.map((phase) => {
            if (phase.id !== phaseId) return phase;
            return {
                ...phase,
                steps: phase.steps.map(step => {
                    if (step.id !== stepId) return step;
                    return { ...step, description };
                })
            };
        });

        set({ plan: { ...plan, phases: newPhases } });
    },


    executePlanSteps: async () => {
        const { plan, updateStepStatus } = get();
        if (!plan) return;

        set({ isExecuting: true, currentScreen: 'execution', executionProgress: 0 });

        await executePlan(plan.phases, (phaseId, stepId, update) => {
            updateStepStatus(phaseId, stepId, update);
        });

        set({ isExecuting: false });
    },

    reset: () => {
        set({
            currentScreen: 'intent',
            intent: '',
            plan: null,
            isExecuting: false,
            executionProgress: 0,
            clarifications: [],
            clarificationStatus: 'idle',
            clarificationError: null,
            generationStep: 'idle',
            architectureStream: { ...initialStreamState },
            databaseStream: { ...initialStreamState },
            apiStream: { ...initialStreamState },
        });
    },
}));
