// Фильтр работ: скрывает карточки другого типа, сетка пересобирается.
{
  const btns = document.querySelectorAll('.filter button');
  const works = [...document.querySelectorAll('.work')];
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(o => o.classList.toggle('on', o === b));
    const f = b.dataset.f;
    works.forEach(w => {
      const show = f === 'all' || w.dataset.cat === f;
      w.hidden = !show;
      if (!show) w.querySelector('video')?.pause();
    });
    document.querySelector('.works__grid').classList.toggle('is-filtered', f !== 'all');
  }));
}
