import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCreateDocumentMutation } from "@entities/document";
import styles from "./DocumentModal.module.scss";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  expiresAt: string;
  notifyBefore: number;
  file: File | null;
  isCompanyDocument: boolean;
}

const DEFAULT_FORM_DATA: FormData = {
  title: "",
  expiresAt: "",
  notifyBefore: 7,
  file: null,
  isCompanyDocument: false,
};

const ALLOWED_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
const CREATE_ERROR_MESSAGE = "Ошибка при создании документа";

const getTodayDate = (): string => new Date().toISOString().split("T")[0];

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "data" in error) {
    const errorData = (error as { data?: { message?: string } }).data;
    if (errorData?.message) {
      return errorData.message;
    }
  }

  return CREATE_ERROR_MESSAGE;
};

export function DocumentModal({ isOpen, onClose, onSuccess }: DocumentModalProps) {
  const [createDocument] = useCreateDocumentMutation();
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Введите название документа");
      return;
    }

    if (!formData.expiresAt) {
      setError("Укажите срок действия документа");
      return;
    }

    if (!formData.file) {
      setError("Выберите файл документа");
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(formData.file.type)) {
      setError("Допустимые форматы: PDF, PNG, JPG");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("expiresAt", new Date(formData.expiresAt).toISOString());
      data.append("notifyBefore", formData.notifyBefore.toString());
      data.append("file", formData.file);
      data.append("isCompanyDocument", String(formData.isCompanyDocument));

      await createDocument({ data }).unwrap();

      resetForm();
      onSuccess?.();
      onClose();
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({ ...prev, title }));
  };

  const handleExpiresAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const expiresAt = e.target.value;
    setFormData((prev) => ({ ...prev, expiresAt }));
  };

  const handleNotifyBeforeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const notifyBefore = Number(e.target.value);
    setFormData((prev) => ({ ...prev, notifyBefore }));
  };

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const handleIsCompanyDocumentChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value === "true";

    setFormData((prev) => ({
      ...prev,
      isCompanyDocument: value,
    }));
  };

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-document-title"
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} id="add-document-title">Добавить документ</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Закрыть окно">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Название документа *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleTitleChange}
              className={styles.input}
              placeholder="Введите название документа"
              minLength={3}
              maxLength={100}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="expiresAt" className={styles.label}>
              Срок действия *
            </label>
            <input
              type="date"
              id="expiresAt"
              value={formData.expiresAt}
              onChange={handleExpiresAtChange}
              className={styles.input}
              required
              min={getTodayDate()}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notifyBefore" className={styles.label}>
              Напоминать за (дней) *
            </label>
            <select
              id="notifyBefore"
              value={formData.notifyBefore}
              onChange={handleNotifyBeforeChange}
              className={styles.select}
            >
              <option value={1}>1 день</option>
              <option value={3}>3 дня</option>
              <option value={7}>7 дней</option>
              <option value={14}>14 дней</option>
              <option value={30}>30 дней</option>
              <option value={60}>60 дней</option>
              <option value={90}>90 дней</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="isCompanyDocument" className={styles.label}>
              Документ компании?
            </label>

            <select
              id="isCompanyDocument"
              value={String(formData.isCompanyDocument)}
              onChange={handleIsCompanyDocumentChange}
              className={styles.select}
            >
              <option value="false">Личный документ</option>
              <option value="true">Документ компании</option>
            </select>

            <div className={styles.hint}>
              Документы компании видны администраторам и владельцу
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="file" className={styles.label}>
              Файл документа *
            </label>
            <div className={styles.fileInputWrapper}>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className={styles.fileInput}
                accept=".pdf,.png,.jpg,.jpeg"
                required
              />
              <div className={styles.fileHint}>
                Допустимые форматы: PDF, PNG, JPG
              </div>
            </div>
            {formData.file && (
              <div className={styles.fileInfo}>
                Выбран файл: {formData.file.name} ({Math.round(formData.file.size / 1024)} KB)
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Создание..." : "Создать документ"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
