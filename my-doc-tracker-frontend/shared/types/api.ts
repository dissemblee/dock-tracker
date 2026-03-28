export interface EntityDto {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResultDto<T> {
  result: T;
}

export interface CursorResultDto<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
}
