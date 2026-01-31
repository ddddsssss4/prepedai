'use client';

import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { suggestedPrompts } from '../utils/planGenerator';
import { IntentSchema } from '../types/schemas';
import styles from './IntentScreen.module.css';

export function IntentScreen() {
    const { intent, setIntent, generatePlanFromIntent } = useAppStore();
    const [error, setError] = useState('');

    const handleGenerate = () => {
        // Validate intent
        const validation = IntentSchema.safeParse({ text: intent });

        if (!validation.success) {
            setError(validation.error.issues[0].message);
            return;
        }

        setError('');
        generatePlanFromIntent();
    };

    const handlePromptClick = (prompt: string) => {
        setIntent(prompt);
        setError('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Submit on Ctrl/Cmd + Enter
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleGenerate();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className="fade-in">What do you want to build?</h1>
                    <p className={styles.subtitle}>
                        Describe your task and let Traycer create a structured plan for you
                    </p>
                </div>

                <Card className={`${styles.inputCard} slide-in`}>
                    <textarea
                        className={styles.textarea}
                        placeholder="Example: Add authentication to my web app&#10;&#10;Be as specific as you'd like..."
                        value={intent}
                        onChange={(e) => setIntent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={6}
                    />

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.actions}>
                        <div className={styles.hint}>
                            <kbd>⌘</kbd> + <kbd>Enter</kbd> to generate
                        </div>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleGenerate}
                            disabled={!intent.trim()}
                        >
                            Generate Plan →
                        </Button>
                    </div>
                </Card>

                <div className={styles.suggestions}>
                    <p className={styles.suggestionsTitle}>Try these examples:</p>
                    <div className={styles.promptGrid}>
                        {suggestedPrompts.map((prompt, index) => (
                            <Card
                                key={index}
                                className={styles.promptCard}
                                hover
                                onClick={() => handlePromptClick(prompt)}
                            >
                                <div className={styles.promptIcon}>💡</div>
                                <div className={styles.promptText}>{prompt}</div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
