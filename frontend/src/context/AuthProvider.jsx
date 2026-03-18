import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import api, {
  setAccessToken as setApiToken,
  setIsRestoringAuth,
} from "../api/Api";

// Prevent restoreAuth from running twice (StrictMode fix)
let authInitialized = false;

// Reset flag on hot reload (dev only)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    authInitialized = false;
  });
}

export function AuthProvider({ children }) {
  // Auth state
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token with Axios instance
  useEffect(() => {
    setApiToken(accessToken);
  }, [accessToken]);

  // Fetch logged-in user
  const fetchUser = useCallback(async (token) => {
    try {
      const res = await api.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
        _skipRefresh: true, // avoid refresh loop
      });
      return res.data?.data?.user ?? null;
    } catch (err) {
      console.error("[Auth] fetchUser error:", err?.response?.status);
      return null;
    }
  }, []);

  // Apply auth state (token + user together)
  const applyAuth = useCallback(
    async (token) => {
      if (!token) return null;

      const userData = await fetchUser(token);

      if (userData) {
        setAccessToken(token);
        setApiToken(token);
        setUser(userData);
      } else {
        // Reset if user fetch fails
        setAccessToken(null);
        setApiToken(null);
        setUser(null);
      }

      return userData;
    },
    [fetchUser],
  );

  // Restore session on page load
  useEffect(() => {
    if (authInitialized) {
      setLoading(false);
      return;
    }
    authInitialized = true;

    const restoreAuth = async () => {
      setIsRestoringAuth(true);

      try {
        const { data } = await api.post(
          "/user/refresh-token",
          {},
          {
            withCredentials: true,
            _skipRefresh: true,
          },
        );

        const token = data?.data?.accessToken;
        if (!token) return;

        await applyAuth(token);
      } catch (err) {
        // Clear state if refresh fails
        setUser(null);
        setAccessToken(null);
        setApiToken(null);
      } finally {
        setIsRestoringAuth(false);
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  // Login user
  const login = async (credentials) => {
    try {
      const res = await api.post("/user/login", credentials, {
        withCredentials: true,
      });

      const token = res.data?.data?.accessToken;
      if (!token) throw new Error("No access token");

      return await applyAuth(token);
    } catch (err) {
      console.error("[Auth] login failed:", err?.response?.data?.message);
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.post("/user/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("[Auth] logout error:", err?.message);
    } finally {
      setUser(null);
      setAccessToken(null);
      setApiToken(null);

      // Notify other tabs
      localStorage.setItem("app_logout", Date.now());
    }
  };

  // Sync logout across tabs
  useEffect(() => {
    const syncLogout = (e) => {
      if (e.key === "app_logout") {
        setUser(null);
        setAccessToken(null);
        setApiToken(null);
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