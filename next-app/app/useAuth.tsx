"use client";

import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";

interface User {
  name?: string;
  email?: string;
  role?: string;
}

const useAuth = () => {
  const { keycloak, initialized } = useKeycloak();
  const [token, setToken] = useState<string>("");
  const [isLogin, setLogin] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (initialized && !keycloak.authenticated) {
      keycloak.login();
    }
  }, [initialized, keycloak]);

  useEffect(() => {
    if (!initialized || !keycloak) return;

    if (keycloak.authenticated && keycloak.token) {
      setLogin(true);
      setToken(keycloak.token);

      const tokenParsed = keycloak.tokenParsed as any;
      setUser({
        name: tokenParsed?.name || tokenParsed?.preferred_username,
        email: tokenParsed?.email,
        role: tokenParsed?.realm_access?.roles?.includes("admin") ? "Admin" : "User",
      });

      document.cookie = `token=${encodeURIComponent(keycloak.token)}; path=/; max-age=${60 * 60}`;
      document.cookie = `isLogin=true; path=/; max-age=${60 * 60}`;
    } else {
      setLogin(false);
      setUser(null);
      document.cookie = "isLogin=false; path=/; max-age=0;";
      document.cookie = "token=; path=/; max-age=0;";
    }

    const refreshInterval = setInterval(async () => {
      if (keycloak.authenticated) {
        try {
          const refreshed = await keycloak.updateToken(60);
          if (refreshed && keycloak.token) {
            console.log("Token refreshed");
            setToken(keycloak.token);
            const tokenParsed = keycloak.tokenParsed as any;
            setUser({
              name: tokenParsed?.name || tokenParsed?.preferred_username,
              email: tokenParsed?.email,
              role: tokenParsed?.realm_access?.roles?.includes("admin") ? "Admin" : "User",
            });
          }
        } catch (err) {
          console.error("Token refresh failed:", err);
          keycloak.logout();
        }
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [initialized, keycloak]);

  const logout = () => {
    if (keycloak) keycloak.logout();
    setLogin(false);
    setToken("");
    setUser(null);
  };

  const login = () => keycloak?.login();

  return {
    keycloak,
    token,
    isLogin,
    user,
    login,
    logout,
    loading: !initialized,
  };
};

export default useAuth;
