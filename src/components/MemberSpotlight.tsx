import { sitePath } from '@lib/paths';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { BandMember } from '@lib/content';

interface Props {
  members: BandMember[];
}

const fallbackImage = sitePath('/images/logo.webp');
const rotationMs = 4500;

export default function MemberSpotlight({ members }: Props) {
  // Keep rotation cumulative across wraps in either direction.
  const [activeStep, setActiveStep] = useState(0);
  const activeIndex = members.length ? ((activeStep % members.length) + members.length) % members.length : 0;
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const activeMember = members[activeIndex] || members[0];

  useEffect(() => {
    if (isPaused || reduceMotion || members.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveStep((current) => current + 1);
    }, rotationMs);

    return () => window.clearInterval(timer);
  }, [isPaused, members.length, reduceMotion, activeIndex]);

  if (!activeMember) return null;

  const selectMember = (index: number) => {
    setIsPaused(true);
    setActiveStep((current) => {
      const count = members.length;
      const currentIndex = ((current % count) + count) % count;
      const clockwiseSteps = (index - currentIndex + count) % count;
      const shortestSteps = clockwiseSteps > count / 2 ? clockwiseSteps - count : clockwiseSteps;
      return current + shortestSteps;
    });
  };

  return (
    <section className="member-stage">
      <div className="member-orbit" style={{ '--member-count': members.length } as CSSProperties}>
        <div className="member-spotlight-pool" aria-hidden="true" />
        <motion.div
          className="member-spotlight-direction"
          aria-hidden="true"
          initial={false}
          animate={{ rotate: activeStep * 360 / members.length }}
          transition={{ duration: reduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="member-spotlight-beam" />
        </motion.div>
        <div className="member-orbit-ring" aria-label="Bandmitglieder auswählen">
          {members.map((member, index) => {
            const angle = ((360 / members.length) * index - 90) * Math.PI / 180;
            const isActive = index === activeIndex;

            return (
              <button
                key={member.name}
                className={`member-orbit-item${isActive ? ' active' : ''}`}
                type="button"
                aria-pressed={isActive}
                aria-label={`${member.name}${member.role ? `, ${member.role}` : ''}`}
                style={{
                  '--member-x': `${50 + 41 * Math.cos(angle)}%`,
                  '--member-y': `${50 + 41 * Math.sin(angle)}%`,
                } as CSSProperties}
                onClick={() => selectMember(index)}
              >
                <span className="member-orbit-item-inner">
                  <img src={member.portrait || fallbackImage} alt="" loading={index === 0 ? 'eager' : 'lazy'} />
                  <span>{member.name}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="member-center" aria-live={isPaused ? 'polite' : 'off'}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMember.name}
              className="member-center-content"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {activeMember.role && <p className="eyebrow">{activeMember.role}</p>}
              <h2>{activeMember.name}</h2>
              {activeMember.bio && <p className="member-center-bio" tabIndex={0} aria-label={`Über ${activeMember.name}`}>{activeMember.bio}</p>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
