import { useCallback, useEffect, useState } from "react";
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from "@entities/auth";
import { usersApi } from "@entities/user";
import { tokenStore } from "@shared/api/tokenStore";
import type { UserDto } from "@entities/user/user.dto";
import type { AppDispatch } from "@app/provider/store";
import { useDispatch } from "react-redux";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [registerMutation, registerState] = useRegisterMutation();
  const [loginMutation, loginState] = useLoginMutation();
  const [logoutMutation, logoutState] = useLogoutMutation();

  const [user, setUser] = useState<UserDto | null>(() => {
    if (typeof document === "undefined") return null;
    return tokenStore.getUser();
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof document === "undefined") return false;
    return tokenStore.isAuthenticated();
  });

  // Проверяем токен при каждой отрисовке
  useEffect(() => {
    const token = tokenStore.get();
    const storedUser = tokenStore.getUser();

    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    } else if (!token) {
      setUser(null);
      setIsAuthenticated(false);
    }
  });

  const loadUserProfile = useCallback(async () => {
    try {
      const result = await dispatch(usersApi.endpoints.getCurrentUser.initiate(undefined)).unwrap();
      if (result) {
        tokenStore.set(JSON.stringify(result));
        setUser(result);
        return result;
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    }
    return null;
  }, [dispatch]);

  const register = useCallback(
    async (data: Parameters<typeof registerMutation>[0]) => {
      const result = await registerMutation(data).unwrap();
      if (result.user) {
        tokenStore.set(JSON.stringify(result.user));
        // Если токен пришёл в JSON (dev режим), сохраняем его в cookie
        if ('accessToken' in result && result.accessToken) {
          document.cookie = `jwt=${result.accessToken}; path=/; max-age=900; SameSite=Lax`;
        }
        
        // Загружаем актуальные данные профиля из БД
        const userData = await loadUserProfile();
        if (userData) {
          setUser(userData);
        } else {
          setUser(result.user);
        }
        setIsAuthenticated(true);
      }
      return result;
    },
    [registerMutation, loadUserProfile]
  );

  const login = useCallback(
    async (data: Parameters<typeof loginMutation>[0]) => {
      const result = await loginMutation(data).unwrap();
      if (result.user) {
        tokenStore.set(JSON.stringify(result.user));
        // Если токен пришёл в JSON (dev режим), сохраняем его в cookie
        if ('accessToken' in result && result.accessToken) {
          document.cookie = `jwt=${result.accessToken}; path=/; max-age=900; SameSite=Lax`;
        }

        // Загружаем актуальные данные профиля из БД
        const userData = await loadUserProfile();
        if (userData) {
          setUser(userData);
        } else {
          setUser(result.user);
        }
        setIsAuthenticated(true);
      }
      return result;
    },
    [loginMutation, loadUserProfile]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } finally {
      tokenStore.clear();
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [logoutMutation]);

  return {
    user,
    isAuthenticated,
    loading:
      registerState.isLoading ||
      loginState.isLoading ||
      logoutState.isLoading,
    error:
      registerState.error || loginState.error || logoutState.error,
    register,
    login,
    logout,
  };
};
