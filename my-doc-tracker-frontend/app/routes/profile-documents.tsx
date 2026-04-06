import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useGetDocumentsQuery, useDeleteDocumentMutation } from "@entities/document";
import { useAuth } from "@features/hooks/use-auth";
import { DocumentModal } from "@shared/ui/DocumentModal";
import styles from "@app/pages/ProfilePage.module.scss";

type SortField = "title" | "expiresAt" | "uploadedAt" | "createdAt";
type SortOrder = "ASC" | "DESC";
type StatusFilter = "ALL" | "ACTIVE" | "EXPIRING" | "EXPIRED";

export default function ProfileDocuments() {
  const { user } = useAuth();
  const userId = user?.id || 0;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  const { data: documents = [], isLoading: documentsLoading, refetch } =
    useGetDocumentsQuery({ limit: 100, offset: 0 }, { skip: !userId });

  const [deleteDocument] = useDeleteDocumentMutation();

  // Фильтрация и сортировка документов
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    if (searchTerm) {
      result = result.filter((doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((doc) => doc.status === statusFilter);
    }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
    switch (status) {
      case "ACTIVE": return "Активен";
      case "EXPIRING": return "Истекает";
      case "EXPIRED": return "Истёк";
      default: return status;
    }
  };

  return (
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
                <span className={`${styles.statusBadge} ${styles[doc.status.toLowerCase()]}`}>
                  {getStatusLabel(doc.status)}
                </span>
              </div>
              <div className={styles.docInfo}>
                <p className={styles.docDetail}>Файл: {doc.fileName}</p>
                <p className={styles.docDetail}>Срок действия: {formatDate(doc.expiresAt)}</p>
                <p className={styles.docDetail}>Размер: {formatFileSize(doc.size)}</p>
                <p className={styles.docDetail}>Напоминание за {doc.notifyBefore} дн.</p>
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
  );
}
