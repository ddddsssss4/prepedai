'use client';

import { useAppStore } from '../store/appStore';
import { Button } from './Button';
import { PhaseCard } from './PhaseCard';
import styles from './ExecutionScreen.module.css';

export function ExecutionScreen() {
    const { plan, isExecuting, executionProgress, reset } = useAppStore();

    if (!plan) return null;

    const totalSteps = plan.phases.reduce(
        (acc, phase) => acc + phase.steps.filter(s => s.enabled).length,
        0
    );

    const completedSteps = plan.phases.reduce(
        (acc, phase) => acc + phase.steps.filter(s => s.enabled && s.status === 'completed').length,
        0
    );

    const failedSteps = plan.phases.reduce(
        (acc, phase) => acc + phase.steps.filter(s => s.enabled && s.status === 'error').length,
        0
    );

    const isComplete = !isExecuting && (completedSteps + failedSteps) === totalSteps;
    const hasErrors = failedSteps > 0;

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div>
                        <h1 className="fade-in">
                            {isExecuting ? 'Executing Plan...' : isComplete ? 'Execution Complete!' : 'Execution Paused'}
                        </h1>
                        <p className={styles.subtitle}>
                            {isExecuting
                                ? 'Watching the plan execute step by step'
                                : isComplete
                                    ? hasErrors
                                        ? 'Execution completed with errors'
                                        : 'All steps completed successfully'
                                    : 'Execution is in progress'}
                        </p>
                    </div>

                    {isComplete && (
                        <Button variant="primary" size="lg" onClick={reset}>
                            ← Start New Plan
                        </Button>
                    )}
                </div>

                <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                        <span className={styles.progressText}>
                            Progress: {completedSteps} / {totalSteps} steps
                        </span>
                        <span className={styles.progressPercent}>
                            {Math.round(executionProgress)}%
                        </span>
                    </div>

                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${executionProgress}%` }}
                        />
                    </div>

                    <div className={styles.stats}>
                        <div className={`${styles.statItem} ${styles.completed}`}>
                            <div className={styles.statIcon}>✓</div>
                            <div>
                                <div className={styles.statValue}>{completedSteps}</div>
                                <div className={styles.statLabel}>Completed</div>
                            </div>
                        </div>

                        <div className={`${styles.statItem} ${styles.failed}`}>
                            <div className={styles.statIcon}>✕</div>
                            <div>
                                <div className={styles.statValue}>{failedSteps}</div>
                                <div className={styles.statLabel}>Failed</div>
                            </div>
                        </div>

                        <div className={`${styles.statItem} ${styles.pending}`}>
                            <div className={styles.statIcon}>•</div>
                            <div>
                                <div className={styles.statValue}>{totalSteps - completedSteps - failedSteps}</div>
                                <div className={styles.statLabel}>Remaining</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.phases}>
                    {plan.phases.map((phase, index) => (
                        <PhaseCard
                            key={phase.id}
                            phase={phase}
                            index={index}
                            canMoveUp={false}
                            canMoveDown={false}
                            onMoveUp={() => { }}
                            onMoveDown={() => { }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
