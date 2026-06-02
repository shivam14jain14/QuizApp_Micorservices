import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, Role } from '../types';
import { authFromToken, clearToken, getStoredToken, storeToken } from '../utils/auth';
import { AuthContext, type AuthContextValue } from './authContextValue';

function initialAuth(): AuthState {
  const token = getStoredToken();
  return token ? authFromToken(token) : { token: null, username: null, role: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(initialAuth);

  const value = useMemo<AuthContextValue>(() => ({
    ...auth,
    isAuthenticated: Boolean(auth.token),
    signIn: (token: string) => {
      storeToken(token);
      setAuth(authFromToken(token));
    },
    signOut: () => {
      clearToken();
      setAuth({ token: null, username: null, role: null });
    },
    hasRole: (roles: Role[]) => Boolean(auth.role && roles.includes(auth.role))
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
