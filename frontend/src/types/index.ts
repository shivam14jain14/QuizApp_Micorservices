export type Role = 'ADMIN' | 'STUDENT' | 'TEACHER' | 'UNVERIFIED';

export type User = {
  username: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  batch?: string;
  role: Role;
  requestedRole?: Role;
};

export type AuthState = {
  token: string | null;
  username: string | null;
  role: Role | null;
};

export type Question = {
  id?: number;
  questionTitle?: string;
  question?: string;
  answer?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  rightAnswer?: string;
  difficultyLevel?: string;
  difficultylevel?: string;
  category?: string;
};

export type QuestionPage = {
  questions: Question[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
};

export type QuizSummary = {
  id?: number;
  quizId?: number;
  title?: string;
  category?: string;
  batchIds?: string[];
};

export type QuizCreateRequest = {
  title: string;
  category: string;
  questionIds: number[];
  batchIds: string[];
};

export type QuestionWrapper = {
  id: number;
  questionTitle?: string;
  question_title?: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
};

export type Answer = {
  quesId: number;
  response: string;
};

export type SubmitQuizRequest = {
  quizId: number;
  username: string;
  userResponses: Answer[];
};

export type QuizHistorySummary = {
  quizId: number;
  title?: string;
  category?: string;
  batchIds?: string[];
  username?: string;
  attempted: boolean;
  score?: number | null;
};

export type NotificationSummary = {
  id: number;
  title?: string;
  message?: string;
  read?: boolean;
  readStatus?: 'READ' | 'UNREAD' | string;
  createdAt?: string;
  type?: string;
  eventType?: string;
  topic?: string;
  recipientIdentifier?: string;
  recipient_identifier?: string;
};

export type ScoreBand = {
  label: string;
  tone: string;
  feedback: string;
  icon: 'award' | 'trending' | 'target';
};
