import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  useGetCurrentCompanyQuery,
  useGetMyCompaniesQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useGetCompanyEmployeesQuery,
  useInviteMemberMutation,
  useRemoveMemberMutation,
  useLazySearchUserByEmailQuery,
} from "@entities/company";
import { useGetCurrentUserQuery } from "@entities/user";
import type { CompanyCreateDto, CompanyUpdateDto, CompanyMemberDto, CompanyDto } from "@entities/company";
import styles from "./CompanyPage.module.scss";

interface CompanyPageProps {
  companyId?: number | null;
  onBack?: () => void;
}

type TabType = "members" | "settings" | "create";

export function CompanyPage({ companyId: propCompanyId, onBack }: CompanyPageProps) {
  const { data: currentUser, isLoading: userLoading } = useGetCurrentUserQuery();
  const { data: currentCompany, isLoading: companyLoading } = useGetCurrentCompanyQuery();
  const { data: myCompanies = [] } = useGetMyCompaniesQuery();
  const [createCompany] = useCreateCompanyMutation();
  const navigate = useNavigate();
  const [updateCompany] = useUpdateCompanyMutation();
  const [inviteMember] = useInviteMemberMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [searchUserByEmail] = useLazySearchUserByEmailQuery();

  const [activeTab, setActiveTab] = useState<TabType>("members");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: number; name: string; email: string; companyId: number | null }>
  >([]);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const [companyForm, setCompanyForm] = useState<CompanyCreateDto>({
    name: "",
    inn: "",
    ogrn: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  });

  const [settingsForm, setSettingsForm] = useState<CompanyUpdateDto>({});

  // Определяем активную компанию
  const selectedCompany = propCompanyId
    ? myCompanies.find((c) => c.id === propCompanyId) || currentCompany || null
    : currentCompany;
  const effectiveCompanyId = propCompanyId || currentCompany?.id;

  // Используем новый эндпоинт — сотрудники через company_members
  const { data: members, isLoading: membersLoading } = useGetCompanyEmployeesQuery(effectiveCompanyId!, {
    skip: !effectiveCompanyId,
  });

  // Определяем роль текущего пользователя
  const currentMember = members?.find((m) => m.userId === currentUser?.id);
  const isOwner = currentMember?.role === "owner";
  const isAdmin = isOwner || currentMember?.role === "admin" || currentUser?.role === "ADMIN";

  // Если передан companyId но у пользователя нет этой компании — редирект
  useEffect(() => {
    if (propCompanyId && !selectedCompany) {
      alert("У вас нет доступа к этой компании");
      onBack?.();
    }
  }, [propCompanyId, selectedCompany, onBack]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dto: CompanyCreateDto = {
        name: companyForm.name,
      };
      if (companyForm.inn) dto.inn = companyForm.inn;
      if (companyForm.ogrn) dto.ogrn = companyForm.ogrn;
      if (companyForm.address) dto.address = companyForm.address;
      if (companyForm.phone) dto.phone = companyForm.phone;
      if (companyForm.email) dto.email = companyForm.email;
      if (companyForm.website) dto.website = companyForm.website;

      await createCompany(dto).unwrap();
      alert("Компания успешно создана!");
      setCompanyForm({ name: "", inn: "", ogrn: "", address: "", phone: "", email: "", website: "" });
      onBack?.();
      window.location.reload();
    } catch (err) {
      console.error("Ошибка при создании:", err);
      alert("Ошибка при создании компании");
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    try {
      await updateCompany({ ...settingsForm, id: selectedCompany.id }).unwrap();
      alert("Данные компании обновлены!");
      setSettingsForm({});
      window.location.reload();
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

  const handleInviteUser = async (user: {
    id: number;
    name: string;
    email: string;
    companyId: number | null;
  }) => {
    if (!effectiveCompanyId) return;

    if (user.companyId !== null) {
      setInviteError("Пользователь уже состоит в компании");
      return;
    }

    try {
      await inviteMember({ companyId: effectiveCompanyId, data: { email: user.email } }).unwrap();
      setInviteSuccess(`Пользователь ${user.name} приглашён в компанию`);
      setInviteEmail("");
      setSearchResults([]);
      setShowInviteModal(false);
      setTimeout(() => setInviteSuccess(""), 3000);
    } catch (err: any) {
      setInviteError(err.data?.message || "Ошибка при приглашении");
    }
  };

  const handleRemoveMember = async (member: CompanyMemberDto) => {
    if (!effectiveCompanyId) return;

    if (member.role === "owner") {
      alert("Нельзя удалить владельца компании");
      return;
    }

    if (confirm("Вы уверены, что хотите удалить участника из компании?")) {
      try {
        await removeMember({ companyId: effectiveCompanyId, userId: member.userId }).unwrap();
        alert("Участник удалён");
      } catch (err: any) {
        alert(err.data?.message || "Ошибка при удалении");
      }
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: "👑 Владелец",
      admin: "⭐ Администратор",
      member: "👤 Сотрудник",
    };
    return labels[role] || role;
  };

  if (userLoading || companyLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  const hasCompany = !!selectedCompany;

  return (
    <div className={styles.companyPage}>
      {onBack && (
        <button onClick={onBack} className={styles.backButton}>
          ← Назад к списку
        </button>
      )}

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

                <div className={styles.formGroup}>
                  <label htmlFor="ogrn" className={styles.label}>
                    ОГРН (необязательно)
                  </label>
                  <input
                    type="text"
                    id="ogrn"
                    value={companyForm.ogrn || ""}
                    onChange={(e) => setCompanyForm({ ...companyForm, ogrn: e.target.value })}
                    className={styles.input}
                    placeholder="1234567890123"
                    pattern="[0-9]{13,15}"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="address" className={styles.label}>
                    Адрес (необязательно)
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={companyForm.address || ""}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    className={styles.input}
                    placeholder="г. Москва, ул. Примерная, д. 1"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.label}>
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={companyForm.phone || ""}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                      className={styles.input}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="companyEmail" className={styles.label}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="companyEmail"
                      value={companyForm.email || ""}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                      className={styles.input}
                      placeholder="info@company.ru"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="website" className={styles.label}>
                    Сайт
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={companyForm.website || ""}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    className={styles.input}
                    placeholder="https://company.ru"
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
            {/* Информация о компании */}
            <div className={styles.companyInfo}>
              <h2 className={styles.companyName}>{selectedCompany?.name}</h2>
              <div className={styles.companyDetails}>
                {selectedCompany?.inn && (
                  <span className={styles.detail}>ИНН: {selectedCompany.inn}</span>
                )}
                {selectedCompany?.ogrn && (
                  <span className={styles.detail}>ОГРН: {selectedCompany.ogrn}</span>
                )}
                {selectedCompany?.address && (
                  <span className={styles.detail}>📍 {selectedCompany.address}</span>
                )}
                {selectedCompany?.phone && (
                  <span className={styles.detail}>📞 {selectedCompany.phone}</span>
                )}
                {selectedCompany?.email && (
                  <span className={styles.detail}>✉️ {selectedCompany.email}</span>
                )}
                {selectedCompany?.website && (
                  <span className={styles.detail}>
                    🌐{" "}
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.websiteLink}
                    >
                      {selectedCompany.website}
                    </a>
                  </span>
                )}
              </div>
            </div>

            {/* Табы */}
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

            {/* Контент табов */}
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
                    {!members || members.length === 0 ? (
                      <div className={styles.emptyMembers}>
                        В компании пока нет участников
                      </div>
                    ) : (
                      members.map((member: CompanyMemberDto) => {
                        const user = member.user;
                        return (
                          <div key={member.id} className={styles.memberCard}>
                            <div className={styles.memberInfo}>
                              <div className={styles.memberName}>
                                {user?.name || member.inviteEmail || "Приглашение..."}
                              </div>
                              <div className={styles.memberEmail}>
                                {user?.email || member.inviteEmail || "—"}
                              </div>
                              {member.acceptedAt ? (
                                <div className={styles.memberStatus}>
                                  Принято: {new Date(member.acceptedAt).toLocaleDateString("ru-RU")}
                                </div>
                              ) : (
                                <div className={styles.memberStatus}>⏳ Ожидает принятия</div>
                              )}
                            </div>
                            <div className={styles.memberRole}>
                              <span className={`${styles.roleBadge} ${styles[`role-${member.role}`]}`}>
                                {getRoleLabel(member.role)}
                              </span>
                            </div>
                            {isAdmin && member.role !== "owner" && user?.id !== currentUser?.id && (
                              <button
                                onClick={() => handleRemoveMember(member)}
                                className={styles.removeButton}
                              >
                                Удалить
                              </button>
                            )}
                          </div>
                        );
                      })
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
                      value={settingsForm.name ?? selectedCompany?.name ?? ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className={styles.input}
                      placeholder={selectedCompany?.name}
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
                      value={settingsForm.inn ?? selectedCompany?.inn ?? ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, inn: e.target.value })}
                      className={styles.input}
                      placeholder={selectedCompany?.inn || "Не указан"}
                      pattern="[0-9]{10,15}"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="settingsOgrn" className={styles.label}>
                      ОГРН
                    </label>
                    <input
                      type="text"
                      id="settingsOgrn"
                      value={settingsForm.ogrn ?? selectedCompany?.ogrn ?? ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, ogrn: e.target.value })}
                      className={styles.input}
                      placeholder={selectedCompany?.ogrn || "Не указан"}
                      pattern="[0-9]{13,15}"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="settingsAddress" className={styles.label}>
                      Адрес
                    </label>
                    <input
                      type="text"
                      id="settingsAddress"
                      value={settingsForm.address ?? selectedCompany?.address ?? ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className={styles.input}
                      placeholder={selectedCompany?.address || "Не указан"}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="settingsPhone" className={styles.label}>
                        Телефон
                      </label>
                      <input
                        type="tel"
                        id="settingsPhone"
                        value={settingsForm.phone ?? selectedCompany?.phone ?? ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className={styles.input}
                        placeholder={selectedCompany?.phone || "Не указан"}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="settingsEmail" className={styles.label}>
                        Email
                      </label>
                      <input
                        type="email"
                        id="settingsEmail"
                        value={settingsForm.email ?? selectedCompany?.email ?? ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className={styles.input}
                        placeholder={selectedCompany?.email || "Не указан"}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="settingsWebsite" className={styles.label}>
                      Сайт
                    </label>
                    <input
                      type="url"
                      id="settingsWebsite"
                      value={settingsForm.website ?? selectedCompany?.website ?? ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, website: e.target.value })}
                      className={styles.input}
                      placeholder={selectedCompany?.website || "Не указан"}
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

        {/* Модалка приглашения */}
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
