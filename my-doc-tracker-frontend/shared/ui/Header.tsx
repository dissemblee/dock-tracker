import styles from "./Header.module.scss";

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

export function Header({ userName, onLogout }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📄</span>
          <span className={styles.logoText}>Dock Tracker</span>
        </div>

        <div className={styles.userSection}>
          <span className={styles.userName}>{userName}</span>
          <button onClick={onLogout} className={styles.logoutButton}>
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
