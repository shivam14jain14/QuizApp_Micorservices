import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { QuestionsPage } from '../pages/questions/QuestionsPage';
import { QuizzesPage } from '../pages/quizzes/QuizzesPage';
import { CreateQuizPage } from '../pages/quizzes/CreateQuizPage';
import { TakeQuizPage } from '../pages/quizzes/TakeQuizPage';
import { QuizHistoryPage } from '../pages/quizzes/QuizHistoryPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { AdminPage } from '../pages/admin/AdminPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route element={<RoleRoute roles={['ADMIN', 'TEACHER']} />}>
            <Route path="/questions" element={<QuestionsPage />} />
          </Route>
          <Route element={<RoleRoute roles={['ADMIN', 'STUDENT', 'TEACHER']} />}>
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/quizzes/:quizId" element={<TakeQuizPage />} />
            <Route path="/quiz-history" element={<QuizHistoryPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
          <Route element={<RoleRoute roles={['ADMIN', 'TEACHER']} />}>
            <Route path="/quizzes/new" element={<CreateQuizPage />} />
          </Route>
          <Route element={<RoleRoute roles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
