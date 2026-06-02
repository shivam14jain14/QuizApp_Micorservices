import { apiClient } from './client';
import type { Question, QuestionWrapper, QuizCreateRequest, QuizHistorySummary, QuizSummary, SubmitQuizRequest } from '../types';

export async function generateQuiz(payload: QuizCreateRequest) {
  const { data } = await apiClient.post<string>('/quiz/generate', payload);
  return data;
}

export async function getQuizzesByBatch(batch: string) {
  const { data } = await apiClient.get<QuizSummary[]>(`/quiz/batch/${encodeURIComponent(batch.trim())}`);
  return data;
}

export async function getQuizQuestions(quizId: number) {
  const { data } = await apiClient.get<QuestionWrapper[]>(`/quiz/${quizId}`);
  return data;
}

export async function submitQuiz(payload: SubmitQuizRequest) {
  const { data } = await apiClient.post<number>('/quiz/submit', payload);
  return data;
}

export async function getQuizHistory(filters: { username?: string; batch?: string }) {
  const { data } = await apiClient.get<QuizHistorySummary[]>('/quiz/history', {
    params: {
      username: filters.username || undefined,
      batch: filters.batch || undefined
    }
  });
  return data;
}

export async function generateAiQuestions(category: string, level: string) {
  const { data } = await apiClient.get<Question[]>('/quiz/ai-questions', {
    params: { category, level }
  });
  return data;
}

export async function finalizeQuiz(quiz: QuizCreateRequest, aiquestions: Question[]) {
  const { data } = await apiClient.post<string>('/quiz/finalize', { quiz, aiquestions });
  return data;
}
