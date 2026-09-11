import { albumPointerTilt } from '../lib/album-pointer';

type OrientationAPI = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };

function initAlbumTilt() {
  const album = document.querySelector<HTMLElement>('.home-album');
  const wrap = album?.querySelector<HTMLElement>('.home-logo-wrap');
  const frame = album?.querySelector<HTMLElement>('.home-logo-frame');
  const glare = album?.querySelector<HTMLElement>('.album-glare');
  if (!album || !wrap || !frame) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const orientation = window.DeviceOrientationEvent as OrientationAPI | undefined;
  let visible = false;
  let enabled = false;
  let rect: DOMRect | null = null;
  let pointer: { x: number; y: number } | null = null;
  let pointerFrame = 0;
  let baseline: { beta: number; gamma: number } | null = null;
  let targetX = 0, targetY = 0, x = 0, y = 0, raf = 0, lastTime = 0;
  const clamp = (value: number) => Math.max(-0.5, Math.min(0.5, value));

  function render(time: number) {
    const amount = 1 - Math.exp(-Math.min(time - (lastTime || time - 16), 40) / 75);
    lastTime = time;
    x += (targetX - x) * amount;
    y += (targetY - y) * amount;
    const settled = Math.abs(targetX - x) + Math.abs(targetY - y) < 0.001;
    if (settled) { x = targetX; y = targetY; }
    frame!.style.transform = `translate3d(${x * 10}px, ${y * 8}px, 0) rotateX(${-y * 8}deg) rotateY(${x * 11}deg)`;
    if (glare) glare.style.transform = `translate3d(${x * 85}%, ${y * 85}%, 0)`;
    raf = settled ? 0 : requestAnimationFrame(render);
    if (settled && x === 0 && y === 0) album!.classList.remove('is-tilting');
  }
  function target(nextX: number, nextY: number) {
    targetX = clamp(nextX); targetY = clamp(nextY);
    if (!raf) { lastTime = 0; album!.classList.add('is-tilting'); raf = requestAnimationFrame(render); }
  }
  function reset() {
    cancelAnimationFrame(pointerFrame); pointerFrame = 0;
    cancelAnimationFrame(raf); raf = 0; lastTime = 0;
    x = y = targetX = targetY = 0;
    baseline = null; rect = null;
    frame!.style.removeProperty('transform');
    glare?.style.removeProperty('transform');
    album!.classList.remove('is-tilting');
  }
  function updatePointer() {
    if (pointerFrame || !pointer || !fine.matches || reduced.matches || !visible || document.hidden || enabled) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      if (!pointer) return;
      rect ??= wrap!.getBoundingClientRect();
      const tilt = albumPointerTilt(pointer.x, pointer.y, rect);
      target(tilt.x, tilt.y);
    });
  }
  function sensor(event: DeviceOrientationEvent) {
    if (!visible || document.hidden || reduced.matches || event.beta === null || event.gamma === null) return;
    baseline ??= { beta: event.beta, gamma: event.gamma };
    const dx = ((event.gamma - baseline.gamma + 540) % 360 - 180) / 40;
    const dy = ((event.beta - baseline.beta + 540) % 360 - 180) / 40;
    const angle = (screen.orientation?.angle || 0) * Math.PI / 180;
    target(dx * Math.cos(angle) + dy * Math.sin(angle), dy * Math.cos(angle) - dx * Math.sin(angle));
  }
  function stop() {
    enabled = false;
    window.removeEventListener('deviceorientation', sensor);
    reset();
  }
  function availability() {
    stop();
    // Permission-gated browsers need an explicit user gesture; leave the cover static there.
    if (coarse.matches && orientation && !orientation.requestPermission && window.isSecureContext && !reduced.matches) {
      enabled = true;
      window.addEventListener('deviceorientation', sensor, { passive: true });
    }
  }
  availability();
  reduced.addEventListener('change', availability);
  coarse.addEventListener('change', availability);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { album.classList.add('is-visible'); updatePointer(); }
    else reset();
  }, { threshold: 0.1 });
  observer.observe(wrap);
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    updatePointer();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    pointer = null;
    cancelAnimationFrame(pointerFrame); pointerFrame = 0;
    if (!enabled && !reduced.matches && visible) target(0, 0);
  });
  window.addEventListener('blur', () => { pointer = null; reset(); });
  window.addEventListener('scroll', () => { rect = null; updatePointer(); }, { passive: true });
  window.addEventListener('resize', () => { reset(); updatePointer(); });
  window.addEventListener('orientationchange', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', availability);
}

initAlbumTilt();
