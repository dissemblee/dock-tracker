import { useState } from "react";
import { Link } from "react-router";
import { useGetCurrentUserQuery, useUpdateUserMutation } from "@entities/user";
import { useGetCurrentCompanyQuery } from "@entities/company";
import { useAuth } from "@features/hooks/use-auth";
import { tokenStore } from "@shared/api/tokenStore";
import type { UserDto } from "@entities/user";
import styles from "@app/pages/ProfilePage.module.scss";

interface ProfileFormData {
  name: string;
  email: string;
}

export default function ProfileSettings() {
  const { user: authUser } = useAuth();
  const { data: currentUser, refetch: refetchUser } = useGetCurrentUserQuery(undefined);
  const { data: currentCompany } = useGetCurrentCompanyQuery();
  const [updateUser] = useUpdateUserMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: "",
    email: "",
  });

  const user = currentUser || authUser;
  const userId = user?.id || 0;

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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const result = await updateUser({ id: userId, data: profileForm }).unwrap();
      setUpdateMessage("Профиль обновлён!");
      setIsEditing(false);

      if (result) {
        const updatedUser = {
          ...user,
          name: result.name || user?.name,
          email: result.email || user?.email,
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

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Профиль пользователя</h2>

      {updateMessage && <div className={styles.successMessage}>{updateMessage}</div>}

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
            {currentCompany ? (
              <Link to="/company" className={styles.companyLink}>
                {currentCompany.name}
              </Link>
            ) : (
              "Не задана"
            )}
          </span>
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
  );
}
