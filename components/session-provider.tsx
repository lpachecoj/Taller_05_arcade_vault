"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PuntuacionGuardada, Usuario } from "@/lib/data";

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";

interface SessionContextValue {
  user: Usuario | null;
  /** Inicia sesión con un usuario; `null` equivale a invitado (sin sesión). */
  login: (user: Usuario | null) => void;
  signOut: () => void;
  saveScore: (entry: Omit<PuntuacionGuardada, "at">) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function readUser(): Usuario | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as Usuario).name === "string"
    ) {
      return { name: (parsed as Usuario).name };
    }
  } catch {
    // localStorage bloqueado o JSON inválido: sin sesión
  }
  return null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  // Inicia en null (igual que el servidor) para evitar desajustes de hidratación;
  // la sesión guardada se carga tras montar.
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga única desde localStorage tras hidratar
    setUser(readUser());
  }, []);

  const login = useCallback((next: Usuario | null) => {
    setUser(next);
    try {
      if (next) localStorage.setItem(USER_KEY, JSON.stringify(next));
      else localStorage.removeItem(USER_KEY);
    } catch {
      // modo privado: la sesión queda solo en memoria
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignorar
    }
  }, []);

  const saveScore = useCallback((entry: Omit<PuntuacionGuardada, "at">) => {
    try {
      const raw = localStorage.getItem(SCORES_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const all: PuntuacionGuardada[] = Array.isArray(parsed) ? parsed : [];
      all.push({ ...entry, at: Date.now() });
      localStorage.setItem(SCORES_KEY, JSON.stringify(all));
    } catch {
      // ignorar
    }
  }, []);

  const value = useMemo(
    () => ({ user, login, signOut, saveScore }),
    [user, login, signOut, saveScore],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>");
  }
  return ctx;
}
