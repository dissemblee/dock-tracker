import styles from "./FormStats.module.scss"

interface FormStatsProps {
  current: object;
  total: number;
  icon?: string;
}

export const FormStats = ({ 
  current, 
  total, 
  icon = '✨' 
}: FormStatsProps) => {
  const filled = Object.values(current).filter(Boolean).length
  const percent = Math.round((filled / total) * 100)

  return (
    <div className={styles.formStats}>
      <div className={styles.formStats__pill}>
        <span className={styles.formStats__icon}>{icon}</span>
        <div className={styles.formStats__track}>
          <div 
            className={styles.formStats__bar}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className={styles.formStats__label}>
          {filled}/{total}
        </span>
      </div>
    </div>
  )
}
