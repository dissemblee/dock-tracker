import { randomUUID } from 'crypto';

export function buildKey(userId: number | string, ext: string) {
  const now = new Date();

  return `users/${userId}/documents/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}/${randomUUID()}.${ext}`;
}
