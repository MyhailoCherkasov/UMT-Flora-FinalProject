const mountHorizontalScroller = ({ root, track, previous, next, dots }) => {
  const scope = document.querySelector(root);
  if (!scope) return;

  const rail = scope.querySelector(track);
  const prevButton = scope.querySelector(previous);
  const nextButton = scope.querySelector(next);
  const dotsRoot = scope.querySelector(dots);
  if (!rail) return;

  const getStep = () => {
    const firstCard = rail.firstElementChild;
    if (!firstCard) return 0;
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap) || 0;
    return firstCard.getBoundingClientRect().width + gap;
  };

  const setArrowState = () => {
    const maxLeft = rail.scrollWidth - rail.clientWidth;
    if (prevButton) prevButton.disabled = rail.scrollLeft <= 1;
    if (nextButton) nextButton.disabled = rail.scrollLeft >= maxLeft - 4;
  };

  const setActiveDot = () => {
    if (!dotsRoot) return;
    const step = getStep();
    if (!step) return;
    const current = Math.round(rail.scrollLeft / step);
    [...dotsRoot.children].forEach((dot, index) => {
      dot.classList.toggle('is-current', index === current);
    });
  };

  if (dotsRoot) {
    dotsRoot.replaceChildren();
    [...rail.children].forEach((_, index) => {
      const dot = document.createElement('li');
      dot.className = index === 0 ? 'slider-dot is-current' : 'slider-dot';
      dot.addEventListener('click', () => {
        rail.scrollTo({ left: getStep() * index, behavior: 'smooth' });
      });
      dotsRoot.append(dot);
    });
  }

  prevButton?.addEventListener('click', () => rail.scrollBy({ left: -getStep(), behavior: 'smooth' }));
  nextButton?.addEventListener('click', () => rail.scrollBy({ left: getStep(), behavior: 'smooth' }));

  const refreshScroller = () => requestAnimationFrame(() => {
    setArrowState();
    setActiveDot();
  });

  rail.addEventListener('scroll', refreshScroller, { passive: true });
  window.addEventListener('resize', refreshScroller);
  refreshScroller();
};

mountHorizontalScroller({
  root: '.top-slider',
  track: '.top-list',
  previous: '.arrow-button--prev',
  next: '.arrow-button--next',
  dots: '.slider-dots'
});

mountHorizontalScroller({
  root: '.reviews-slider',
  track: '.reviews-list',
  previous: '.arrow-button--prev',
  next: '.arrow-button--next',
  dots: '.slider-dots'
});
