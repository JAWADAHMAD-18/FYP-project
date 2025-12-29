import {  useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api/Api.js";


export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token to global window for interceptor
  useEffect(() => {
    window.__ACCESS_TOKEN__ = accessToken;
  }, [accessToken]);

  // --- Reusable function to fetch user profile ---
  const fetchUser = async (token) => {
    try {
      const res = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data?.data?.user || null;
    } catch (err) {
      console.log("Error from auth context during getting user ", err);
      return null;
    }
  };

  // --- Auto login on page refresh ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.post("/users/refresh-token");
        if (!mounted) return;

        const newToken = res.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);

          const userData = await fetchUser(newToken);
          setUser(userData);
        }
      } catch (err) {
        console.log(
          "Error from auth context useEffect during refresh token  ",
          err
        );

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

  // --- Login ---
  const login = async (credentials) => {
    const res = await api.post("/users/login", credentials);
    const token = res.data?.accessToken;
    if (!token) return;

    setAccessToken(token);
    const userData = await fetchUser(token);
    setUser(userData);
  };

  // --- Logout ---
  const logout = async () => {
    try {
      await api.post("/users/logout");
    } catch (err) {
      console.log("Error during logout user in authcontext", err);
    }

    setAccessToken(null);
    setUser(null);

    localStorage.setItem("app_logout", Date.now());
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

