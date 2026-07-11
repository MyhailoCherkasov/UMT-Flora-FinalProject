const scrollers = [];

const mountHorizontalScroller = ({ root, track, previous, next, dots }) => {
  const scope = document.querySelector(root);
  if (!scope) return;

  const rail = scope.querySelector(track);
  const prevButton = scope.querySelector(previous);
  const nextButton = scope.querySelector(next);
  const dotsRoot = scope.querySelector(dots);
  if (!rail) return;

  let slidePositions = [0];

  const getStep = () => {
    const firstCard = rail.firstElementChild;
    if (!firstCard) return 0;
    const styles = getComputedStyle(rail);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    return firstCard.getBoundingClientRect().width + gap;
  };

  const getMaxLeft = () => Math.max(rail.scrollWidth - rail.clientWidth, 0);

  const buildSlidePositions = () => {
    const step = getStep();
    const maxLeft = getMaxLeft();

    if (!step || maxLeft <= 2) return [0];

    const positions = [0];
    let next = step;

    while (next < maxLeft - 2) {
      positions.push(Math.round(next));
      next += step;
    }

    const last = Math.round(maxLeft);
    if (last > 0 && positions[positions.length - 1] !== last) {
      positions.push(last);
    }

    return positions;
  };

  const getCurrentPage = () => {
    if (!slidePositions.length) return 0;

    let bestIndex = 0;
    let bestDistance = Math.abs(rail.scrollLeft - slidePositions[0]);

    slidePositions.forEach((position, index) => {
      const distance = Math.abs(rail.scrollLeft - position);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  };

  const renderDots = () => {
    if (!dotsRoot) return;

    slidePositions = buildSlidePositions();
    dotsRoot.replaceChildren();

    if (slidePositions.length <= 1) return;

    slidePositions.forEach((position, index) => {
      const dot = document.createElement('li');
      dot.className = index === getCurrentPage() ? 'slider-dot is-current' : 'slider-dot';
      dot.addEventListener('click', () => {
        rail.scrollTo({ left: position, behavior: 'smooth' });
      });
      dotsRoot.append(dot);
    });
  };

  const setArrowState = () => {
    const maxLeft = getMaxLeft();
    if (prevButton) prevButton.disabled = rail.scrollLeft <= 2;
    if (nextButton) nextButton.disabled = maxLeft <= 2 || rail.scrollLeft >= maxLeft - 4;
  };

  const setActiveDot = () => {
    if (!dotsRoot) return;
    const current = getCurrentPage();
    [...dotsRoot.children].forEach((dot, index) => {
      dot.classList.toggle('is-current', index === current);
    });
  };

  const refreshScroller = () => requestAnimationFrame(() => {
    const maxLeft = getMaxLeft();
    if (rail.scrollLeft > maxLeft) rail.scrollLeft = maxLeft;
    slidePositions = buildSlidePositions();
    renderDots();
    setArrowState();
    setActiveDot();
  });

  const goToSiblingSlide = direction => {
    slidePositions = buildSlidePositions();
    const current = getCurrentPage();
    const nextIndex = Math.min(Math.max(current + direction, 0), slidePositions.length - 1);
    rail.scrollTo({ left: slidePositions[nextIndex], behavior: 'smooth' });
  };

  prevButton?.addEventListener('click', () => goToSiblingSlide(-1));
  nextButton?.addEventListener('click', () => goToSiblingSlide(1));

  rail.addEventListener('scroll', () => requestAnimationFrame(() => {
    setArrowState();
    setActiveDot();
  }), { passive: true });

  window.addEventListener('resize', refreshScroller);

  scrollers.push(refreshScroller);
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

window.floraRefreshSliders = () => {
  scrollers.forEach(refresh => refresh());
};
