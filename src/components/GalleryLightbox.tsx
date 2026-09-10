import { sitePath } from '@lib/paths';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { GalleryImage } from '@lib/content';

interface Props {
  images: GalleryImage[];
}

const fallbackImage = sitePath('/images/logo.jpeg');

export default function GalleryLightbox({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const reduceMotion = useReducedMotion();
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const hasMultipleImages = images.length > 1;

  const openImage = (index: number) => {
    setDirection(0);
    setActiveIndex(index);
  };

  const closeImage = () => setActiveIndex(null);

  const showImage = (nextIndex: number, nextDirection: number) => {
    if (images.length === 0) return;

    setDirection(nextDirection);
    setActiveIndex((nextIndex + images.length) % images.length);
  };

  const showNext = () => {
    if (activeIndex === null) return;
    showImage(activeIndex + 1, 1);
  };

  const showPrevious = () => {
    if (activeIndex === null) return;
    showImage(activeIndex - 1, -1);
  };

  useEffect(() => {
    if (activeIndex === null) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeImage();
      if (event.key === 'ArrowRight') showNext();
      if (event.key === 'ArrowLeft') showPrevious();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex]);

  if (images.length === 0) {
    return <p className="empty-state">Fotos werden gerade vorbereitet.</p>;
  }

  return (
    <>
      <div className="gallery-grid">
        {images.map((item, index) => (
          <button
            key={`${item.image || fallbackImage}-${index}`}
            className={`gallery-card${item.featured ? ' featured' : ''}`}
            type="button"
            onClick={() => openImage(index)}
            aria-label={`${item.title || item.alt} öffnen`}
          >
            <img src={item.image ? `${item.image}?w=1000&auto=format&q=85` : fallbackImage} alt={item.alt} loading="lazy" />
            <span className="gallery-open-indicator" aria-hidden="true">Öffnen</span>
            <span className="gallery-caption">
              {item.title && <strong>{item.title}</strong>}
              {item.caption && <span>{item.caption}</span>}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeImage && activeIndex !== null && (
          <motion.div
            className="gallery-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={activeImage.title || activeImage.alt}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button className="gallery-lightbox-backdrop" type="button" aria-label="Galerie schließen" onClick={closeImage} />

            <div className="gallery-lightbox-shell">
              <button className="gallery-lightbox-close" type="button" aria-label="Galerie schließen" onClick={closeImage}>
                Schließen
              </button>

              {hasMultipleImages && (
                <button className="gallery-lightbox-nav previous" type="button" aria-label="Vorheriges Bild" onClick={showPrevious}>
                  Zurück
                </button>
              )}

              <div className="gallery-lightbox-frame">
                <AnimatePresence custom={direction} mode="popLayout" initial={false}>
                  <motion.img
                    key={`${activeImage.image || fallbackImage}-${activeIndex}`}
                    src={activeImage.image ? `${activeImage.image}?w=2400&auto=format&q=90` : fallbackImage}
                    alt={activeImage.alt}
                    custom={direction}
                    initial={reduceMotion ? false : { opacity: 0, x: direction * 36 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: direction * -36 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                  />
                </AnimatePresence>
              </div>

              {hasMultipleImages && (
                <button className="gallery-lightbox-nav next" type="button" aria-label="Nächstes Bild" onClick={showNext}>
                  Weiter
                </button>
              )}

              <div className="gallery-lightbox-caption">
                <span aria-live="polite" aria-atomic="true">Bild {activeIndex + 1} von {images.length}</span>
                {activeImage.title && <strong>{activeImage.title}</strong>}
                {activeImage.caption && <p>{activeImage.caption}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
