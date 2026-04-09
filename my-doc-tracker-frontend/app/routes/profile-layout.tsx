import { Outlet, useLocation, Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "@features/hooks/use-auth";
import { useGetCurrentCompanyQuery } from "@entities/company";
import styles from "@app/pages/ProfilePage.module.scss";

export default function ProfileLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: currentCompany } = useGetCurrentCompanyQuery();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Определяем активную вкладку по URL
  const path = location.pathname;
  const activeTab = path.includes("/password")
    ? "password"
    : path.includes("/settings")
    ? "profile"
    : path.includes("/documents")
    ? "documents"
    : path.includes("/company")
    ? "company"
    : "overview";

  return (
    <div className={styles.profilePage}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>Dock Tracker</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || "Пользователь"}</span>
            {currentCompany && (
              <Link to="/company" className={styles.companyLink}>
                {currentCompany.name}
              </Link>
            )}
            <button onClick={handleLogout} className={styles.logoutButton}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.tabs}>
          <Link
            to="/profile"
            className={`${styles.tab} ${activeTab === "overview" ? styles.tabActive : ""}`}
          >
            Обзор
          </Link>
          <Link
            to="/profile/documents"
            className={`${styles.tab} ${activeTab === "documents" ? styles.tabActive : ""}`}
          >
            Документы
          </Link>
          <Link
            to="/profile/settings"
            className={`${styles.tab} ${activeTab === "profile" ? styles.tabActive : ""}`}
          >
            Профиль
          </Link>
          <Link
            to="/profile/password"
            className={`${styles.tab} ${activeTab === "password" ? styles.tabActive : ""}`}
          >
            Смена пароля
          </Link>
          <Link
            to="/company"
            className={`${styles.tab} ${activeTab === "company" ? styles.tabActive : ""}`}
          >
            Компания
          </Link>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
