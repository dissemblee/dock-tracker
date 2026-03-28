import { useCallback, useEffect, useState } from "react";
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from "@entities/auth";
import { tokenStore } from "@shared/api/tokenStore";
import type { UserDto } from "@entities/user/user.dto";

export const useAuth = () => {
  const [registerMutation, registerState] = useRegisterMutation();
  const [loginMutation, loginState] = useLoginMutation();
  const [logoutMutation, logoutState] = useLogoutMutation();

  const [user, setUser] = useState<UserDto | null>(() => {
    if (typeof document === "undefined") return null;
    return tokenStore.getUser();
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.cookie.includes("isAuth=true") || !!tokenStore.get();
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const init = async () => {
      const token = tokenStore.get();
      const storedUser = tokenStore.getUser();
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
      } else if (storedUser) {
        setUser(storedUser);
      }
    };

    init();
  }, [isAuthenticated]);

  const register = useCallback(
    async (data: Parameters<typeof registerMutation>[0]) => {
      return await registerMutation(data).unwrap();
    },
    [registerMutation]
  );

  const login = useCallback(
    async (data: Parameters<typeof loginMutation>[0]) => {
      const result = await loginMutation(data).unwrap();
      tokenStore.set("authenticated");
      if (result.user) {
        tokenStore.set(JSON.stringify(result.user));
        setUser(result.user);
      }
      setIsAuthenticated(true);
      return result;
    },
    [loginMutation]
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
