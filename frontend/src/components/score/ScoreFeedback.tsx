import { useEffect } from 'react';
import { Award, Target, TrendingUp } from 'lucide-react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { scoreBand, scorePercent } from '../../utils/score';

const icons = {
  award: Award,
  trending: TrendingUp,
  target: Target
};

const CONFETTI_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function Confetti({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }
  const pieces = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.6 + Math.random() * 1.6,
    rotate: (Math.random() - 0.5) * 720,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 7
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 block rounded-[2px]"
          style={{ left: `${p.left}%`, width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ y: -24, opacity: 0, rotate: 0 }}
          animate={{ y: 320, opacity: [0, 1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn', repeat: 2, repeatDelay: 0.3 }}
        />
      ))}
    </div>
  );
}

export function ScoreFeedback({ score, total }: { score: number; total: number }) {
  const percent = scorePercent(score, total);
  const band = scoreBand(percent);
  const Icon = icons[band.icon];
  // More celebration the better the score: confetti only for solid results.
  const confettiCount = percent >= 85 ? 42 : percent >= 60 ? 18 : 0;

  // Count the percentage up from 0 for a little flourish.
  const count = useMotionValue(0);
  const rounded = useTransform(count, (value) => Math.round(value));
  useEffect(() => {
    const controls = animate(count, percent, { duration: 1.1, ease: 'easeOut' });
    return () => controls.stop();
  }, [count, percent]);

  const iconAnimation =
    percent >= 85
      ? { rotate: [0, -10, 10, -6, 0], scale: [0.7, 1.18, 1] }
      : percent >= 60
        ? { rotate: 0, scale: [0.7, 1.08, 1] }
        : { rotate: [0, -4, 4, 0], scale: 1 };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className={`relative overflow-hidden rounded-lg border p-5 ${band.tone}`}
    >
      <Confetti count={confettiCount} />

      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em]">Score Feedback</p>
          <h3 className="mt-2 text-3xl font-black">{band.label}</h3>
        </div>
        <motion.div
          className="rounded-lg bg-white/70 p-3"
          initial={{ rotate: -12, scale: 0.7 }}
          animate={iconAnimation}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <Icon className="h-8 w-8" />
        </motion.div>
      </div>

      <div className="relative mt-5">
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span>
            {score} / {total}
          </span>
          <span className="flex items-baseline">
            <motion.span>{rounded}</motion.span>%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/70">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-current"
          />
        </div>
      </div>

      <p className="relative mt-4 text-sm font-semibold leading-6">{band.feedback}</p>
    </motion.div>
  );
}
