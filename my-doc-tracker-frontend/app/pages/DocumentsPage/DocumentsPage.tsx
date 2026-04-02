import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useGetDocumentsQuery, useDeleteDocumentMutation } from "@entities/document";
import styles from "./DocumentsPage.module.scss";

type SortField = "title" | "expiresAt" | "uploadedAt" | "createdAt";
type SortOrder = "ASC" | "DESC";
type StatusFilter = "ALL" | "ACTIVE" | "EXPIRING" | "EXPIRED";

interface QueryParams {
  limit: number;
  offset: number;
  sortBy: SortField;
  sortOrder: SortOrder;
  status?: "ACTIVE" | "EXPIRING" | "EXPIRED";
  search?: string;
}

export function DocumentsPage() {
  const [queryParams, setQueryParams] = useState<QueryParams>({
    limit: 10,
    offset: 0,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  const { data: documents = [], isLoading, error } = useGetDocumentsQuery(queryParams);
  const [deleteDocument] = useDeleteDocumentMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setQueryParams((prev) => ({
      ...prev,
      search: value || undefined,
      offset: 0,
    }));
  };

  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
    setQueryParams((prev) => ({
      ...prev,
      status: status === "ALL" ? undefined : (status as "ACTIVE" | "EXPIRING" | "EXPIRED"),
      offset: 0,
    }));
  };

  const handleSort = (field: SortField) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "ASC" ? "DESC" : "ASC",
    }));
  };

  const handleDelete = async (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этот документ?")) {
      try {
        await deleteDocument({ id }).unwrap();
      } catch (err) {
        console.error("Ошибка при удалении:", err);
      }
    }
  };

  const handleNextPage = () => {
    setQueryParams((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  const handlePrevPage = () => {
    setQueryParams((prev) => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
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

  if (isLoading) {
    return <div className={styles.loading}>Загрузка документов...</div>;
  }

  if (error) {
    return <div className={styles.error}>Ошибка при загрузке документов</div>;
  }

  return (
    <div className={styles.documentsPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Документы</h1>
          <Link to="/documents/new" className={styles.createButton}>
            + Создать документ
          </Link>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.statusFilters}>
            {(["ALL", "ACTIVE", "EXPIRING", "EXPIRED"] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`${styles.statusButton} ${statusFilter === status ? styles.statusButtonActive : ""}`}
              >
                {status === "ALL" ? "Все" : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort("title")} className={styles.sortable}>
                  Название {queryParams.sortBy === "title" && (queryParams.sortOrder === "ASC" ? "↑" : "↓")}
                </th>
                <th>Файл</th>
                <th onClick={() => handleSort("expiresAt")} className={styles.sortable}>
                  Срок действия {queryParams.sortBy === "expiresAt" && (queryParams.sortOrder === "ASC" ? "↑" : "↓")}
                </th>
                <th>Статус</th>
                <th onClick={() => handleSort("uploadedAt")} className={styles.sortable}>
                  Дата загрузки {queryParams.sortBy === "uploadedAt" && (queryParams.sortOrder === "ASC" ? "↑" : "↓")}
                </th>
                <th>Размер</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.empty}>
                    Документы не найдены
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className={styles.titleCell}>{doc.title}</td>
                    <td className={styles.fileCell}>
                      <span className={styles.fileName}>{doc.fileName}</span>
                    </td>
                    <td>{formatDate(doc.expiresAt)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(doc.status)}`}>
                        {getStatusLabel(doc.status)}
                      </span>
                    </td>
                    <td>{formatDate(doc.uploadedAt)}</td>
                    <td>{formatFileSize(doc.size)}</td>
                    <td className={styles.actions}>
                      <Link to={`/documents/${doc.id}`} className={styles.actionButton}>
                        Просмотр
                      </Link>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <button
            onClick={handlePrevPage}
            disabled={queryParams.offset === 0}
            className={styles.paginationButton}
          >
            ← Назад
          </button>
          <span className={styles.paginationInfo}>
            Показано с {queryParams.offset + 1} по {Math.min(queryParams.offset + queryParams.limit, documents.length)} из {documents.length}
          </span>
          <button
            onClick={handleNextPage}
            disabled={documents.length < queryParams.limit}
            className={styles.paginationButton}
          >
            Вперёд →
          </button>
        </div>
      </div>
    </div>
  );
}
