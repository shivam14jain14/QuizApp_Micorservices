import { apiClient } from './client';
import type { Role, User } from '../types';

export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  batch: string;
  role: Role;
};

export async function login(payload: LoginRequest) {
  const { data } = await apiClient.post<{ token: string }>('/auth/login', payload);
  return data;
}

export async function register(payload: RegisterRequest) {
  const { data } = await apiClient.post<User>('/auth/register', payload);
  return data;
}

export async function getRole(username: string) {
  const { data } = await apiClient.get<string>(`/auth/getRoles/${username}`);
  return data;
}

export async function getBatch(username: string) {
  const { data } = await apiClient.get<string>(`/auth/getBatch/${username}`);
  return data;
}

export async function updateRole(username: string, role: Role) {
  const { data } = await apiClient.post<string>('/auth/updateRole', { username, role });
  return data;
}

export async function getUsers() {
  const { data } = await apiClient.get<User[]>('/auth/users');
  return data;
}
