import { apiClient } from './client';
import type { NotificationSummary } from '../types';

export async function getNotifications() {
  const { data } = await apiClient.get<NotificationSummary[]>('/notifications');
  return data;
}

export async function markRead(id: number) {
  const { data } = await apiClient.get(`/notifications/read/${id}`);
  return data;
}

export async function markUnread(id: number) {
  const { data } = await apiClient.get(`/notifications/unread/${id}`);
  return data;
}

export async function getSentNotifications() {
  const { data } = await apiClient.get<NotificationSummary[]>('/notifications/sent');
  return data;
}

export async function getFailedNotifications() {
  const { data } = await apiClient.get<NotificationSummary[]>('/notifications/failed');
  return data;
}
