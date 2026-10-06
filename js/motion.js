// Анимации по мотивам Framer: заставка, вход обложки, обложка от прокрутки, шторки работ, линии этапов, счётчики цен.
{
  const root = document.documentElement;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enterHero = () => requestAnimationFrame(() => root.classList.add('hero-in'));

  // 1. заставка – только при первом заходе за сессию и без reduce-motion
  let seen = false;
  try { seen = sessionStorage.getItem('intro') === '1'; sessionStorage.setItem('intro', '1'); } catch (e) { /* хранилище недоступно */ }
  const intro = document.querySelector('.intro');
  if (!calm && !seen && intro) {
    root.classList.add('intro-on');
    requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add('go')));
    setTimeout(() => { intro.classList.add('away'); enterHero(); }, 1100);
    setTimeout(() => root.classList.remove('intro-on'), 2000);
  } else enterHero();

  // 3. обложка от прокрутки: --p от 0 до 1 за высоту обложки, сглажено (догоняет прокрутку, не перехватывает её)
  const box = document.querySelector('.hero__box');
  const hero = document.querySelector('.hero');
  if (box && !calm) {
    let p = 0;
    const tick = () => {
      const target = Math.min(1, Math.max(0, scrollY / hero.offsetHeight));
      p += (target - p) * .12;
      box.style.setProperty('--p', p.toFixed(4));
      root.classList.toggle('past-hero', scrollY > hero.offsetHeight * .8);
      requestAnimationFrame(tick);
    };
    tick();
  } else addEventListener('scroll', () => root.classList.toggle('past-hero', scrollY > (hero?.offsetHeight || 600) * .8), { passive: true });

  // 4–5. шторки работ (по очереди в ряду) и линии этапов – один раз при появлении
  const once = (els, cb, threshold = .2) => {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { cb(e.target); io.unobserve(e.target); }
    }), { threshold });
    els.forEach(el => io.observe(el));
  };
  document.querySelectorAll('.work').forEach((w, i) => { w.style.transitionDelay = `${(i < 2 ? i : (i - 2) % 4) * 90}ms`; });
  once(document.querySelectorAll('.work'), w => w.classList.add('in'), .15);
  document.querySelectorAll('.steps__list li').forEach((li, i) => li.style.setProperty('--i', i));
  once(document.querySelectorAll('.steps__list'), l => l.classList.add('in'), .3);

  // подсветка раздела в плавающем меню
  const links = [...document.querySelectorAll('.float__links a')];
  const secs = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (secs.length) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(sec => io.observe(sec));
  }
}
