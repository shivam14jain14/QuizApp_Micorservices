import { apiClient } from './client';
import type { Question, QuestionPage } from '../types';

export async function getQuestions() {
  const { data } = await apiClient.get<QuestionPage>('/question/all', {
    params: { page: 0, size: 500, sortBy: 'id', dir: 'desc' }
  });
  return data.questions ?? [];
}

export async function getQuestionsByCategory(category: string) {
  const { data } = await apiClient.get<Question[]>(`/question/category/${category}`);
  return data;
}

export async function getQuestionCategories() {
  const { data } = await apiClient.get<string[]>('/question/categories');
  return data;
}

export async function addQuestion(question: Question) {
  await apiClient.post('/question/add', question);
}

export async function generateQuestionIds(category: string) {
  const { data } = await apiClient.get<number[]>('/question/generate', { params: { category } });
  return data;
}
