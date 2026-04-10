"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — Popup Queue Provider
// Popup'ları sırayla gösterir — biri kapanınca sonraki gelir.
// Çerez → PWA Install → Bildirim İzni sıralaması.
// ─────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

type PopupId = "cookie" | "pwa" | "notification";

type PopupQueueContextType = {
  /** Şu an gösterilen popup */
  current: PopupId | null;
  /** Popup kuyruğa ekle (zaten varsa veya tamamlanmışsa no-op) */
  enqueue: (id: PopupId) => void;
  /** Şu anki popup'ı kapat, sıradakine geç */
  dismiss: () => void;
};

const PopupQueueContext = createContext<PopupQueueContextType>({
  current: null,
  enqueue: () => {},
  dismiss: () => {},
});

export function PopupQueueProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<PopupId[]>([]);
  const [dismissed, setDismissed] = useState<Set<PopupId>>(new Set());
  const [ready, setReady] = useState(false);

  // İlk render'dan 500ms sonra kuyruğu aktif et — sayfa yüklenmesini bekleme
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  const enqueue = useCallback(
    (id: PopupId) => {
      setQueue((prev) => {
        if (prev.includes(id) || dismissed.has(id)) return prev;
        return [...prev, id];
      });
    },
    [dismissed],
  );

  const dismiss = useCallback(() => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      const [first, ...rest] = prev;
      setDismissed((d) => new Set(d).add(first));
      return rest;
    });
  }, []);

  const current = ready && queue.length > 0 ? queue[0] : null;

  return (
    <PopupQueueContext.Provider value={{ current, enqueue, dismiss }}>
      {children}
    </PopupQueueContext.Provider>
  );
}

export function usePopupQueue() {
  return useContext(PopupQueueContext);
}
