'use client';

import { useState } from 'react';
import { Step } from '../types/schemas';
import { useAppStore } from '../store/appStore';
import { StatusBadge } from './StatusBadge';
import styles from './StepItem.module.css';

interface StepItemProps {
    phaseId: string;
    step: Step;
}

export function StepItem({ phaseId, step }: StepItemProps) {
    const { toggleStep, updateStepDescription } = useAppStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState(step.description);

    const handleToggle = () => {
        toggleStep(phaseId, step.id);
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

    return (
        <div className={`${styles.stepItem} ${!step.enabled ? styles.disabled : ''}`}>
            <div className={styles.checkbox}>
                <input
                    type="checkbox"
                    checked={step.enabled}
                    onChange={handleToggle}
                    disabled={step.status !== 'pending'}
                />
            </div>

            <div className={styles.content} onDoubleClick={handleDoubleClick}>
                {isEditing ? (
                    <input
                        type="text"
                        className={styles.input}
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                ) : (
                    <span className={styles.description}>{step.description}</span>
                )}

                {step.result && (
                    <div className={styles.result}>{step.result}</div>
                )}
            </div>

            <StatusBadge status={step.status} />
        </div>
    );
}
