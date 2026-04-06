import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  useGetDocumentQuery,
  useGetDownloadUrlQuery,
  useDeleteDocumentMutation,
} from "@entities/document";
import { tokenStore } from "@shared/api/tokenStore";
import styles from "./DocumentPage.module.scss";

const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_URL || "http://localhost:3000")
  : "http://localhost:3000";

export function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const documentId = id ? parseInt(id, 10) : 0;

  const { data: documentData, isLoading, error } = useGetDocumentQuery(documentId, {
    skip: !documentId,
  });
  const { data: downloadUrlData } = useGetDownloadUrlQuery(documentId, {
    skip: !documentId,
  });
  const [deleteDocument] = useDeleteDocumentMutation();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Загружаем изображение напрямую через fetch
  useEffect(() => {
    if (!documentId || !documentData?.mimeType.startsWith("image/")) {
      setImageSrc(null);
      return;
    }

    let cancelled = false;

    const fetchImage = async () => {
      try {
        const token = tokenStore.get();
        const response = await fetch(`${API_BASE_URL}/documents/${documentId}/image`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        
        if (cancelled) return;
        
        if (blob instanceof Blob && blob.size > 0) {
          const url = URL.createObjectURL(blob);
          setImageSrc(url);
        } else {
          setImageError(true);
        }
      } catch {
        if (!cancelled) {
          setImageError(true);
        }
      }
    };

    fetchImage();

    return () => {
      cancelled = true;
    };
  }, [documentId, documentData?.mimeType]);

  const handleDelete = async () => {
    if (confirm("Вы уверены, что хотите удалить этот документ?")) {
      try {
        await deleteDocument({ id: documentId }).unwrap();
        window.history.back();
      } catch (err) {
        console.error("Ошибка при удалении:", err);
      }
    }
  };

  const handleDownload = () => {
    if (downloadUrlData?.url) {
      const link = document.createElement("a");
      link.href = downloadUrlData.url;
      link.download = downloadUrlData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: "Активен",
      EXPIRING: "Истекает",
      EXPIRED: "Истёк",
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      ACTIVE: styles.statusActive,
      EXPIRING: styles.statusExpiring,
      EXPIRED: styles.statusExpired,
    };
    return classes[status] || "";
  };

  const getDaysUntilExpiry = () => {
    if (!documentData?.expiresAt) return null;
    const now = new Date();
    const expiry = new Date(documentData.expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  if (isLoading) {
    return <div className={styles.loading}>Загрузка документа...</div>;
  }

  if (error || !documentData) {
    return (
      <div className={styles.error}>
        <h2>Ошибка</h2>
        <p>Документ не найден или произошла ошибка при загрузке</p>
        <Link to="/documents" className={styles.backLink}>
          ← К списку документов
        </Link>
      </div>
    );
  }

  const isImage = documentData.mimeType.startsWith("image/");
  const showImage = isImage && !!imageSrc && !imageError;

  return (
    <div className={styles.documentPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/profile/documents" className={styles.backButton}>
            ← Назад к списку
          </Link>
          <div className={styles.actions}>
            <button onClick={handleDownload} className={styles.downloadButton}>
              Скачать
            </button>
            <button onClick={handleDelete} className={styles.deleteButton}>
              Удалить
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.mainInfo}>
            <h1 className={styles.title}>{documentData.title}</h1>

            <div className={styles.statusRow}>
              <span className={`${styles.statusBadge} ${getStatusClass(documentData.status)}`}>
                {getStatusLabel(documentData.status)}
              </span>
              {daysUntilExpiry !== null && (
                <span className={styles.daysInfo}>
                  {daysUntilExpiry > 0
                    ? `Дней до истечения: ${daysUntilExpiry}`
                    : `Истёк ${Math.abs(daysUntilExpiry)} дн. назад`}
                </span>
              )}
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Название файла:</span>
                <span className={styles.infoValue}>{documentData.fileName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Тип файла:</span>
                <span className={styles.infoValue}>{documentData.mimeType}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Размер:</span>
                <span className={styles.infoValue}>{formatFileSize(documentData.size)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Дата загрузки:</span>
                <span className={styles.infoValue}>{formatDate(documentData.uploadedAt)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Срок действия:</span>
                <span className={styles.infoValue}>{formatDate(documentData.expiresAt)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Уведомлять за:</span>
                <span className={styles.infoValue}>{documentData.notifyBefore} дн.</span>
              </div>
            </div>
          </div>

          {showImage ? (
            <div className={styles.previewContainer}>
              <h3 className={styles.previewTitle}>Превью</h3>
              <img
                src={imageSrc}
                alt={documentData.title}
                className={styles.previewImage}
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className={styles.noPreview}>
              <div className={styles.noPreviewIcon}>📄</div>
              <p>Предпросмотр недоступен</p>
              <p className={styles.fileType}>{documentData.mimeType}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
