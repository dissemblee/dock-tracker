import { useState } from "react";
import {
  useGetMyCompaniesQuery,
  useGetCurrentCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useGetCompanyEmployeesQuery,
  useInviteMemberMutation,
  useRemoveMemberMutation,
  useLazySearchUserByEmailQuery,
} from "@entities/company";
import { useGetCurrentUserQuery, useUpdateWorkModeMutation } from "@entities/user";
import { tokenStore } from "@shared/api/tokenStore";
import type { CompanyCreateDto, CompanyUpdateDto, CompanyMemberDto } from "@entities/company";
import type { WorkMode as UserWorkMode } from "@entities/user";
import companiesStyles from "./CompaniesPage.module.scss";
import companyStyles from "@app/pages/CompanyPage/CompanyPage.module.scss";
import { useAuth } from "@features/hooks/use-auth";
import { Link } from "react-router";

type TabType = "members" | "settings" | "create";
type ViewType = "list" | "create" | "detail";

export function CompaniesPage() {
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const { data: companies = [], isLoading: companiesLoading } = useGetMyCompaniesQuery();
  const { data: currentCompany, isLoading: companyLoading } = useGetCurrentCompanyQuery();
  const { data: currentUser, isLoading: userLoading, refetch: refetchUser } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [updateWorkMode] = useUpdateWorkModeMutation();
  const [createCompany] = useCreateCompanyMutation();
  const [updateCompany] = useUpdateCompanyMutation();
  const [inviteMember] = useInviteMemberMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [searchUserByEmail] = useLazySearchUserByEmailQuery();

  // View state
  const [viewType, setViewType] = useState<ViewType>("list");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  // Company detail state
  const [activeTab, setActiveTab] = useState<TabType>("members");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: number; name: string; email: string; companyId: number | null }>
  >([]);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  // Create form state
  const [companyForm, setCompanyForm] = useState<CompanyCreateDto>({
    name: "",
    inn: "",
    ogrn: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<CompanyUpdateDto>({});

  // Get selected company data
  const selectedCompany = selectedCompanyId
    ? companies.find((c) => c.id === selectedCompanyId) || currentCompany
    : currentCompany;

  const effectiveCompanyId = selectedCompanyId || currentCompany?.id;

  const { data: members, isLoading: membersLoading } = useGetCompanyEmployeesQuery(
    effectiveCompanyId!,
    { skip: !effectiveCompanyId }
  );

  const currentMember = members?.find((m) => m.userId === currentUser?.id);
  const isOwner = currentMember?.role === "owner";
  const isAdmin = isOwner || currentMember?.role === "admin" || currentUser?.role === "ADMIN";

  // Handlers
  const handleSwitchCompany = async (e: React.MouseEvent, companyId: number) => {
    e.stopPropagation();
    try {
      await updateWorkMode({
        workMode: "company" as UserWorkMode,
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

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dto: CompanyCreateDto = { name: companyForm.name };
      if (companyForm.inn) dto.inn = companyForm.inn;
      if (companyForm.ogrn) dto.ogrn = companyForm.ogrn;
      if (companyForm.address) dto.address = companyForm.address;
      if (companyForm.phone) dto.phone = companyForm.phone;
      if (companyForm.email) dto.email = companyForm.email;
      if (companyForm.website) dto.website = companyForm.website;

      await createCompany(dto).unwrap();
      alert("Компания успешно создана!");
      setCompanyForm({ name: "", inn: "", ogrn: "", address: "", phone: "", email: "", website: "" });
      setViewType("list");
    } catch (err) {
      console.error("Ошибка при создании:", err);
      alert("Ошибка при создании компании");
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      alert("Недостаточно прав");
      return;
    }

    if (!selectedCompany) return;

    try {
      await updateCompany({ ...settingsForm, id: selectedCompany.id }).unwrap();
      alert("Данные компании обновлены!");
      setSettingsForm({});
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

  if (userLoading || companiesLoading) {
    return <div className={companiesStyles.loading}>Загрузка...</div>;
  }

  // VIEW: LIST
  if (viewType === "list") {
    return (
      <div className={companiesStyles.companiesList}>
        <div className={companiesStyles.header}>
          <h2 className={companiesStyles.title}>Мои компании</h2>
          <button
            onClick={() => setViewType("create")}
            className={companiesStyles.createButton}
          >
            + Создать компанию
          </button>
        </div>

        {companies.length === 0 ? (
          <div className={companiesStyles.emptyState}>
            <p className={companiesStyles.emptyText}>
              У вас нет компаний. Создайте первую или примите приглашение.
            </p>
          </div>
        ) : (
          <div className={companiesStyles.grid}>
            {companies.map((company) => {
              const isCurrent = currentCompany?.id === company.id;
              return (
                <div
                  key={company.id}
                  className={`${companiesStyles.card} ${
                    isCurrent ? companiesStyles.currentCard : ""
                  }`}
                >
                  <div
                    className={companiesStyles.cardContent}
                    onClick={() => {
                      setSelectedCompanyId(company.id);
                      setViewType("detail");
                    }}
                  >
                    {isCurrent && (
                      <span className={companiesStyles.currentBadge}>Текущая</span>
                    )}
                    <h3 className={companiesStyles.companyName}>{company.name}</h3>
                    <div className={companiesStyles.details}>
                      {company.inn && (
                        <p className={companiesStyles.detail}>ИНН: {company.inn}</p>
                      )}
                      {company.ogrn && (
                        <p className={companiesStyles.detail}>ОГРН: {company.ogrn}</p>
                      )}
                      {company.address && (
                        <p className={companiesStyles.detail}>Адрес: {company.address}</p>
                      )}
                      {company.email && (
                        <p className={companiesStyles.detail}>Email: {company.email}</p>
                      )}
                      {company.phone && (
                        <p className={companiesStyles.detail}>Телефон: {company.phone}</p>
                      )}
                      {company.website && (
                        <p className={companiesStyles.detail}>Сайт: {company.website}</p>
                      )}
                    </div>
                  </div>
                  {!isCurrent && (
                    <button
                      className={companiesStyles.switchButton}
                      onClick={(e) => handleSwitchCompany(e, company.id)}
                    >
                      Переключиться
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // VIEW: CREATE
  if (viewType === "create") {
    return (
      <div className={companyStyles.companyPage}>
        <button
          onClick={() => setViewType("list")}
          className={companyStyles.backButton}
        >
          ← Назад к списку
        </button>

        <div className={companyStyles.container}>
          <h1 className={companyStyles.title}>Создать компанию</h1>

          <div className={companyStyles.noCompany}>
            <div className={companyStyles.createForm}>
              <form onSubmit={handleCreateCompany} className={companyStyles.form}>
                <div className={companyStyles.formGroup}>
                  <label htmlFor="companyName" className={companyStyles.label}>
                    Название компании *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={companyForm.name}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, name: e.target.value })
                    }
                    className={companyStyles.input}
                    placeholder="ООО Ромашка"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>

                <div className={companyStyles.formGroup}>
                  <label htmlFor="inn" className={companyStyles.label}>
                    ИНН (необязательно)
                  </label>
                  <input
                    type="text"
                    id="inn"
                    value={companyForm.inn || ""}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, inn: e.target.value })
                    }
                    className={companyStyles.input}
                    placeholder="1234567890"
                    pattern="[0-9]{10,15}"
                  />
                </div>

                <div className={companyStyles.formGroup}>
                  <label htmlFor="ogrn" className={companyStyles.label}>
                    ОГРН (необязательно)
                  </label>
                  <input
                    type="text"
                    id="ogrn"
                    value={companyForm.ogrn || ""}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, ogrn: e.target.value })
                    }
                    className={companyStyles.input}
                    placeholder="1234567890123"
                    pattern="[0-9]{13,15}"
                  />
                </div>

                <div className={companyStyles.formGroup}>
                  <label htmlFor="address" className={companyStyles.label}>
                    Адрес (необязательно)
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={companyForm.address || ""}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, address: e.target.value })
                    }
                    className={companyStyles.input}
                    placeholder="г. Москва, ул. Примерная, д. 1"
                  />
                </div>

                <div className={companyStyles.formRow}>
                  <div className={companyStyles.formGroup}>
                    <label htmlFor="phone" className={companyStyles.label}>
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={companyForm.phone || ""}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, phone: e.target.value })
                      }
                      className={companyStyles.input}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>

                  <div className={companyStyles.formGroup}>
                    <label htmlFor="companyEmail" className={companyStyles.label}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="companyEmail"
                      value={companyForm.email || ""}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, email: e.target.value })
                      }
                      className={companyStyles.input}
                      placeholder="info@company.ru"
                    />
                  </div>
                </div>

                <div className={companyStyles.formGroup}>
                  <label htmlFor="website" className={companyStyles.label}>
                    Сайт
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={companyForm.website || ""}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, website: e.target.value })
                    }
                    className={companyStyles.input}
                    placeholder="https://company.ru"
                  />
                </div>

                <button type="submit" className={companyStyles.submitButton}>
                  Создать компанию
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW: DETAIL
  if (viewType === "detail" && selectedCompany) {
    return (
      <div className={companyStyles.companyPage}>
        <button
          onClick={() => {
            setViewType("list");
            setSelectedCompanyId(null);
          }}
          className={companyStyles.backButton}
        >
          ← Назад к списку
        </button>

        <div className={companyStyles.container}>
          <h1 className={companyStyles.title}>Компания</h1>

          {/* Информация о компании */}
          <div className={companyStyles.companyInfo}>
            <h2 className={companyStyles.companyName}>{selectedCompany?.name}</h2>
            <div className={companyStyles.companyDetails}>
              {selectedCompany?.inn && (
                <span className={companyStyles.detail}>ИНН: {selectedCompany.inn}</span>
              )}
              {selectedCompany?.ogrn && (
                <span className={companyStyles.detail}>ОГРН: {selectedCompany.ogrn}</span>
              )}
              {selectedCompany?.address && (
                <span className={companyStyles.detail}>
                  📍 {selectedCompany.address}
                </span>
              )}
              {selectedCompany?.phone && (
                <span className={companyStyles.detail}>
                  📞 {selectedCompany.phone}
                </span>
              )}
              {selectedCompany?.email && (
                <span className={companyStyles.detail}>✉️ {selectedCompany.email}</span>
              )}
              {selectedCompany?.website && (
                <span className={companyStyles.detail}>
                  🌐{" "}
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={companyStyles.websiteLink}
                  >
                    {selectedCompany.website}
                  </a>
                </span>
              )}
            </div>
          </div>

          {/* Табы */}
          <div className={companyStyles.tabs}>
            <button
              onClick={() => setActiveTab("members")}
              className={`${companyStyles.tab} ${
                activeTab === "members" ? companyStyles.tabActive : ""
              }`}
            >
              Сотрудники
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`${companyStyles.tab} ${
                  activeTab === "settings" ? companyStyles.tabActive : ""
                }`}
              >
                Настройки
              </button>
            )}
          </div>

          {/* MEMBERS TAB */}
          {activeTab === "members" && (
            <div className={companyStyles.tabContent}>
              <div className={companyStyles.membersHeader}>
                <h2 className={companyStyles.sectionTitle}>Сотрудники</h2>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowInviteModal(true);
                      setInviteError("");
                      setInviteSuccess("");
                    }}
                    className={companyStyles.inviteButton}
                  >
                    + Пригласить
                  </button>
                )}
              </div>

              {inviteSuccess && (
                <div className={companyStyles.successMessage}>{inviteSuccess}</div>
              )}

              {membersLoading ? (
                <div className={companyStyles.loading}>Загрузка участников...</div>
              ) : (
                <div className={companyStyles.membersList}>
                  {!members || members.length === 0 ? (
                    <div className={companyStyles.emptyMembers}>
                      В компании пока нет участников
                    </div>
                  ) : (
                    members.map((member: CompanyMemberDto) => {
                      const user = member.user;
                      return (
                        <Link key={member.id} className={companyStyles.memberCard} 
                          to={`/profile/company/${effectiveCompanyId}/member/${member?.user?.id}`}>
                          <div className={companyStyles.memberInfo}>
                            <div className={companyStyles.memberName}>
                              {user?.name || member.inviteEmail || "Приглашение..."}
                            </div>
                            <div className={companyStyles.memberEmail}>
                              {user?.email || member.inviteEmail || "—"}
                            </div>
                            {member.acceptedAt ? (
                              <div className={companyStyles.memberStatus}>
                                Принято:{" "}
                                {new Date(member.acceptedAt).toLocaleDateString(
                                  "ru-RU"
                                )}
                              </div>
                            ) : (
                              <div className={companyStyles.memberStatus}>
                                ⏳ Ожидает принятия
                              </div>
                            )}
                          </div>
                          <div className={companyStyles.memberRole}>
                            <span
                              className={`${
                                companyStyles.roleBadge
                              } ${companyStyles[`role-${member.role}`]}`}
                            >
                              {getRoleLabel(member.role)}
                            </span>
                          </div>
                          {isAdmin &&
                            member.role !== "owner" &&
                            user?.id !== currentUser?.id && (
                              <button
                                onClick={() => handleRemoveMember(member)}
                                className={companyStyles.removeButton}
                              >
                                Удалить
                              </button>
                            )}
                        </Link>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && isAdmin && (
            <div className={companyStyles.tabContent}>
              <h2 className={companyStyles.sectionTitle}>Данные компании</h2>
              <form onSubmit={handleUpdateCompany} className={companyStyles.form}>
                <div className={companyStyles.formGroup}>
                  <label htmlFor="settingsName" className={companyStyles.label}>
                    Название компании
                  </label>
                  <input
                    type="text"
                    id="settingsName"
                    value={settingsForm.name ?? selectedCompany?.name ?? ""}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, name: e.target.value })
                    }
                    className={companyStyles.input}
                    placeholder={selectedCompany?.name}
                    minLength={2}
                    maxLength={100}
                  />
                </div>

                <div className={companyStyles.formGroup}>
                  <label htmlFor="settingsInn" className={companyStyles.label}>
                    ИНН
                  </label>
                  <input
                    type="text"
                    id="settingsInn"
                    value={settingsForm.inn ?? selectedCompany?.inn ?? ""}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, inn: e.target.value })
                    }
                    className={companyStyles.input}
                    placeholder={selectedCompany?.inn || "Не указан"}
                    pattern="[0-9]{10,15}"
                  />
                </div>

                <div className={companyStyles.formGroup}>
                  <label htmlFor="settingsOgrn" className={companyStyles.label}>
                    ОГРН
                  </label>
                  <input
                    type="text"
                    id="settingsOgrn"
                    value={settingsForm.ogrn ?? selectedCompany?.ogrn ?? ""}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, ogrn: e.target.value })
                    }
                    className={companyStyles.input}
                    placeholder={selectedCompany?.ogrn || "Не указан"}
                    pattern="[0-9]{13,15}"
                  />
                </div>

                <div className={companyStyles.formGroup}>
                  <label htmlFor="settingsAddress" className={companyStyles.label}>
                    Адрес
                  </label>
                  <input
                    type="text"
                    id="settingsAddress"
                    value={settingsForm.address ?? selectedCompany?.address ?? ""}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, address: e.target.value })
                    }
                    className={companyStyles.input}
                    placeholder={selectedCompany?.address || "Не указан"}
                  />
                </div>

                <div className={companyStyles.formRow}>
                  <div className={companyStyles.formGroup}>
                    <label htmlFor="settingsPhone" className={companyStyles.label}>
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="settingsPhone"
                      value={settingsForm.phone ?? selectedCompany?.phone ?? ""}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, phone: e.target.value })
                      }
                      className={companyStyles.input}
                      placeholder={selectedCompany?.phone || "Не указан"}
                    />
                  </div>

                  <div className={companyStyles.formGroup}>
                    <label htmlFor="settingsEmail" className={companyStyles.label}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="settingsEmail"
                      value={settingsForm.email ?? selectedCompany?.email ?? ""}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, email: e.target.value })
                      }
                      className={companyStyles.input}
                      placeholder={selectedCompany?.email || "Не указан"}
                    />
                  </div>
                </div>

                <div className={companyStyles.formGroup}>
                  <label htmlFor="settingsWebsite" className={companyStyles.label}>
                    Сайт
                  </label>
                  <input
                    type="url"
                    id="settingsWebsite"
                    value={settingsForm.website ?? selectedCompany?.website ?? ""}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, website: e.target.value })
                    }
                    className={companyStyles.input}
                    placeholder={selectedCompany?.website || "Не указан"}
                  />
                </div>

                <button type="submit" className={companyStyles.submitButton}>
                  Сохранить изменения
                </button>
              </form>
            </div>
          )}

          {/* INVITE MODAL */}
          {showInviteModal && (
            <div className={companyStyles.modal}>
              <div className={companyStyles.modalContent}>
                <h3 className={companyStyles.modalTitle}>Пригласить участника</h3>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteError("");
                    setInviteSuccess("");
                    setSearchResults([]);
                  }}
                  className={companyStyles.modalClose}
                >
                  ×
                </button>

                {inviteError && (
                  <div className={companyStyles.errorMessage}>{inviteError}</div>
                )}

                <div className={companyStyles.searchBox}>
                  <label htmlFor="inviteEmail" className={companyStyles.label}>
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
                    className={companyStyles.input}
                    placeholder="user@example.com"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className={companyStyles.searchResults}>
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className={companyStyles.searchResultItem}
                      >
                        <div className={companyStyles.searchResultInfo}>
                          <span className={companyStyles.searchResultName}>
                            {user.name}
                          </span>
                          <span className={companyStyles.searchResultEmail}>
                            {user.email}
                          </span>
                        </div>
                        <button
                          onClick={() => handleInviteUser(user)}
                          className={companyStyles.selectButton}
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

  return null;
}
