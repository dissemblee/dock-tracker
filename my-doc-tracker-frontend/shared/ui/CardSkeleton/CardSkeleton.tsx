import styles from "./CardSkeleton.module.scss";

export const CardSkeleton = () => (
  <div className={styles.skeleton}>
    <div className={styles.skeleton__left}>
      <div className={`${styles.shimmer} ${styles.skeleton__icon}`} />
      <div className={styles.skeleton__info}>
        <div className={`${styles.shimmer} ${styles.skeleton__name}`} />
        <div className={`${styles.shimmer} ${styles.skeleton__desc}`} />
      </div>
    </div>
    <div className={styles.skeleton__meta}>
      <div className={`${styles.shimmer} ${styles.skeleton__tag}`} />
      <div className={`${styles.shimmer} ${styles.skeleton__tag} ${styles.skeleton__tag_short}`} />
    </div>
    <div className={styles.skeleton__right}>
      <div className={`${styles.shimmer} ${styles.skeleton__date}`} />
      <div className={`${styles.shimmer} ${styles.skeleton__badge}`} />
    </div>
  </div>
);