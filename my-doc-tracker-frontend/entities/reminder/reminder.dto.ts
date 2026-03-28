import type { DocumentDto } from "../document/document.dto";

export interface ReminderDto {
  id: number;
  userId: number;
  title: string;
  description?: string;
  remindAt: string;
  isSent: boolean;
  documentId?: number;
  document?: DocumentDto;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReminderCreateDto {
  title: string;
  description?: string;
  remindAt: string;
  documentId?: number;
}

export interface ReminderUpdateDto {
  title?: string;
  description?: string;
  remindAt?: string;
  isSent?: boolean;
}
