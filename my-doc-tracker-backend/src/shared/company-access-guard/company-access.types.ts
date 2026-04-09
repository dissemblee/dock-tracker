/**
 * Опции для декоратора @CompanyAccess
 */
export interface CompanyAccessOptions {
  /** Если true — разрешить доступ только owner/admin компании */
  requireOwnership?: boolean;
}
