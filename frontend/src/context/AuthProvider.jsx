import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import api, { setAccessToken as setApiToken } from "../api/Api";

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---- sync token with axios interceptor ----
  useEffect(() => {
    setApiToken(accessToken);
  }, [accessToken]);

  // ---- get logged-in user ----
  const fetchUser = async () => {
    try {
      const res = await api.get("/user/me");
      return res.data?.data?.user || res.data?.user || null;
    } catch (err) {
      console.log("AuthContext: fetchUser error", err);
      return null;
    }
  };

  // ---- central auth applier (IMPORTANT) ----
  const applyAuth = async (token) => {
    setAccessToken(token);
    const userData = await fetchUser();
    setUser(userData);
  };

  // ---- auto login on refresh ----
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.post("/user/refresh-token");
        const newToken = res.data?.accessToken;

        if (!mounted) return;

        if (newToken) {
          await applyAuth(newToken);
        }
      } catch (err) {
        console.log("AuthContext: refresh-token failed", err);
        setAccessToken(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ---- login ----
  const login = async (credentials) => {
    const res = await api.post("/user/login", credentials);

    const token = res.data?.data?.accessToken;
    if (!token) {
      throw new Error("Access token missing in response");
    }

    await applyAuth(token);
  };

  // ---- logout ----
  const logout = async () => {
    try {
      await api.post("/user/logout");
    } catch (err) {
      console.log("AuthContext: logout error", err);
    }

    setAccessToken(null);
    setUser(null);

    // sync logout across tabs
    localStorage.setItem("app_logout", Date.now());
  };

  // ---- cross-tab logout sync ----
  useEffect(() => {
    const syncLogout = (e) => {
      if (e.key === "app_logout") {
        setAccessToken(null);
        setUser(null);
      }
    };

    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
