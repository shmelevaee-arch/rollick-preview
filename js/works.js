// Работы: при наведении ролик играет без звука с начала, клик включает звук (остальные ролики глохнут).
{
  const OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>';
  const ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>';
  const muteAll = () => {
    document.querySelectorAll('.reel video, .work video').forEach(o => { o.muted = true; });
    document.querySelectorAll('.reel__sound').forEach(b => { b.innerHTML = OFF; b.setAttribute('aria-label', 'Включить звук'); });
  };
  document.querySelectorAll('.work').forEach(w => {
    const box = w.querySelector('.work__media');
    const v = Object.assign(document.createElement('video'), { muted: true, loop: true, playsInline: true, preload: 'none', poster: w.dataset.poster, src: w.dataset.src });
    v.setAttribute('aria-label', w.querySelector('h3').textContent);
    const btn = Object.assign(document.createElement('button'), { className: 'reel__sound', type: 'button', innerHTML: OFF });
    btn.setAttribute('aria-label', 'Включить звук');
    box.append(v, btn);
    w.addEventListener('mouseenter', () => v.play().catch(() => {}));
    w.addEventListener('mouseleave', () => { if (v.muted) v.pause(); });
    box.addEventListener('click', () => {
      const on = v.muted;
      muteAll();
      if (on) { v.muted = false; btn.innerHTML = ON; btn.setAttribute('aria-label', 'Выключить звук'); v.play(); }
    });
  });
  // на телефоне наведения нет: ролик играет без звука, пока он на экране
  if (!matchMedia('(hover: hover)').matches) document.querySelectorAll('.work video').forEach(v =>
    new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: .6 }).observe(v));
}
