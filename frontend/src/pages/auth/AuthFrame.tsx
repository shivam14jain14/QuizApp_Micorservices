import type { ReactNode } from 'react';
import { BookOpen, BrainCircuit, ShieldCheck } from 'lucide-react';

export function AuthFrame({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.26),transparent_32%),radial-gradient(circle_at_80%_40%,rgba(20,184,166,0.22),transparent_30%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 p-3">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <div>
              <p className="text-2xl font-black">QuizOps</p>
              <p className="text-sm text-white/70">Learning operations for microservices</p>
            </div>
          </div>
          <div>
            <p className="max-w-xl text-5xl font-black leading-tight text-balance">
              Secure quiz creation, scoring, and notifications in one focused console.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                ['Secure access', <ShieldCheck className="h-5 w-5" />],
                ['AI questions', <BrainCircuit className="h-5 w-5" />],
                ['Question bank', <BookOpen className="h-5 w-5" />]
              ].map(([label, icon]) => (
                <div key={String(label)} className="rounded-lg border border-white/10 bg-white/10 p-4">
                  <div className="mb-3 text-coral">{icon}</div>
                  <p className="text-sm font-bold">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-white/60">Designed for secure role-based quiz workflows.</p>
        </div>
      </section>
      <section className="flex items-center justify-center bg-[#f7f8fb] p-6">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">QuizOps</p>
            <h1 className="mt-2 text-4xl font-black text-ink">{title}</h1>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
