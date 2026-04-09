import type { ReactNode } from 'react';
import styles from './TetrisBackground.module.scss';

export const Background = ({ children }: { children: ReactNode }) => (
  <div className={styles.glassBackground}>
    <div className={`${styles.orb} ${styles.orb1}`}></div>
    <div className={`${styles.orb} ${styles.orb2}`}></div>
    <div className={`${styles.orb} ${styles.orb3}`}></div>

    <div className={styles.glassContent}>{children}</div>
  </div>
);
