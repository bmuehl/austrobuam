import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const colors = ['#c81932', '#00afe3', '#713595', '#087c49', '#e5ce00'];
const point = (angle: number, radius: number) => {
  const radians = (angle - 90) * Math.PI / 180;
  return { x: 500 + radius * Math.cos(radians), y: 500 + radius * Math.sin(radians) };
};
const coordinates = ({ x, y }: { x: number; y: number }) => `${x},${y}`;

export default function MemberVines({ count }: { count: number }) {
  const reducedMotion = useReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  // Observe an unscaled HTML box: zero-scale SVG groups can remain invisible to Safari's observer.
  const inView = useInView(container, { once: true, amount: 0.1 });
  const revealed = reducedMotion || inView;
  if (count < 2) return null;

  return (
    <div className="member-vines" ref={container} aria-hidden="true">
    <svg width="100%" height="100%" viewBox="0 0 1000 1000" focusable="false">
      {Array.from({ length: count }, (_, index) => {
        const angle = index * 360 / count;
        const step = 360 / count;
        const start = point(angle, 410);
        const end = point(angle + step, 410);
        // Tangent handles form an organic arc between the portrait centers.
        const handleRadius = 410 / Math.cos(step * 0.28 * Math.PI / 180);
        const first = point(angle + step * 0.28, handleRadius + 8);
        const second = point(angle + step * 0.72, handleRadius - 8);
        const arc = `M${coordinates(start)} C${coordinates(first)} ${coordinates(second)} ${coordinates(end)}`;
        const t = 0.45;
        const sample = (a: number, b: number, c: number, d: number) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;
        const fork = { x: sample(start.x, first.x, second.x, end.x), y: sample(start.y, first.y, second.y, end.y) };
        const flower = point(angle + step * 0.56, 460);
        const branch = `M${coordinates(fork)} Q${coordinates(point(angle + step * 0.58, 420))} ${coordinates(flower)}`;
        const leaf = point(angle + step * 0.51, 433);
        const delay = index * 0.32;
        return (
          <g key={index}>
            <motion.path d={arc} className="member-vine-stem"
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={revealed ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.85, delay: reducedMotion ? 0 : delay, ease: 'easeOut' }} />
            <motion.path d={branch} className="member-vine-twig"
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={revealed ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : delay + 0.5 }} />
            <g transform={`translate(${leaf.x} ${leaf.y}) rotate(${angle + step * 0.5})`}>
              <motion.path d="M0 0 Q-25 -5 -23 -24 Q0 -24 0 0" fill="#087c49" fillOpacity="0.65"
                initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
                animate={revealed ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : delay + 0.8 }} />
            </g>
            <g transform={`translate(${flower.x} ${flower.y}) rotate(${angle})`}>
              <motion.g initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
                animate={revealed ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 15, delay: reducedMotion ? 0 : delay + 1, duration: reducedMotion ? 0 : undefined }}>
                {[0, 72, 144, 216, 288].map((rotation) => (
                  <ellipse key={rotation} cx="0" cy="-10" rx="6" ry="10" transform={`rotate(${rotation})`} fill={colors[index % colors.length]} />
                ))}
                <circle r="4" fill="#fffdf6" />
              </motion.g>
            </g>
          </g>
        );
      })}
    </svg>
    </div>
  );
}
