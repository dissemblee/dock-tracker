import { useState } from "react";
import {
  useGetCurrentCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useGetCompanyMembersQuery,
  useInviteMemberMutation,
  useRemoveMemberMutation,
  useLazySearchUserByEmailQuery,
} from "@entities/company";
import { useGetCurrentUserQuery } from "@entities/user";
import type { CompanyCreateDto, CompanyUpdateDto, InviteMemberDto } from "@entities/company";
import styles from "./CompanyPage.module.scss";

type TabType = "members" | "settings" | "create";

export function CompanyPage() {
  const { data: currentUser, isLoading: userLoading } = useGetCurrentUserQuery();
  const { data: currentCompany, isLoading: companyLoading } = useGetCurrentCompanyQuery();
  const [createCompany] = useCreateCompanyMutation();
  const [updateCompany] = useUpdateCompanyMutation();
  const [inviteMember] = useInviteMemberMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [searchUserByEmail] = useLazySearchUserByEmailQuery();

  const [activeTab, setActiveTab] = useState<TabType>("members");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: number; name: string; email: string; companyId: number | null }>>([]);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const [companyForm, setCompanyForm] = useState<CompanyCreateDto>({
    name: "",
    inn: "",
  });

  const [settingsForm, setSettingsForm] = useState<CompanyUpdateDto>({
    name: "",
    inn: "",
  });

  const companyId = currentCompany?.id;
  const { data: membersData, isLoading: membersLoading } = useGetCompanyMembersQuery(companyId!, {
    skip: !companyId,
  });

  const members = membersData?.result || [];

  const isAdmin = currentUser?.role === "ADMIN";

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCompany(companyForm).unwrap();
      alert("Компания успешно создана!");
      setCompanyForm({ name: "", inn: "" });
    } catch (err) {
      console.error("Ошибка при создании:", err);
      alert("Ошибка при создании компании");
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCompany(settingsForm).unwrap();
      alert("Данные компании обновлены!");
    } catch (err) {
      console.error("Ошибка при обновлении:", err);
      alert("Ошибка при обновлении");
    }
  };

  const handleSearchUser = async (email: string) => {
    if (email.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const result = await searchUserByEmail(email).unwrap();
      setSearchResults(result);
    } catch (err) {
      console.error("Ошибка поиска:", err);
    }
  };

  const handleInviteUser = async (user: { id: number; name: string; email: string; companyId: number | null }) => {
    if (!companyId) return;

    if (user.companyId !== null) {
      setInviteError("Пользователь уже состоит в компании");
      return;
    }

    try {
      await inviteMember({ companyId, data: { email: user.email } }).unwrap();
      setInviteSuccess(`Пользователь ${user.name} добавлен в компанию`);
      setInviteEmail("");
      setSearchResults([]);
      setShowInviteModal(false);
      setTimeout(() => setInviteSuccess(""), 3000);
    } catch (err: any) {
      setInviteError(err.data?.message || "Ошибка при приглашении");
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!companyId) return;
    if (confirm("Вы уверены, что хотите удалить участника из компании?")) {
      try {
        await removeMember({ companyId, userId }).unwrap();
        alert("Участник удалён");
      } catch (err: any) {
        alert(err.data?.message || "Ошибка при удалении");
      }
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: "Администратор",
      MEMBER: "Сотрудник",
      NO_ROLE: "Без роли",
    };
    return labels[role] || role;
  };

  if (userLoading || companyLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  const hasCompany = !!currentCompany;

  return (
    <div className={styles.companyPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Компания</h1>

        {!hasCompany ? (
          <div className={styles.noCompany}>
            <p className={styles.noCompanyText}>
              У вас нет компании. Создайте компанию, чтобы приглашать участников и управлять документами.
            </p>
            <div className={styles.createForm}>
              <form onSubmit={handleCreateCompany} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="companyName" className={styles.label}>
                    Название компании *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className={styles.input}
                    placeholder="ООО Ромашка"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="inn" className={styles.label}>
                    ИНН (необязательно)
                  </label>
                  <input
                    type="text"
                    id="inn"
                    value={companyForm.inn || ""}
                    onChange={(e) => setCompanyForm({ ...companyForm, inn: e.target.value })}
                    className={styles.input}
                    placeholder="1234567890"
                    pattern="[0-9]{10,15}"
                  />
                </div>

                <button type="submit" className={styles.submitButton}>
                  Создать компанию
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.tabs}>
              <button
                onClick={() => setActiveTab("members")}
                className={`${styles.tab} ${activeTab === "members" ? styles.tabActive : ""}`}
              >
                Сотрудники
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`${styles.tab} ${activeTab === "settings" ? styles.tabActive : ""}`}
              >
                Настройки
              </button>
            </div>

            {activeTab === "members" && (
              <div className={styles.tabContent}>
                <div className={styles.membersHeader}>
                  <h2 className={styles.sectionTitle}>Сотрудники</h2>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setShowInviteModal(true);
                        setInviteError("");
                        setInviteSuccess("");
                      }}
                      className={styles.inviteButton}
                    >
                      + Пригласить
                    </button>
                  )}
                </div>

                {inviteSuccess && (
                  <div className={styles.successMessage}>{inviteSuccess}</div>
                )}

                {membersLoading ? (
                  <div className={styles.loading}>Загрузка участников...</div>
                ) : (
                  <div className={styles.membersList}>
                    {members.length === 0 ? (
                      <div className={styles.emptyMembers}>
                        В компании пока нет участников
                      </div>
                    ) : (
                      members.map((member: any) => (
                        <div key={member.id} className={styles.memberCard}>
                          <div className={styles.memberInfo}>
                            <div className={styles.memberName}>{member.name}</div>
                            <div className={styles.memberEmail}>{member.email}</div>
                          </div>
                          <div className={styles.memberRole}>
                            <span className={styles.roleBadge}>
                              {getRoleLabel(member.role)}
                            </span>
                          </div>
                          {isAdmin && member.id !== currentUser?.id && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className={styles.removeButton}
                            >
                              Удалить
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className={styles.tabContent}>
                <h2 className={styles.sectionTitle}>Данные компании</h2>
                <form onSubmit={handleUpdateCompany} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="settingsName" className={styles.label}>
                      Название компании
                    </label>
                    <input
                      type="text"
                      id="settingsName"
                      value={settingsForm.name || currentCompany?.name || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className={styles.input}
                      placeholder={currentCompany?.name}
                      minLength={2}
                      maxLength={100}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="settingsInn" className={styles.label}>
                      ИНН
                    </label>
                    <input
                      type="text"
                      id="settingsInn"
                      value={settingsForm.inn || currentCompany?.inn || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, inn: e.target.value })}
                      className={styles.input}
                      placeholder={currentCompany?.inn || "Не указан"}
                      pattern="[0-9]{10,15}"
                    />
                  </div>

                  <button type="submit" className={styles.submitButton}>
                    Сохранить изменения
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {showInviteModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3 className={styles.modalTitle}>Пригласить участника</h3>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteError("");
                  setInviteSuccess("");
                  setSearchResults([]);
                }}
                className={styles.modalClose}
              >
                ×
              </button>

              {inviteError && <div className={styles.errorMessage}>{inviteError}</div>}

              <div className={styles.searchBox}>
                <label htmlFor="inviteEmail" className={styles.label}>
                  Поиск по email
                </label>
                <input
                  type="email"
                  id="inviteEmail"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    handleSearchUser(e.target.value);
                  }}
                  className={styles.input}
                  placeholder="user@example.com"
                />
              </div>

              {searchResults.length > 0 && (
                <div className={styles.searchResults}>
                  {searchResults.map((user) => (
                    <div key={user.id} className={styles.searchResultItem}>
                      <div className={styles.searchResultInfo}>
                        <span className={styles.searchResultName}>{user.name}</span>
                        <span className={styles.searchResultEmail}>{user.email}</span>
                      </div>
                      <button
                        onClick={() => handleInviteUser(user)}
                        className={styles.selectButton}
                      >
                        Выбрать
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
