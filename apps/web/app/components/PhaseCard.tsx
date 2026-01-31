'use client';

import { useState } from 'react';
import { Phase } from '../types/schemas';
import { StatusBadge } from './StatusBadge';
import { StepItem } from './StepItem';
import styles from './PhaseCard.module.css';

interface PhaseCardProps {
    phase: Phase;
    index: number;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

export function PhaseCard({
    phase,
    index,
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
}: PhaseCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const enabledSteps = phase.steps.filter(s => s.enabled).length;
    const totalSteps = phase.steps.length;

    return (
        <div className={styles.phaseCard}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.phaseNumber}>{index + 1}</div>
                    <div className={styles.headerInfo}>
                        <h3 className={styles.phaseName}>{phase.name}</h3>
                        <p className={styles.phaseDescription}>{phase.description}</p>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <StatusBadge risk={phase.risk}>Risk: {phase.risk}</StatusBadge>
                    <div className={styles.controls}>
                        <button
                            className={styles.controlBtn}
                            onClick={onMoveUp}
                            disabled={!canMoveUp}
                            title="Move up"
                        >
                            ↑
                        </button>
                        <button
                            className={styles.controlBtn}
                            onClick={onMoveDown}
                            disabled={!canMoveDown}
                            title="Move down"
                        >
                            ↓
                        </button>
                        <button
                            className={styles.controlBtn}
                            onClick={() => setIsExpanded(!isExpanded)}
                            title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            {isExpanded ? '▼' : '▶'}
                        </button>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className={styles.content}>
                    <div className={styles.meta}>
                        <span className={styles.stepCount}>
                            {enabledSteps} of {totalSteps} steps enabled
                        </span>
                        {phase.filesInvolved && phase.filesInvolved.length > 0 && (
                            <div className={styles.files}>
                                <span className={styles.filesLabel}>Files:</span>
                                {phase.filesInvolved.map((file, i) => (
                                    <code key={i} className={styles.file}>{file}</code>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.steps}>
                        {phase.steps.map((step) => (
                            <StepItem key={step.id} phaseId={phase.id} step={step} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
