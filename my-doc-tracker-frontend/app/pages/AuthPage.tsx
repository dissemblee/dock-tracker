import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { useLoginMutation, useRegisterMutation } from "@entities/auth";
import { tokenStore } from "@shared/api/tokenStore";
import styles from "./AuthPage.module.scss";

type AuthMode = "login" | "register";

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const navigate = useNavigate();

  const isLoading = isLoggingIn || isRegistering;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (mode === "register" && !formData.name) {
      newErrors.name = "Введите имя";
    } else if (mode === "register" && formData.name.length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
    }

    if (!formData.email) {
      newErrors.email = "Введите email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Введите корректный email";
    }

    if (!formData.password) {
      newErrors.password = "Введите пароль";
    } else if (formData.password.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === "login") {
        const result = await login({
          email: formData.email,
          password: formData.password,
        }).unwrap();
        // Токен уже установлен сервером в cookie
        // Сохраняем только данные пользователя
        if (result.user) {
          tokenStore.set(JSON.stringify(result.user));
        }
      } else {
        const result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }).unwrap();
        // Токен уже установлен сервером в cookie
        // Сохраняем только данные пользователя
        if (result.user) {
          tokenStore.set(JSON.stringify(result.user));
        }
      }

      navigate("/profile");
    } catch (error) {
      setErrors({
        general:
          mode === "login"
            ? "Неверный email или пароль"
            : "Ошибка при регистрации. Возможно, пользователь с таким email уже существует.",
      });
    }
  };

  const toggleMode = (): void => {
    setMode(mode === "login" ? "register" : "login");
    setErrors({});
    setFormData({
      name: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>
            {mode === "login" ? "Вход" : "Регистрация"}
          </h1>

          {errors.general && (
            <div className={styles.generalError}>{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {mode === "register" && (
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Имя
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  placeholder="Иван"
                  disabled={isLoading}
                  autoComplete="name"
                />
                {errors.name && (
                  <span className={styles.errorMessage}>{errors.name}</span>
                )}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                placeholder="example@mail.com"
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading
                ? "Загрузка..."
                : mode === "login"
                ? "Войти"
                : "Зарегистрироваться"}
            </button>
          </form>

          <div className={styles.toggleContainer}>
            <span className={styles.toggleText}>
              {mode === "login"
                ? "Нет аккаунта?"
                : "Уже есть аккаунт?"}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className={styles.toggleButton}
              disabled={isLoading}
            >
              {mode === "login" ? "Зарегистрироваться" : "Войти"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
