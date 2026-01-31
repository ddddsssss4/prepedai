import { ReactNode } from 'react';
import { ExecutionStatus, RiskLevel } from '../types/schemas';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
    status?: ExecutionStatus;
    risk?: RiskLevel;
    children?: ReactNode;
    className?: string;
}

export function StatusBadge({ status, risk, children, className = '' }: StatusBadgeProps) {
    const type = status || risk;
    const label = children || type;

    return (
        <span className={`${styles.badge} ${type ? styles[type] : ''} ${className}`}>
            {status && <span className={styles.indicator}></span>}
            {label}
        </span>
    );
}
