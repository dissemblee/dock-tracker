export interface DocumentDto {
  id: number;
  userId: number;
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
