// tokenStore.ts
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

let _user: any | null = null;

const isClient = typeof window !== "undefined";

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

function deleteCookie(name: string): void {
  if (!isClient) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export const tokenStore = {
  // Только для чтения, не для установки заголовков!
  get: (): string | null => {
    if (!isClient) return null;
    const token = getCookie('jwt');
    return token;
  },

  set: (data: string): void => {
    if (!isClient) return;
    
    if (data.startsWith("{")) {
      _user = JSON.parse(data);
      localStorage.setItem(USER_KEY, data);
    }
    else if (data === "authenticated") {
      document.cookie = `isAuth=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
  },

  getUser: (): any | null => {
    if (_user) return _user;
    if (isClient) {
      const stored = localStorage.getItem(USER_KEY);
      _user = stored ? JSON.parse(stored) : null;
      return _user;
    }
    return null;
  },

  clear: (): void => {
    _user = null;
    if (isClient) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      deleteCookie('jwt');
      deleteCookie('isAuth');
    }
  },
  
  isAuthenticated: (): boolean => {
    return getCookie('jwt') !== null;
  },
};
