const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

let _user: any | null = null;

const isClient = typeof window !== "undefined";

/**
 * Получает значение cookie по имени
 */
function getCookie(name: string): string | null {
  if (!isClient) return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift() || null;
    return cookieValue;
  }
  
  return null;
}

/**
 * Удаляет cookie
 */
function deleteCookie(name: string): void {
  if (!isClient) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export const tokenStore = {
  /**
   * Получает JWT токен из cookie
   */
  get: (): string | null => {
    if (!isClient) return null;
    const token = getCookie('jwt');
    
    // Отладка в development
    if (import.meta.env.DEV) {
      console.log('[tokenStore.get()] JWT token:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('[tokenStore.get()] All cookies:', document.cookie);
    }
    
    return token;
  },

  /**
   * Сохраняет данные пользователя в localStorage
   * JWT токен устанавливается сервером в cookie
   */
  set: (data: string): void => {
    if (!isClient) return;
    
    // Если это JSON с данными пользователя
    if (data.startsWith("{")) {
      _user = JSON.parse(data);
      localStorage.setItem(USER_KEY, data);
    }
    // Если это маркер аутентификации
    else if (data === "authenticated") {
      // Токен уже установлен сервером в cookie
      // Просто ставим флаг
      document.cookie = `isAuth=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
  },

  /**
   * Получает данные пользователя из localStorage
   */
  getUser: (): any | null => {
    if (_user) {
      return _user;
    }

    if (isClient) {
      const stored = localStorage.getItem(USER_KEY);
      _user = stored ? JSON.parse(stored) : null;
      return _user;
    }

    return null;
  },

  /**
   * Очищает все данные аутентификации
   */
  clear: (): void => {
    _user = null;

    if (isClient) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      deleteCookie('jwt');
      deleteCookie('isAuth');
    }
  },
  
  /**
   * Проверяет наличие JWT токена в cookie
   */
  isAuthenticated: (): boolean => {
    return getCookie('jwt') !== null;
  },
};
