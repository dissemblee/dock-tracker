import { useState } from "react";
import { useGetMyCompaniesQuery, useGetCurrentCompanyQuery } from "@entities/company";
import { useGetCurrentUserQuery, useUpdateWorkModeMutation } from "@entities/user";
import { useNavigate } from "react-router";
import { tokenStore } from "@shared/api/tokenStore";
import type { WorkMode } from "@entities/user";
import { CompanyPage } from "@app/pages/CompanyPage/CompanyPage";
import styles from "./CompaniesPage.module.scss";

export function CompaniesPage() {
  const { data: companies = [], isLoading } = useGetMyCompaniesQuery();
  const { data: currentCompany } = useGetCurrentCompanyQuery();
  const { data: currentUser } = useGetCurrentUserQuery();
  const [updateWorkMode] = useUpdateWorkModeMutation();
  const navigate = useNavigate();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const handleSwitchCompany = async (
    e: React.MouseEvent,
    companyId: number,
  ) => {
    e.stopPropagation();
    try {
      await updateWorkMode({
        workMode: "company" as WorkMode,
        activeCompanyId: companyId,
      }).unwrap();

      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          workMode: "company",
          activeCompanyId: companyId,
        };
        tokenStore.set(JSON.stringify(updatedUser));
      }

      window.location.reload();
    } catch (err) {
      console.error("Ошибка при переключении:", err);
      alert("Не удалось переключить компанию");
    }
  };

  const handleCardClick = (companyId: number) => {
    setSelectedCompanyId(companyId);
  };

  const handleBack = () => {
    setSelectedCompanyId(null);
  };

  if (selectedCompanyId) {
    return <CompanyPage companyId={selectedCompanyId} onBack={handleBack} />;
  }

  if (isLoading) {
    return <div className={styles.loading}>Загрузка компаний...</div>;
  }

  if (companies.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2 className={styles.title}>Мои компании</h2>
        <p className={styles.emptyText}>
          У вас нет компаний. Создайте первую или примите приглашение.
        </p>
        <button onClick={() => navigate("/company/create")} className={styles.createButton}>
          + Создать компанию
        </button>
      </div>
    );
  }

  return (
    <div className={styles.companiesList}>
      <div className={styles.header}>
        <h2 className={styles.title}>Мои компании</h2>
        <button onClick={() => navigate("/company/create")} className={styles.createButton}>
          + Создать компанию
        </button>
      </div>

      <div className={styles.grid}>
        {companies.map((company) => {
          const isCurrent = currentCompany?.id === company.id;
          return (
            <div
              key={company.id}
              className={`${styles.card} ${isCurrent ? styles.currentCard : ""}`}
            >
              <div
                className={styles.cardContent}
                onClick={() => handleCardClick(company.id)}
              >
                {isCurrent && <span className={styles.currentBadge}>Текущая</span>}
                <h3 className={styles.companyName}>{company.name}</h3>
                <div className={styles.details}>
                  {company.inn && <p className={styles.detail}>ИНН: {company.inn}</p>}
                  {company.ogrn && <p className={styles.detail}>ОГРН: {company.ogrn}</p>}
                  {company.address && <p className={styles.detail}>Адрес: {company.address}</p>}
                  {company.email && <p className={styles.detail}>Email: {company.email}</p>}
                  {company.phone && <p className={styles.detail}>Телефон: {company.phone}</p>}
                  {company.website && <p className={styles.detail}>Сайт: {company.website}</p>}
                </div>
              </div>
              {!isCurrent && (
                <button
                  className={styles.switchButton}
                  onClick={(e) => handleSwitchCompany(e, company.id)}
                >
                  Переключиться
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
