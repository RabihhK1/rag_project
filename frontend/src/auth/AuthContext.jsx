import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { API_URL, requestApi, setAccessToken, setRefreshSession } from "../services/api";

const AuthContext = createContext(null);

async function refreshAccessToken() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) return null;
  return response.json();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const refreshInFlight = useRef(null);

  const refresh = useCallback(async () => {
    if (!refreshInFlight.current) {
      refreshInFlight.current = refreshAccessToken()
        .then(async (session) => {
          if (!session?.access_token) {
            setAccessToken(null);
            setUser(null);
            return false;
          }
          setAccessToken(session.access_token);
          const me = await requestApi("/auth/me").then((response) => response.json());
          setUser(me);
          return true;
        })
        .catch(() => {
          setAccessToken(null);
          setUser(null);
          return false;
        })
        .finally(() => { refreshInFlight.current = null; });
    }
    return refreshInFlight.current;
  }, []);

  useEffect(() => {
    setRefreshSession(refresh);
    refresh().finally(() => setInitializing(false));
    return () => setRefreshSession(null);
  }, [refresh]);

  const login = useCallback(() => { window.location.assign(`${API_URL}/auth/google/login`); }, []);
  const logout = useCallback(async () => {
    try {
      await requestApi("/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);
  const value = useMemo(() => ({ user, initializing, login, logout, refresh }), [user, initializing, login, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
