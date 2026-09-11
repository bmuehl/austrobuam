import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const branches = [
  { path: 'M120 60 Q140 48 130 23', x: 130, y: 23, color: '#e5ce00', leaf: 'M132 45 Q111 44 116 28 Q134 28 132 45' },
  { path: 'M300 60 Q320 72 310 95', x: 310, y: 95, color: '#c81932', leaf: 'M312 76 Q334 66 338 80 Q324 91 312 76' },
  { path: 'M480 60 Q500 48 490 23', x: 490, y: 23, color: '#713595', leaf: 'M492 45 Q471 44 476 28 Q494 28 492 45' },
  { path: 'M660 60 Q680 72 670 95', x: 670, y: 95, color: '#00afe3', leaf: 'M672 76 Q694 66 698 80 Q684 91 672 76' },
];

export default function VineSeparator({ reverse = false }: { reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();
  const shown = reduced || inView;
  return (
    <div ref={ref} className={`vine-separator${reverse ? ' reverse' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 800 120" width="100%" height="100%" focusable="false">
        <motion.path className="member-vine-stem" d="M20 60 Q70 30 120 60 T300 60 T480 60 T660 60 Q725 45 780 60"
          initial={false} animate={{ pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 1.8, ease: 'easeInOut' }} />
        {branches.map((branch, index) => (
          <g key={branch.x}>
            <motion.path className="member-vine-twig" d={branch.path}
              initial={false} animate={{ pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.45, delay: reduced ? 0 : 0.4 + index * 0.45 }} />
            <motion.path d={branch.leaf} fill="#087c49" fillOpacity="0.65"
              initial={false} animate={{ opacity: shown ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.7 + index * 0.45 }} />
            <g transform={`translate(${branch.x} ${branch.y})`}>
              <motion.g initial={false} animate={{ scale: shown ? 0.8 : 0, opacity: shown ? 1 : 0 }}
                transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 15, delay: 0.9 + index * 0.45 }}>
                {[0, 72, 144, 216, 288].map((angle) => (
                  <ellipse key={angle} cx="0" cy="-7" rx="4.5" ry="7" transform={`rotate(${angle})`}
                    fill={reverse ? ['#e5ce00', '#00afe3', '#087c49'][index % 3] : branch.color} />
                ))}
                <circle r="3" fill="#fffdf6" />
              </motion.g>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
