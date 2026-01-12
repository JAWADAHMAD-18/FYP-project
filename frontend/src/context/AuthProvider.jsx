import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import api, { setAccessToken as setApiToken } from "../api/Api";

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Sync access token with axios
  useEffect(() => {
    setApiToken(accessToken);
  }, [accessToken]);

  // 🔹 Fetch current user using valid access token
  const fetchUser = async (token) => {
    try {
      console.log("Access token before /me call:", token);

      const res = await api.get("/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("User data:", res.data?.message?.user);
      return res.data?.message?.user || null;
    } catch (err) {
      return null;
    }
  };

  // 🔹 Apply auth after successful login / refresh
  const applyAuth = async (token) => {
    console.log("Apply auth:", token);
    if (!token) return;
    setAccessToken(token);
    setApiToken(token);
    const userData = await fetchUser(token); // pass token here!
    setUser(userData);
  };

  // 🔹 LOGIN
  const login = async (credentials) => {
    const res = await api.post("/user/login", credentials);
    const token = res.data?.data?.accessToken;
    if (!token) throw new Error("Access token missing in response");

    await applyAuth(token); // centralized
  };

  // 🔹 LOGOUT
  const logout = async () => {
    try {
      await api.post("/user/logout");
    } catch (err) {
      console.log("AuthProvider: logout error", err);
    }

    setAccessToken(null);
    setUser(null);

    // sync logout across tabs
    localStorage.setItem("app_logout", Date.now());
  };

  // 🔹 Cross-tab logout sync
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
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
