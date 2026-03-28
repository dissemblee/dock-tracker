import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@features/hooks/use-auth";
import { useGetDocumentsQuery } from "@entities/document";
import {
  useGetRemindersQuery,
  useCreateReminderMutation,
  useDeleteReminderMutation,
} from "@entities/reminder";
import { tokenStore } from "@shared/api/tokenStore";
import styles from "./ProfilePage.module.scss";
import { Header } from "@shared/ui/Header";

interface ReminderFormData {
  title: string;
  description: string;
  remindAt: string;
}

export function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [reminderForm, setReminderForm] = useState<ReminderFormData>({
    title: "",
    description: "",
    remindAt: "",
  });

  const [createReminder] = useCreateReminderMutation();
  const [deleteReminder] = useDeleteReminderMutation();

  const userId = user?.id || 0;

  const { data: documents = [], isLoading: documentsLoading } =
    useGetDocumentsQuery({ userId }, { skip: !userId });

  const { data: reminders = [], isLoading: remindersLoading } =
    useGetRemindersQuery({ userId }, { skip: !userId });

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Активен";
      case "EXPIRING":
        return "Истекает";
      case "EXPIRED":
        return "Истек";
      default:
        return status;
    }
  };

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  return (
    <div className={styles.profilePage}>
      <Header userName={user?.name || "Пользователь"} onLogout={handleLogout} />

      <main className={styles.main}>
        {/* Блок "Важное" */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Важное</h2>
          <div className={styles.importantGrid}>
            {expiringDocs.length === 0 ? (
              <p className={styles.emptyText}>
                Нет документов с истекающим сроком
              </p>
            ) : (
              expiringDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`${styles.importantCard} ${styles[doc.status.toLowerCase()]}`}
                >
                  <h3 className={styles.importantTitle}>{doc.title}</h3>
                  <p className={styles.importantDate}>
                    Истекает: {formatDateTime(doc.expiresAt)}
                  </p>
                  <span className={styles.statusBadge}>
                    {getStatusLabel(doc.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Блок "Мои документы" */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Мои документы</h2>
          {documentsLoading ? (
            <p className={styles.loadingText}>Загрузка документов...</p>
          ) : documents.length === 0 ? (
            <p className={styles.emptyText}>У вас пока нет документов</p>
          ) : (
            <div className={styles.documentsGrid}>
              {documents.map((doc) => (
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
                      Срок действия: {formatDateTime(doc.expiresAt)}
                    </p>
                    <p className={styles.docDetail}>
                      Размер: {(doc.size / 1024).toFixed(2)} KB
                    </p>
                    <p className={styles.docDetail}>
                      Напоминание за {doc.notifyBefore} дн.
                    </p>
                  </div>
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
      </main>
    </div>
  );
}
