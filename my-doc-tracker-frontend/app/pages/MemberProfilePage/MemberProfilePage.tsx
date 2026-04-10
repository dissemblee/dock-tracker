import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

import {
  useGetDocumentsQuery,
  useGetDownloadUrlQuery,
} from "@entities/document";

import { useGetCurrentUserQuery } from "@entities/user";
import { useGetCompanyEmployeesQuery } from "@entities/company";
import { tokenStore } from "@shared/api/tokenStore";

import styles from "./MemberProfilePage.module.scss";

const API_BASE_URL =
  typeof window !== "undefined"
    ? import.meta.env.VITE_API_URL || "http://localhost:3000"
    : "http://localhost:3000";

export function MemberProfilePage() {
  const { userId, companyId } = useParams();
  const navigate = useNavigate();

  const parsedCompanyId = Number(companyId);
  const parsedUserId = Number(userId);

  const [imageMap, setImageMap] = useState<Record<number, string>>({});
  const [imageErrorMap, setImageErrorMap] = useState<
    Record<number, boolean>
  >({});

  const { data: currentUser, isLoading: userLoading } =
    useGetCurrentUserQuery();

  const { data: members, isLoading: membersLoading } =
    useGetCompanyEmployeesQuery(parsedCompanyId, {
      skip: !parsedCompanyId,
    });

  const { data: documents, isLoading: docsLoading } =
    useGetDocumentsQuery(
      {
        companyId: parsedCompanyId,
        ownerId: parsedUserId,
      },
      {
        skip: !parsedCompanyId || !parsedUserId,
      }
    );

  useEffect(() => {
    if (userLoading || membersLoading) return;

    if (!currentUser || !members) {
      navigate("/profile/company");
      return;
    }

    const currentMember = members.find(
      (m) => m.userId === currentUser.id
    );

    const isOwner = currentMember?.role === "owner";
    const isAdmin =
      isOwner ||
      currentMember?.role === "admin" ||
      currentUser.role === "ADMIN";

    if (!isAdmin) {
      navigate("/profile/company");
    }
  }, [currentUser, members, userLoading, membersLoading, navigate]);

useEffect(() => {
  if (!documents?.length) return;
  documents.forEach((doc) => {
    if (!doc.mimeType.startsWith("image/")) return;
    if (imageMap[doc.id]) return;
    let cancelled = false;

    const fetchImage = async () => {
      try {
        const token = tokenStore.get();
        console.log("FETCHING IMAGE FOR DOC", doc.id, "WITH TOKEN", token);
        const res = await fetch(
          `${API_BASE_URL}/documents/${doc.id}/image`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) return;

        const blob = await res.blob();

        if (cancelled) return;

        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);

          setImageMap((prev) => ({
            ...prev,
            [doc.id]: url,
          }));
        } else {
          setImageErrorMap((prev) => ({
            ...prev,
            [doc.id]: true,
          }));
        }
      } catch {
        if (!cancelled) {
          setImageErrorMap((prev) => ({
            ...prev,
            [doc.id]: true,
          }));
        }
      }
    };

    fetchImage();

    return () => {
      cancelled = true;
    };
  });
}, [documents]);

  const { data: downloadUrl } = useGetDownloadUrlQuery(
    0,
    { skip: true }
  );

  const handleDownload = async (docId: number) => {
    const res = await fetch(
      `${API_BASE_URL}/documents/${docId}/download`,
      {
        headers: {
          Authorization: `Bearer ${tokenStore.get()}`,
        },
      }
    );

    const data = await res.json();

    const link = document.createElement("a");
    link.href = data.url;
    link.download = data.fileName;
    link.click();
  };

  if (userLoading || membersLoading || docsLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Документы пользователя</h1>

      {documents?.length === 0 && (
        <div className={styles.empty}>Нет документов</div>
      )}

      {documents?.map((doc) => {
        const isImage = doc.mimeType.startsWith("image/");
        const imgSrc = imageMap[doc.id];
        const hasError = imageErrorMap[doc.id];

        return (
          <div key={doc.id} className={styles.card}>
            <div className={styles.header}>
              <div className={styles.docTitle}>{doc.title}</div>

              <div className={styles.actions}>
                <button
                  className={styles.downloadButton}
                  onClick={() => handleDownload(doc.id)}
                >
                  Скачать
                </button>
              </div>
            </div>

            <div className={styles.content}>
              <div className={styles.mainInfo}>
                <div className={styles.statusRow}>
                  <span
                    className={`${styles.statusBadge} ${
                      styles[`status${doc.status}`]
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>
                      Название файла
                    </div>
                    <div className={styles.infoValue}>
                      {doc.fileName}
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Тип</div>
                    <div className={styles.infoValue}>
                      {doc.mimeType}
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Размер</div>
                    <div className={styles.infoValue}>
                      {doc.size}
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>
                      Загружен
                    </div>
                    <div className={styles.infoValue}>
                      {doc.uploadedAt}
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>
                      Истекает
                    </div>
                    <div className={styles.infoValue}>
                      {doc.expiresAt}
                    </div>
                  </div>
                </div>
              </div>

              {isImage && imgSrc && !hasError ? (
                <div className={styles.previewContainer}>
                  <img
                    src={imgSrc}
                    className={styles.previewImage}
                  />
                </div>
              ) : (
                <div className={styles.noPreview}>
                  <div className={styles.noPreviewIcon}>📄</div>
                  <div>Предпросмотр недоступен</div>
                  <div className={styles.fileType}>
                    {doc.mimeType}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
