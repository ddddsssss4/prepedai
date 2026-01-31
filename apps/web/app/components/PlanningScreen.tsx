'use client';

import { useAppStore } from '../store/appStore';
import { Button } from './Button';
import { PhaseCard } from './PhaseCard';
import styles from './PlanningScreen.module.css';

export function PlanningScreen() {
    const { plan, executePlanSteps, reorderPhases, reset } = useAppStore();

    if (!plan) return null;

    const handleExecute = () => {
        executePlanSteps();
    };

    const handleMovePhase = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        reorderPhases(index, newIndex);
    };

    const totalSteps = plan.phases.reduce(
        (acc, phase) => acc + phase.steps.length,
        0
    );
    const enabledSteps = plan.phases.reduce(
        (acc, phase) => acc + phase.steps.filter(s => s.enabled).length,
        0
    );

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div>
                        <h1 className="fade-in">Plan Review</h1>
                        <p className={styles.subtitle}>
                            Review and customize your plan before execution
                        </p>
                        <div className={styles.intentDisplay}>
                            <span className={styles.intentLabel}>Goal:</span>
                            <span className={styles.intentText}>{plan.intent}</span>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button variant="ghost" onClick={reset}>
                            ← Back to Intent
                        </Button>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleExecute}
                            disabled={enabledSteps === 0}
                        >
                            Execute Plan ({enabledSteps} steps) →
                        </Button>
                    </div>
                </div>

                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{plan.phases.length}</div>
                        <div className={styles.statLabel}>Phases</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{enabledSteps}</div>
                        <div className={styles.statLabel}>Enabled Steps</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{totalSteps}</div>
                        <div className={styles.statLabel}>Total Steps</div>
                    </div>
                </div>

                <div className={styles.hint}>
                    💡 <strong>Tip:</strong> Double-click any step to edit it. Use checkboxes to enable/disable steps.
                </div>

                <div className={styles.phases}>
                    {plan.phases.map((phase, index) => (
                        <PhaseCard
                            key={phase.id}
                            phase={phase}
                            index={index}
                            canMoveUp={index > 0}
                            canMoveDown={index < plan.phases.length - 1}
                            onMoveUp={() => handleMovePhase(index, 'up')}
                            onMoveDown={() => handleMovePhase(index, 'down')}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
