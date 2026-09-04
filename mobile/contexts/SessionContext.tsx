import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { login as loginRequest } from '@/services/authService';
import type { LoginCredentials, User } from '@/types/user';
import { clearSession, loadSession, saveSession } from '@/services/sessionStorage';

interface SessionContextValue {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<User>;
  signOut: () => void;
  updateSessionUser: (user: User) => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession().then((session) => {
      if (session) { setToken(session.token); setUser(session.user); }
    }).finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const session = await loginRequest(credentials);
    setToken(session.token);
    setUser(session.user);
    await saveSession({ token: session.token, user: session.user });
    return session.user;
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
    void clearSession();
  }, []);

  const updateSessionUser = useCallback(async (updatedUser: User) => {
    setUser(updatedUser);
    if (token) await saveSession({ token, user: updatedUser });
  }, [token]);

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), isLoading, signIn, signOut, updateSessionUser }),
    [isLoading, signIn, signOut, token, updateSessionUser, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession deve ser utilizado dentro de SessionProvider.');
  return context;
}
