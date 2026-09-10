export function setupHomeWordmark() {
  const header = document.querySelector<HTMLElement>('.site-header-immersive');
  const brand = header?.querySelector<HTMLElement>('.brand');
  const logo = brand?.querySelector<HTMLImageElement>('img');
  const heroLogo = document.querySelector<HTMLImageElement>('#stage-title img');
  if (!header || !brand || !logo || !heroLogo) return;

  const mobile = matchMedia('(max-width: 900px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let origin = { x: 0, y: 0, width: 1 };
  let target = { x: 0, y: 0, width: 1 };
  let navOffset = 0;

  const update = () => {
    frame = 0;
    const menuOpen = header.classList.contains('menu-open');
    const range = mobile.matches ? 100 : Math.max(160, origin.y - target.y);
    let progress = Math.min(1, Math.max(0, window.scrollY / range));
    if (reducedMotion.matches) progress = window.scrollY > 48 ? 1 : 0;
    if (menuOpen || mobile.matches) progress = 1;
    const crossfade = mobile.matches || reducedMotion.matches;
    const x = crossfade ? 0 : (origin.x - target.x) * (1 - progress);
    const y = crossfade ? 0 : (origin.y - window.scrollY - target.y) * (1 - progress);
    const scale = crossfade ? 1 : 1 + (origin.width / target.width - 1) * (1 - progress);
    logo.style.setProperty('--wordmark-x', `${x}px`);
    logo.style.setProperty('--wordmark-y', `${y}px`);
    logo.style.setProperty('--wordmark-scale', String(scale));
    logo.style.setProperty('--wordmark-opacity', String(crossfade ? progress : 1));
    // Open the gap ahead of the arriving logo so their hit areas never overlap.
    const navProgress = Math.min(1, progress * 1.5);
    const navShift = navOffset * (1 - navProgress) - 24 * Math.sin(Math.PI * progress);
    header.style.setProperty('--nav-shift', `${mobile.matches ? 0 : navShift}px`);
    heroLogo.style.opacity = String(crossfade ? 1 - progress : 0);
    header.classList.toggle('is-scrolled', progress >= 1);
    header.classList.add('wordmark-ready');
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const measure = () => {
    const source = heroLogo.getBoundingClientRect();
    const destination = brand.getBoundingClientRect();
    const columnGap = parseFloat(getComputedStyle(brand.parentElement!).columnGap) || 0;
    navOffset = destination.width / 2 + columnGap - 4;
    // Layout dimensions stay stable while the logo itself is transformed.
    origin = { x: source.left, y: source.top + window.scrollY, width: source.width };
    target = {
      x: destination.left + (mobile.matches ? 0 : (destination.width - logo.offsetWidth) / 2),
      y: destination.top + (destination.height - logo.offsetHeight) / 2,
      width: logo.offsetWidth || 1,
    };
    schedule();
  };
  const observer = new ResizeObserver(measure);
  observer.observe(brand);
  observer.observe(heroLogo);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('pageshow', measure);
  header.addEventListener('header-menu-change', schedule);
  mobile.addEventListener('change', measure);
  reducedMotion.addEventListener('change', schedule);
  logo.addEventListener('load', measure);
  heroLogo.addEventListener('load', measure);
  measure();
}
