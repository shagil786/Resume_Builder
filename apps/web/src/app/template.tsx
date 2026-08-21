'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // Plain div on the server and first client render — avoids the
  // motion/React-19 SSR inline-style hydration mismatch — then hand
  // off to motion so navigation transitions still animate.
  useEffect(() => setMounted(true), []);

  if (reduced) return <>{children}</>;

  if (!mounted) return <div>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.21, 0.6, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}
