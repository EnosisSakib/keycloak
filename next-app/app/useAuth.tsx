import { useEffect, useRef, useState } from "react";
import Keycloak from "keycloak-js";

const useAuth = () => {
  const isRan = useRef(false);
  const [isLogin, setLogin] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);

  useEffect(() => {
    if (isRan.current) return;
    isRan.current = true;

    if (typeof window === "undefined") return;

    const getCookie = (name: string): string | null => {
      const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
      );
      return match ? decodeURIComponent(match[2]) : null;
    };

    const storedLogin = getCookie("isLogin");
    const storedToken = getCookie("token");

    if (storedLogin) setLogin(storedLogin === "true");
    if (storedToken) setToken(storedToken);

    const Client = new Keycloak({
      url: "http://localhost:8080/",
      realm: "myrealm",
      clientId: "myclient",
    });

    Client.init({
      onLoad: "login-required",
      checkLoginIframe: false,
      redirectUri: "http://localhost:1122",
    })
      .then((authenticated) => {
        setLogin(authenticated);
        setKeycloak(Client);

        if (Client.token) {
          setToken(Client.token);

          document.cookie = `token=${encodeURIComponent(
            Client.token
          )}; path=/; max-age=${60 * 60};`;
        }

        document.cookie = `isLogin=${
          authenticated ? "true" : "false"
        }; path=/; max-age=${60 * 60};`;
      })
      .catch((err) => console.error("Keycloak init error:", err));
  }, []);
  

  const logout = () => {
    if (keycloak) keycloak.logout();
    setLogin(false);
    setToken("");
    if (typeof window !== "undefined") {
      document.cookie = "isLogin=; path=/; max-age=0;";
      document.cookie = "token=; path=/; max-age=0;";
    }
  };

  return { isLogin, token, logout };
};

export default useAuth;
