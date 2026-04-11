"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — Auth Context Provider
// Kullanıcı oturumunu tüm bileşenlerde erişilebilir kılar.
// + requestAuth() ile herhangi bileşenden modal açılabilir.
// + Anonim auth: ilk yüklemede oturum yoksa otomatik anonim oturum açar.
// ─────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  onAuthChange,
  signInAnonymously,
  type AuthUser,
} from "@/lib/auth";
import { syncAllSignals } from "@/lib/signals";
import { logger } from "@/lib/logger";

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
    // İlk yükleme: mevcut oturum var mı kontrol et, yoksa anonim oturum aç
    getCurrentUser().then((u) => {
      if (u) {
        setUser(u);
        setLoading(false);
        // Mevcut oturum varsa localStorage ↔ Supabase sync
        syncAllSignals().catch((err) => { logger.warn("auth/syncAllSignals", "Sync başarısız", { userId: u?.id, err: String(err) }); });
      } else {
        // Anonim oturum aç
        signInAnonymously().then(({ user: anonUser }) => {
          setUser(anonUser);
          setLoading(false);
          // Anonim oturum sonrası localStorage ↔ Supabase sync
          syncAllSignals().catch((err) => { logger.warn("auth/syncAllSignals", "Sync başarısız", { userId: anonUser?.id, err: String(err) }); });
        });
      }
    });

    // Değişiklikleri dinle
    const { unsubscribe } = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
      // Kalıcı hesap oluşturulduysa modalı kapat + sinyalleri sync et
      if (u && !u.isAnonymous) {
        setShowAuth(false);
        syncAllSignals().catch((err) => { logger.warn("auth/syncAllSignals", "Sync başarısız", { userId: u?.id, err: String(err) }); });
      }
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
