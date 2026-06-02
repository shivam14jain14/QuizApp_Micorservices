import { Award, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { scoreBand, scorePercent } from '../../utils/score';

const icons = {
  award: Award,
  trending: TrendingUp,
  target: Target
};

export function ScoreFeedback({ score, total }: { score: number; total: number }) {
  const percent = scorePercent(score, total);
  const band = scoreBand(percent);
  const Icon = icons[band.icon];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-lg border p-5 ${band.tone}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em]">Score Feedback</p>
          <h3 className="mt-2 text-3xl font-black">{band.label}</h3>
        </div>
        <div className="rounded-lg bg-white/70 p-3">
          <Icon className="h-8 w-8" />
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span>{score} / {total}</span>
          <span>{percent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/70">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-current"
          />
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold leading-6">{band.feedback}</p>
    </motion.div>
  );
}
