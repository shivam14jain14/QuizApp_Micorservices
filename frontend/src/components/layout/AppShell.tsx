import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, BookOpenCheck, ClipboardList, History, LayoutDashboard, LogOut, ShieldCheck, Sparkles, Users } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

const links: { label: string; path: string; icon: React.ReactNode; roles: Role[] }[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['ADMIN', 'STUDENT', 'TEACHER', 'UNVERIFIED'] },
  { label: 'Questions', path: '/questions', icon: <BookOpenCheck className="h-4 w-4" />, roles: ['ADMIN', 'TEACHER'] },
  { label: 'Quizzes', path: '/quizzes', icon: <ClipboardList className="h-4 w-4" />, roles: ['ADMIN', 'STUDENT', 'TEACHER'] },
  { label: 'Quiz History', path: '/quiz-history', icon: <History className="h-4 w-4" />, roles: ['ADMIN', 'STUDENT', 'TEACHER'] },
  { label: 'Notifications', path: '/notifications', icon: <Bell className="h-4 w-4" />, roles: ['ADMIN', 'STUDENT', 'TEACHER'] },
  { label: 'Admin', path: '/admin', icon: <Users className="h-4 w-4" />, roles: ['ADMIN'] }
];

export function AppShell() {
  const { role, username, signOut } = useAuth();
  const navigate = useNavigate();
  const allowedLinks = links.filter((link) => role && link.roles.includes(role));

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-ink p-2 text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xl font-black">QuizOps</p>
                <p className="text-xs font-semibold text-gray-500">Microservices Console</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {allowedLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition',
                  isActive ? 'bg-ink text-white shadow-soft' : 'text-gray-600 hover:bg-gray-100 hover:text-ink'
                )}
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-gray-100 p-4">
            <div className="mb-3 rounded-lg bg-gray-50 p-3">
              <p className="truncate text-sm font-bold">{username}</p>
              <Badge className="mt-2 border-emerald-200 bg-emerald-50 text-emerald-700">
                <ShieldCheck className="mr-1 h-3 w-3" />
                {role}
              </Badge>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start"
              icon={<LogOut className="h-4 w-4" />}
              onClick={() => {
                signOut();
                navigate('/login');
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-coral">Secure workspace</p>
              <h1 className="text-xl font-black text-ink">Quiz Management Workspace</h1>
            </div>
            <Badge className="border-gray-200 bg-gray-50 text-gray-700">Protected session</Badge>
          </div>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
