import type { Role } from '../types';

const TOKEN_KEY = 'quizops.token';

type JwtPayload = {
  sub?: string;
  roles?: string[];
  exp?: number;
};

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function decodeJwt(token: string): JwtPayload {
  const [, payload] = token.split('.');
  if (!payload) {
    return {};
  }

  try {
    return JSON.parse(window.atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as JwtPayload;
  } catch {
    return {};
  }
}

export function normalizeRole(role?: string | null): Role | null {
  if (!role) return null;
  const normalized = role.toUpperCase();
  if (normalized === 'ADMIN' || normalized === 'STUDENT' || normalized === 'TEACHER' || normalized === 'UNVERIFIED') {
    return normalized;
  }
  return null;
}

export function authFromToken(token: string) {
  const payload = decodeJwt(token);
  const role = normalizeRole(payload.roles?.[0]);
  return {
    token,
    username: payload.sub ?? null,
    role
  };
}
