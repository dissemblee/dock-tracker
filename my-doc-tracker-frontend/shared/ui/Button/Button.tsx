import React, { type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  nonBlock?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  nonBlock = false,
  loadingText = 'Загрузка...',
  loading,
  ...props
}: ButtonProps) => {
  const classes = [
    styles.Button,
    styles[`Button--${variant}`],
    loading && styles['Button--loading'],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      style={nonBlock ? undefined : { width: '100%' }}
      onClick={onClick}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className={styles.Button__loadingInner}>
          <span className={styles.Button__spinner} />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
};