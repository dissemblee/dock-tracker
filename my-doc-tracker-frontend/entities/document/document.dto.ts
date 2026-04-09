import type { UserDto } from "@entities/user";

export interface DocumentDto {
  id: number;
  userId: number;
  companyId?: number | null;
  isCompanyDocument?: boolean;
  title: string;
  expiresAt: string;
  notifyBefore: number;
  fileKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  status: "ACTIVE" | "EXPIRING" | "EXPIRED";
  createdAt?: string;
  updatedAt?: string;
  user?: UserDto;
}

export interface DocumentCreateDto {
  title: string;
  expiresAt: string;
  notifyBefore: number;
}

export interface DocumentUpdateDto {
  title?: string;
  expiresAt?: string;
  notifyBefore?: number;
}

/** Режим фильтрации документов */
export type DocumentMode = "personal" | "company";

export interface DocumentQueryDto {
  limit?: number;
  offset?: number;
  sortBy?: "title" | "expiresAt" | "uploadedAt" | "createdAt";
  sortOrder?: "ASC" | "DESC";
  status?: "ACTIVE" | "EXPIRING" | "EXPIRED";
  search?: string;
  /** Режим фильтрации */
  mode?: DocumentMode;
  /** ID компании (для mode=company) */
  companyId?: number;
  /** ID сотрудника (для mode=company) */
  ownerId?: number;
  /** Только общие документы */
  isCompanyDocument?: boolean;
}

export interface DocumentImageUrlDto {
  url: string;
}

/** Группа документов по владельцу (для иерархического отображения) */
export interface DocumentGroupedByOwner {
  owner: {
    id: number;
    name: string;
    email: string;
    isCompany: boolean;
  };
  documents: DocumentDto[];
  totalCount: number;
}
