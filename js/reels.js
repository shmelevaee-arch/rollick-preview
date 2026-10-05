// Обложка: три ролика играют без звука; под мышью ролик выходит вперёд, клик включает его звук.
const reels = document.querySelector('.reels');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ICON = {
  off: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>',
  on: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
};
const items = [...reels.querySelectorAll('.reel')].map(fig => {
  const v = Object.assign(document.createElement('video'), { muted: true, loop: true, playsInline: true, preload: 'metadata', poster: fig.dataset.poster, src: fig.dataset.src });
  v.setAttribute('aria-label', fig.querySelector('figcaption').textContent);
  const btn = Object.assign(document.createElement('button'), { className: 'reel__sound', type: 'button', innerHTML: ICON.off });
  btn.setAttribute('aria-label', 'Включить звук');
  fig.prepend(v); fig.append(btn);
  return { fig, v, btn };
});
const setSound = target => items.forEach(({ v, btn }) => {
  const on = v === target && v.muted;
  v.muted = !on; btn.innerHTML = on ? ICON.on : ICON.off;
  btn.setAttribute('aria-label', on ? 'Выключить звук' : 'Включить звук');
  if (on) v.play();
});
items.forEach(({ fig, v }) => {
  fig.addEventListener('mouseenter', () => { reels.classList.add('has-focus'); fig.classList.add('is-focus'); if (still) v.play(); });
  fig.addEventListener('mouseleave', () => { reels.classList.remove('has-focus'); fig.classList.remove('is-focus'); if (still && v.muted) v.pause(); });
  fig.addEventListener('click', () => setSound(v));
});
// играют только пока обложка на экране
new IntersectionObserver(([e]) => items.forEach(({ v }) => {
  if (e.isIntersecting && !still) v.play().catch(() => {}); else if (!e.isIntersecting) v.pause();
})).observe(reels);

// кнопки: текст-«перекат» (две копии подписи) и магнитное притяжение к курсору – только мышь и без reduce-motion
document.querySelectorAll('.btn > span').forEach(s => {
  const t = s.innerHTML;
  s.className = 'btn__roll';
  s.innerHTML = `<span>${t}</span><span aria-hidden="true">${t}</span>`;
});
if (matchMedia('(pointer: fine)').matches && !still) {
  const btns = [...document.querySelectorAll('.btn')].map(el => ({ el, tx: 0, ty: 0, x: 0, y: 0 }));
  btns.forEach(b => {
    b.el.addEventListener('mousemove', e => {
      const r = b.el.getBoundingClientRect();
      b.tx = (e.clientX - r.left - r.width / 2) / (r.width / 2) * 10;
      b.ty = (e.clientY - r.top - r.height / 2) / (r.height / 2) * 6;
    });
    b.el.addEventListener('mouseleave', () => { b.tx = 0; b.ty = 0; });
  });
  (function tick() {   // один общий цикл на все кнопки
    btns.forEach(b => {
      b.x += (b.tx - b.x) * .14; b.y += (b.ty - b.y) * .14;
      b.el.style.translate = `${b.x.toFixed(2)}px ${b.y.toFixed(2)}px`;
    });
    requestAnimationFrame(tick);
  })();
}

// лента на телефоне всегда начинается ровно от левого края колонки (после поворота экрана и возврата на страницу тоже)
{ const strip = () => { reels.scrollLeft = 0; }; strip(); addEventListener('resize', strip); addEventListener('pageshow', strip); }

// точки-индикатор ленты на телефоне: кликабельные, лента ещё и тянется мышью (на сенсорном экране листается пальцем сама)
{
  const phone = matchMedia('(max-width: 809px)');
  const dots = Object.assign(document.createElement('div'), { className: 'dots' });
  dots.innerHTML = items.map((_, k) => `<button type="button" aria-label="Ролик ${k + 1}"><i></i></button>`).join('');
  reels.after(dots);
  const step = () => items[0].fig.offsetWidth + 12;
  const mark = () => {
    const i = Math.min(items.length - 1, Math.round(reels.scrollLeft / step()));
    [...dots.querySelectorAll('i')].forEach((d, k) => d.classList.toggle('on', k === i));
  };
  reels.addEventListener('scroll', mark, { passive: true }); mark();
  dots.querySelectorAll('button').forEach((b, k) => b.addEventListener('click', () => reels.scrollTo({ left: k * step(), behavior: 'smooth' })));

  // перетаскивание мышью (в браузере на компьютере в режиме телефона)
  let down = null, moved = false;
  reels.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && phone.matches) { down = { x: e.clientX, s: reels.scrollLeft }; moved = false; } });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - down.x;
    if (Math.abs(dx) > 5) { moved = true; reels.style.scrollSnapType = 'none'; reels.scrollLeft = down.s - dx; }
  });
  addEventListener('pointerup', () => {
    if (!down) return;
    down = null; reels.style.scrollSnapType = '';
    if (moved) reels.scrollTo({ left: Math.round(reels.scrollLeft / step()) * step(), behavior: 'smooth' });
  });
  reels.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);

  // подсказка: один раз лента чуть сдвигается и возвращается
  if (!still) setTimeout(() => {
    if (!phone.matches || reels.scrollLeft > 0) return;
    reels.style.scrollSnapType = 'none'; reels.scrollTo({ left: 56, behavior: 'smooth' });
    setTimeout(() => { reels.scrollTo({ left: 0, behavior: 'smooth' }); setTimeout(() => { reels.style.scrollSnapType = ''; }, 500); }, 600);
  }, 3600);
}

// заливка главной кнопки разливается из точки, где вошёл (и стекает в точку, где вышел) курсор
{
  const b = document.querySelector('.hero__side .btn');
  if (b && matchMedia('(pointer: fine)').matches) ['mouseenter', 'mouseleave'].forEach(t => b.addEventListener(t, e => {
    const r = b.getBoundingClientRect();
    b.style.setProperty('--sx', `${e.clientX - r.left}px`); b.style.setProperty('--sy', `${e.clientY - r.top}px`);
  }));
}
