import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import api, { setAccessToken as setApiToken } from "../api/Api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [loading, setLoading] = useState(true);

  // Sync token with Axios
  useEffect(() => {
    setApiToken(accessToken);
  }, [accessToken]);

  // Fetch user
  const fetchUser = useCallback(async (token) => {
    try {
      const res = await api.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User data received:", res.data?.message?.user);
      return res.data?.message?.user || null;
    } catch (err) {
      console.error("Error fetching user:", err);
      return null;
    }
  }, []);

  // Apply auth after login / restore
  const applyAuth = useCallback(
    async (token) => {
      if (!token) return;


      setAccessToken(token);
      localStorage.setItem("accessToken", token);
      setApiToken(token);

      const userData = await fetchUser(token);
      if (userData) setUser(userData);
      else {
        console.warn("User fetch failed after applying token");
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem("accessToken");
      }
    },
    [fetchUser]
  );

  // Restore auth on page reload
  useEffect(() => {
    const restoreAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      await applyAuth(token);
      setLoading(false);
    };

    restoreAuth();
  }, [applyAuth]);

  // Login
  const login = async (credentials) => {
    try {
      const res = await api.post("/user/login", credentials, {
        withCredentials: true,
      });
      const token = res.data?.data?.accessToken;
      if (!token) throw new Error("Access token missing in response");

      await applyAuth(token);
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    console.log("Logging out");
    try {
      await api.post("/user/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    }

    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");

    // sync logout across tabs
    localStorage.setItem("app_logout", Date.now());
  };

  // Cross-tab logout sync
  useEffect(() => {
    const syncLogout = (e) => {
      if (e.key === "app_logout") {
        console.log("Logout detected from another tab");
        setUser(null);
        setAccessToken(null);
      }
    };

    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
