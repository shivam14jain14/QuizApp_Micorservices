import type { ScoreBand } from '../types';

export function scorePercent(score: number, total: number) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}

export function scoreBand(percent: number): ScoreBand {
  if (percent >= 85) {
    return {
      label: 'Excellent',
      tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      feedback: 'Strong command of the topic. Keep the pace and move to harder quizzes.',
      icon: 'award'
    };
  }

  if (percent >= 60) {
    return {
      label: 'Good Progress',
      tone: 'text-amber-700 bg-amber-50 border-amber-200',
      feedback: 'You are close. Review the missed concepts and try one focused practice round.',
      icon: 'trending'
    };
  }

  return {
    label: 'Needs Practice',
    tone: 'text-rose-700 bg-rose-50 border-rose-200',
    feedback: 'Start with the basics for this category, then retake a shorter quiz.',
    icon: 'target'
  };
}
