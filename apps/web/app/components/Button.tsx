import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <span className={styles.spinner} />}
            <span className={loading ? styles.loadingText : ''}>{children}</span>
        </button>
    );
}
