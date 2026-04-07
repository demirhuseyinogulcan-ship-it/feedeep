"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — Auth Context Provider
// Kullanıcı oturumunu tüm bileşenlerde erişilebilir kılar.
// + requestAuth() ile herhangi bileşenden modal açılabilir.
// ─────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getCurrentUser, onAuthChange, type AuthUser } from "@/lib/auth";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  showAuth: boolean;
  requestAuth: () => void;
  closeAuth: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  showAuth: false,
  requestAuth: () => {},
  closeAuth: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // İlk yükleme
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });

    // Değişiklikleri dinle
    const { unsubscribe } = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
      // Giriş yapıldıysa modalı kapat
      if (u) setShowAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const requestAuth = useCallback(() => setShowAuth(true), []);
  const closeAuth = useCallback(() => setShowAuth(false), []);

  return (
    <AuthContext.Provider value={{ user, loading, showAuth, requestAuth, closeAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
