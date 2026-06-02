import { useQuery } from '@tanstack/react-query';
import { Bell, BookOpenCheck, ShieldCheck, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { getQuestions } from '../../api/questionApi';
import { getNotifications } from '../../api/notificationApi';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../hooks/useAuth';
import {getQuizzesByBatch} from "../../api/quizApi";
import {getBatch} from "../../api/authApi";

export function DashboardPage() {
  const { role, username } = useAuth();
  const isUnverified = role === 'UNVERIFIED';
  const questions = useQuery({ queryKey: ['questions'], queryFn: getQuestions, enabled: role !== 'STUDENT' && !isUnverified });
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: getNotifications, enabled: !isUnverified });
    const batchQuery = useQuery({
        queryKey: ['batch', username],
        queryFn: () => getBatch(username as string),
        enabled: role === 'STUDENT' && !!username
    });
    const studentQuizzes = useQuery({
        queryKey: ['student-quizzes', batchQuery.data],
        queryFn: () => getQuizzesByBatch(batchQuery.data!),
        enabled: role === 'STUDENT' && !!batchQuery.data
    });

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-lg bg-ink p-6 text-white shadow-soft"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">Role: {role}</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-balance">
              Hi {username}, let's get started.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">
              {isUnverified
                ? 'Please contact the administration to authorize your profile.'
                : 'Dive into a world where learning is personalized, engaging, and efficient. Master new concepts, our platform is designed to elevate your educational journey.'}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/10 p-5">
            <ShieldCheck className="h-10 w-10 text-emerald-300" />
            <p className="mt-4 text-lg font-black">Security Check</p>
            <p className="mt-2 text-sm text-white/70">
              {isUnverified ? 'Your account is pending administrator approval.' : 'Your session token is applied automatically while restricted screens stay role-aware.'}
            </p>
          </div>
        </div>
      </motion.section>

      {isUnverified ? (
        <Card className="p-5">
          <h3 className="text-lg font-black">Authorization Pending</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Please contact the administration to authorize your profile. You will be able to access quizzes, notifications, and history after your role is approved.
          </p>
        </Card>
      ) : (
        <>
        <section className="grid gap-4 md:grid-cols-3">
            {role === 'STUDENT' ? (
                <StatCard
                    label="Quizzes"
                    value={studentQuizzes.data?.length ?? 0}
                    icon={<BookOpenCheck className="h-5 w-5 text-ocean" />}
                    accent="bg-teal-50"
                />
            ) : (
                <StatCard
                    label="Question Bank"
                    value={questions.data?.length ?? 0}
                    icon={<BookOpenCheck className="h-5 w-5 text-ocean" />}
                    accent="bg-teal-50"
                />
            )}

            <StatCard
                label="Notifications"
                value={notifications.data?.length ?? 0}
                icon={<Bell className="h-5 w-5 text-coral" />}
                accent="bg-orange-50"
            />

            <StatCard
                label="Learning Mode"
                value="Active"
                icon={<Trophy className="h-5 w-5 text-berry" />}
                accent="bg-rose-50"
            />
        </section>
        <Card className="p-5">
            <h3 className="text-lg font-black">Recommended Workflow</h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[
                    {
                        role: 'TEACHER',
                        title: 'Teacher',
                        copy: 'Build question bank by creating new question or generate AI questions, assign quizzes to students and review their performance.'
                    },
                    {
                        role: 'STUDENT',
                        title: 'Student',
                        copy: 'Open assigned quizzes, submit answers, review score feedback.'
                    },
                    {
                        role: 'ADMIN',
                        title: 'Admin',
                        copy: 'Manage roles and audit question bank, quiz history and notification delivery.'
                    }
                ]
                    .filter((item) => item.role === role)
                    .map((item) => (
                        <div
                            key={item.title}
                            className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                        >
                            <p className="font-black text-ink">{item.title}</p>
                            <p className="mt-2 text-sm leading-6 text-gray-500">{item.copy}</p>
                        </div>
                    ))}
            </div>
        </Card>
        </>
      )}
    </div>
  );
}
