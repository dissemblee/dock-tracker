const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

let _accessToken: string | null = null;
let _user: any | null = null;

const isClient = typeof window !== "undefined";

export const tokenStore = {
  get: (): string | null => {
    if (_accessToken) {
      return _accessToken;
    }

    if (isClient) {
      const stored = localStorage.getItem(TOKEN_KEY);
      _accessToken = stored || null;
      return _accessToken;
    }

    return null;
  },

  set: (token: string): void => {
    if (token === "authenticated") {
      _accessToken = token;
      if (isClient) {
        localStorage.setItem(TOKEN_KEY, token);
        document.cookie = `isAuth=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }
    } else if (token.startsWith("{")) {
      _user = JSON.parse(token);
      if (isClient) {
        localStorage.setItem(USER_KEY, token);
      }
    } else {
      _accessToken = token;
      if (isClient) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    }
  },

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

  clear: (): void => {
    _accessToken = null;
    _user = null;

    if (isClient) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      document.cookie = "isAuth=; path=/; max-age=0; SameSite=Lax";
    }
  },
};