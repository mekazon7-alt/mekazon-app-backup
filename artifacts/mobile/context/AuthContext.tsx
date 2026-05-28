import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { loadSession, clearSession, updateUserProfile, saveSession } from "@/services/authService";
import type { AuthSession, UserProfile } from "@/types/user";

interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (session: AuthSession) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  isLoggedIn: false,
  login: () => {},
  logout: async () => {},
  updateUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  const login = useCallback((s: AuthSession) => {
    setSession(s);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const updateUser = useCallback(async (updates: Partial<UserProfile>) => {
    await updateUserProfile(updates);
    setSession((prev) =>
      prev ? { ...prev, user: { ...prev.user, ...updates } } : prev
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isLoggedIn: !!session,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
