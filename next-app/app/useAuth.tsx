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

    const storedLogin = localStorage.getItem("isLogin");
    const storedToken = localStorage.getItem("token");

    if (storedLogin) setLogin(storedLogin === "true");
    if (storedToken) setToken(storedToken);

    const Client = new Keycloak({
      url: "http://localhost:8080/",
      realm: "myrealm",
      clientId: "myclient",
    });

    Client.init({ onLoad: "login-required" })
      .then((authenticated) => {
        setLogin(authenticated);
        setKeycloak(Client);

        if (Client.token) {
          setToken(Client.token);
          localStorage.setItem("token", Client.token);
        }

        localStorage.setItem("isLogin", authenticated ? "true" : "false");
      })
      .catch((err) => console.error("Keycloak init error:", err));
  }, []);

  const logout = () => {
    if (keycloak) keycloak.logout();
    setLogin(false);
    setToken("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLogin");
      localStorage.removeItem("token");
    }
  };

  return { isLogin, token, logout };
};

export default useAuth;
