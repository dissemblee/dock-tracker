import { useState } from "react";
import { useGetCurrentUserQuery } from "@entities/user";
import { useGetDocumentsQuery } from "@entities/document";
import { useGetRemindersQuery, useCreateReminderMutation, useDeleteReminderMutation } from "@entities/reminder";
import { useAuth } from "@features/hooks/use-auth";
import styles from "@app/pages/ProfilePage.module.scss";

interface ReminderFormData {
  title: string;
  description: string;
  remindAt: string;
}

export default function ProfileOverview() {
  const { user: authUser } = useAuth();
  const { data: currentUser } = useGetCurrentUserQuery(undefined);
  const [reminderForm, setReminderForm] = useState<ReminderFormData>({
    title: "",
    description: "",
    remindAt: "",
  });

  const [createReminder] = useCreateReminderMutation();
  const [deleteReminder] = useDeleteReminderMutation();

  const user = currentUser || authUser;
  const userId = user?.id || 0;

  const { data: documents = [] } = useGetDocumentsQuery({ limit: 100, offset: 0 }, { skip: !userId });
  const { data: reminders = [], isLoading: remindersLoading } = useGetRemindersQuery({ userId }, { skip: !userId });

  const expiringDocs = documents.filter(
    (doc) => doc.status === "EXPIRING" || doc.status === "EXPIRED"
  );

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
      case "ACTIVE": return "Активен";
      case "EXPIRING": return "Истекает";
      case "EXPIRED": return "Истёк";
      default: return status;
    }
  };

  return (
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
              onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
              className={styles.formInput}
            />
            <input
              type="datetime-local"
              value={reminderForm.remindAt}
              onChange={(e) => setReminderForm({ ...reminderForm, remindAt: e.target.value })}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formRow}>
            <textarea
              placeholder="Описание (необязательно)"
              value={reminderForm.description}
              onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
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
                    <p className={styles.reminderDesc}>{reminder.description}</p>
                  )}
                  <p className={styles.reminderDate}>{formatDateTime(reminder.remindAt)}</p>
                  {reminder.isSent && <span className={styles.sentBadge}>Отправлено</span>}
                </div>
                <button onClick={() => handleDeleteReminder(reminder.id)} className={styles.deleteButton}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
