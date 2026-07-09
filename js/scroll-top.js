const scrollUpButton = document.getElementById('scrollToTop');

if (scrollUpButton) {
  const updateScrollButton = () => {
    scrollUpButton.classList.toggle('is-visible', window.scrollY > 500);
  };

  window.addEventListener('scroll', updateScrollButton, { passive: true });
  updateScrollButton();

  scrollUpButton.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
