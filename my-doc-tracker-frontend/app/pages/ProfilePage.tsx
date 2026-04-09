import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useAuth } from "@features/hooks/use-auth";
import {
  useGetCurrentUserQuery,
  useUpdateUserMutation,
  useChangePasswordMutation,
} from "@entities/user";
import type { UserDto } from "@entities/user";
import { useGetCurrentCompanyQuery } from "@entities/company";
import { CompaniesPage } from "@app/pages/CompaniesPage/CompaniesPage";
import {
  useGetDocumentsQuery,
  useGetDownloadUrlQuery,
  useDeleteDocumentMutation,
} from "@entities/document";
import {
  useGetRemindersQuery,
  useCreateReminderMutation,
  useDeleteReminderMutation,
} from "@entities/reminder";
import { tokenStore } from "@shared/api/tokenStore";
import { DocumentModal } from "@shared/ui/DocumentModal";
import styles from "./ProfilePage.module.scss";

interface ReminderFormData {
  title: string;
  description: string;
  remindAt: string;
}

interface ProfileFormData {
  name: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ProfilePage() {
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const { data: currentUser, isLoading: userLoading, refetch: refetchUser } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: currentCompany } = useGetCurrentCompanyQuery();
  const [updateUser] = useUpdateUserMutation();
  const [changePassword] = useChangePasswordMutation();

  const [reminderForm, setReminderForm] = useState<ReminderFormData>({
    title: "",
    description: "",
    remindAt: "",
  });

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "profile" | "password" | "company">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  // Сортировки и поиск для документов
  type SortField = "title" | "expiresAt" | "uploadedAt" | "createdAt";
  type SortOrder = "ASC" | "DESC";
  type StatusFilter = "ALL" | "ACTIVE" | "EXPIRING" | "EXPIRED";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");

  const [createReminder] = useCreateReminderMutation();
  const [deleteReminder] = useDeleteReminderMutation();
  const [deleteDocument] = useDeleteDocumentMutation();

  const user = currentUser || authUser;
  const userId = user?.id || 0;

  const { data: documents = [], isLoading: documentsLoading, refetch } =
    useGetDocumentsQuery({ limit: 100, offset: 0 }, { skip: !userId });

  // Фильтрация и сортировка документов
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Поиск по названию
    if (searchTerm) {
      result = result.filter((doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по статусу
    if (statusFilter !== "ALL") {
      result = result.filter((doc) => doc.status === statusFilter);
    }

    // Сортировка
    result.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const modifier = sortOrder === "ASC" ? 1 : -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * modifier;
      }
      return ((aVal as any) > (bVal as any) ? 1 : -1) * modifier;
    });

    return result;
  }, [documents, searchTerm, statusFilter, sortBy, sortOrder]);

  const { data: reminders = [], isLoading: remindersLoading } =
    useGetRemindersQuery({ userId }, { skip: !userId });

  const { data: downloadUrlData } = useGetDownloadUrlQuery(userId ? documents[0]?.id || 0 : 0, {
    skip: !documents[0],
  });

  const expiringDocs = documents.filter(
    (doc) => doc.status === "EXPIRING" || doc.status === "EXPIRED"
  );

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderForm.title || !reminderForm.remindAt) return;

    try {
      await createReminder({
        data: {
          title: reminderForm.title,
          description: reminderForm.description || "",
          remindAt: new Date(reminderForm.remindAt).toISOString(),
        },
        userId,
      }).unwrap();
      setReminderForm({ title: "", description: "", remindAt: "" });
    } catch (error) {
      console.error("Ошибка создания напоминания:", error);
    }
  };

  const handleDeleteReminder = async (id: number) => {
    try {
      await deleteReminder({ id, userId }).unwrap();
    } catch (error) {
      console.error("Ошибка удаления напоминания:", error);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этот документ?")) {
      try {
        await deleteDocument({ id }).unwrap();
      } catch (error) {
        console.error("Ошибка удаления документа:", error);
      }
    }
  };

  const handleDocumentModalSuccess = () => {
    refetch();
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const result = await updateUser({ id: userId, data: profileForm }).unwrap();
      setUpdateMessage("Профиль обновлён!");
      setIsEditing(false);

      // Обновляем данные пользователя в хуке useAuth
      if (result?.result) {
        const updatedUser = {
          ...user,
          name: result.result.name || user?.name,
          email: result.result.email || user?.email,
        } as UserDto;
        tokenStore.set(JSON.stringify(updatedUser));
      }

      await refetchUser();
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (error: any) {
      console.error("Ошибка обновления:", error);
      setUpdateMessage(error.data?.message || "Ошибка при обновлении профиля");
      setTimeout(() => setUpdateMessage(""), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Пароль должен быть не менее 6 символов");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();
      
      // Очищаем все данные аутентификации
      tokenStore.clear();
      
      // Перенаправляем на страницу авторизации
      setPasswordMessage("Пароль успешно изменён! Выполняется выход...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error: any) {
      setPasswordError(error.data?.message || "Ошибка при смене пароля");
    }
  };

  const handleStartEditing = () => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
    }
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Активен";
      case "EXPIRING":
        return "Истекает";
      case "EXPIRED":
        return "Истёк";
      default:
        return status;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleDownload = (doc: any) => {
    if (downloadUrlData?.url) {
      const link = document.createElement("a");
      link.href = downloadUrlData.url;
      link.download = downloadUrlData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  if (userLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

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
          <button
            onClick={() => setActiveTab("overview")}
            className={`${styles.tab} ${activeTab === "overview" ? styles.tabActive : ""}`}
          >
            Обзор
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`${styles.tab} ${activeTab === "documents" ? styles.tabActive : ""}`}
          >
            Документы
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`${styles.tab} ${activeTab === "profile" ? styles.tabActive : ""}`}
          >
            Профиль
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`${styles.tab} ${activeTab === "password" ? styles.tabActive : ""}`}
          >
            Смена пароля
          </button>
          <button
            onClick={() => setActiveTab("company")}
            className={`${styles.tab} ${activeTab === "company" ? styles.tabActive : ""}`}
          >
            Компания
          </button>
        </div>

        {activeTab === "overview" && (
          <>
            {/* Блок "Важное" */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Важное</h2>
              {expiringDocs.length === 0 ? (
                <p className={styles.emptyText}>Нет документов с истекающим сроком</p>
              ) : (
                <div className={styles.importantGrid}>
                  {expiringDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className={`${styles.importantCard} ${styles[doc.status.toLowerCase()]}`}
                    >
                      <h3 className={styles.importantTitle}>{doc.title}</h3>
                      <p className={styles.importantDate}>
                        Истекает: {formatDate(doc.expiresAt)}
                      </p>
                      <span className={styles.statusBadge}>
                        {getStatusLabel(doc.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Блок "Напоминания" */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Напоминания</h2>

              <form onSubmit={handleAddReminder} className={styles.reminderForm}>
                <div className={styles.formRow}>
                  <input
                    type="text"
                    placeholder="Название напоминания"
                    value={reminderForm.title}
                    onChange={(e) =>
                      setReminderForm({ ...reminderForm, title: e.target.value })
                    }
                    className={styles.formInput}
                  />
                  <input
                    type="datetime-local"
                    value={reminderForm.remindAt}
                    onChange={(e) =>
                      setReminderForm({ ...reminderForm, remindAt: e.target.value })
                    }
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formRow}>
                  <textarea
                    placeholder="Описание (необязательно)"
                    value={reminderForm.description}
                    onChange={(e) =>
                      setReminderForm({
                        ...reminderForm,
                        description: e.target.value,
                      })
                    }
                    className={styles.formTextarea}
                  />
                </div>
                <button type="submit" className={styles.submitButton}>
                  Добавить напоминание
                </button>
              </form>

              {remindersLoading ? (
                <p className={styles.loadingText}>Загрузка напоминаний...</p>
              ) : reminders.length === 0 ? (
                <p className={styles.emptyText}>У вас пока нет напоминаний</p>
              ) : (
                <div className={styles.remindersList}>
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className={styles.reminderCard}>
                      <div className={styles.reminderContent}>
                        <h3 className={styles.reminderTitle}>{reminder.title}</h3>
                        {reminder.description && (
                          <p className={styles.reminderDesc}>
                            {reminder.description}
                          </p>
                        )}
                        <p className={styles.reminderDate}>
                          {formatDateTime(reminder.remindAt)}
                        </p>
                        {reminder.isSent && (
                          <span className={styles.sentBadge}>Отправлено</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className={styles.deleteButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "documents" && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Мои документы</h2>
              <button onClick={() => setIsDocumentModalOpen(true)} className={styles.addButton}>
                + Добавить документ
              </button>
            </div>

            <DocumentModal
              isOpen={isDocumentModalOpen}
              onClose={() => setIsDocumentModalOpen(false)}
              onSuccess={handleDocumentModalSuccess}
            />

            {/* Поиск и фильтры */}
            <div className={styles.documentsFilters}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Поиск по названию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.statusFilters}>
                {(["ALL", "ACTIVE", "EXPIRING", "EXPIRED"] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`${styles.statusButton} ${statusFilter === status ? styles.statusButtonActive : ""}`}
                  >
                    {status === "ALL" ? "Все" : getStatusLabel(status)}
                  </button>
                ))}
              </div>

              <div className={styles.sortControls}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortField)}
                  className={styles.sortSelect}
                >
                  <option value="createdAt">Дата загрузки</option>
                  <option value="title">Название</option>
                  <option value="expiresAt">Срок действия</option>
                  <option value="uploadedAt">Дата загрузки</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")}
                  className={styles.sortOrderButton}
                >
                  {sortOrder === "ASC" ? "↑" : "↓"}
                </button>
              </div>
            </div>

            {documentsLoading ? (
              <p className={styles.loadingText}>Загрузка документов...</p>
            ) : filteredDocuments.length === 0 ? (
              <p className={styles.emptyText}>
                {documents.length === 0 ? "У вас пока нет документов" : "Документы не найдены"}
              </p>
            ) : (
              <div className={styles.documentsGrid}>
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className={styles.documentCard}>
                    <div className={styles.docHeader}>
                      <h3 className={styles.docTitle}>{doc.title}</h3>
                      <span
                        className={`${styles.statusBadge} ${styles[doc.status.toLowerCase()]}`}
                      >
                        {getStatusLabel(doc.status)}
                      </span>
                    </div>
                    <div className={styles.docInfo}>
                      <p className={styles.docDetail}>
                        Файл: {doc.fileName}
                      </p>
                      <p className={styles.docDetail}>
                        Срок действия: {formatDate(doc.expiresAt)}
                      </p>
                      <p className={styles.docDetail}>
                        Размер: {formatFileSize(doc.size)}
                      </p>
                      <p className={styles.docDetail}>
                        Напоминание за {doc.notifyBefore} дн.
                      </p>
                    </div>
                    <div className={styles.docActions}>
                      <Link to={`/documents/${doc.id}`} className={styles.docButton}>
                        Просмотр
                      </Link>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className={`${styles.docButton} ${styles.deleteDocButton}`}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "profile" && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Профиль пользователя</h2>

            {updateMessage && (
              <div className={styles.successMessage}>{updateMessage}</div>
            )}

            <div className={styles.profileInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Имя:</span>
                <span className={styles.infoValue}>{user?.name || "Не указано"}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{user?.email || "Не указан"}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Компания:</span>
                <span className={styles.infoValue}>
                  {currentCompany ? currentCompany.name : "Не задана"}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Документов:</span>
                <span className={styles.infoValue}>{documents.length}</span>
              </div>
            </div>

            {!isEditing ? (
              <button onClick={handleStartEditing} className={styles.editButton}>
                Редактировать профиль
              </button>
            ) : (
              <form onSubmit={handleProfileUpdate} className={styles.profileForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Имя
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className={styles.formInputFull}
                    minLength={2}
                    maxLength={50}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className={styles.formInputFull}
                  />
                </div>

                <div className={styles.formActions}>
                  <button type="button" onClick={handleCancelEditing} className={styles.cancelButton}>
                    Отмена
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Сохранить изменения
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {activeTab === "password" && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Смена пароля</h2>

            {passwordMessage && (
              <div className={styles.successMessage}>{passwordMessage}</div>
            )}
            {passwordError && (
              <div className={styles.errorMessage}>{passwordError}</div>
            )}

            <form onSubmit={handleChangePassword} className={styles.profileForm}>
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword" className={styles.label}>
                  Текущий пароль
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className={styles.formInputFull}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="newPassword" className={styles.label}>
                  Новый пароль
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className={styles.formInputFull}
                  required
                  minLength={6}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Подтверждение пароля
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className={styles.formInputFull}
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                Изменить пароль
              </button>
            </form>
          </section>
        )}

        {activeTab === "company" && (
          <section className={styles.section}>
            <CompaniesPage />
          </section>
        )}
      </main>
    </div>
  );
}
