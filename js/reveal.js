// Текст о студии проявляется по словам: чем дальше прокрутка, тем больше слов становятся тёмными.
const text = document.querySelector('.reveal');
if (text && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // делим на слова, сохраняя неразрывные пробелы внутри слов
  const words = text.textContent.split(' ');
  text.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
  const spans = [...text.querySelectorAll('.w')];
  let ticking = false;
  const update = () => {
    const r = text.getBoundingClientRect(), vh = innerHeight;
    // начало – верх абзаца на 85% высоты экрана, конец – низ абзаца на 45%
    const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .4)));
    const n = Math.round(p * spans.length);
    spans.forEach((s, i) => s.classList.toggle('on', i < n));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
}
