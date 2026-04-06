import { useState } from "react";
import { useChangePasswordMutation } from "@entities/user";
import { tokenStore } from "@shared/api/tokenStore";
import styles from "@app/pages/ProfilePage.module.scss";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePassword() {
  const [changePassword] = useChangePasswordMutation();

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

      tokenStore.clear();

      setPasswordMessage("Пароль успешно изменён! Выполняется выход...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error: any) {
      setPasswordError(error.data?.message || "Ошибка при смене пароля");
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Смена пароля</h2>

      {passwordMessage && <div className={styles.successMessage}>{passwordMessage}</div>}
      {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}

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
  );
}
