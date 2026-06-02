import { createContext } from 'react';
import type { AuthState, Role } from '../types';

export type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
  hasRole: (roles: Role[]) => boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
