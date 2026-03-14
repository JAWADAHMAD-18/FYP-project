import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import api, { setAccessToken as setApiToken } from "../api/Api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Access token lives in memory only — never persisted to localStorage (XSS risk)
  const [accessToken, setAccessToken] = useState(null);
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

  // Apply auth after login / signup / silent restore
  const applyAuth = useCallback(
    async (token) => {
      if (!token) return null;

      setAccessToken(token);
      setApiToken(token);

      const userData = await fetchUser(token);
      if (userData) {
        setUser(userData);
        console.log(
          "[Auth] User applied:",
          userData?.name,
          "| isAdmin:",
          userData?.isAdmin,
        );
      } else {
        console.warn("[Auth] User fetch failed after applying token");
        setAccessToken(null);
        setUser(null);
      }
      return userData; // ← return so callers get fresh data (avoids React state race)
    },
    [fetchUser],
  );

  // Restore auth on page reload via silent refresh (uses httpOnly RT cookie)
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        // Cookie sent automatically — no token in localStorage needed
        const { data } = await api.post("/user/refresh-token", {}, { withCredentials: true });
        const token = data?.data?.accessToken;
        if (token) {
          await applyAuth(token);
        }
      } catch {
        // No valid session — user stays logged out
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
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

      const userData = await applyAuth(token);
      console.log("[Auth] Login successful. isAdmin:", userData?.isAdmin);
      return userData; // ← return fresh user data to the caller
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
    setApiToken(null);

    // Write-only signal to sync logout across tabs (not used to read the token)
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
        applyAuth,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
