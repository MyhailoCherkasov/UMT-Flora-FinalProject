const toggleControl = document.querySelector('[data-drawer-toggle]');
const drawerPanel = document.querySelector('[data-drawer]');

if (toggleControl && drawerPanel) {
  const closeDrawer = () => {
    toggleControl.classList.remove('is-open');
    drawerPanel.classList.remove('is-open');
    document.body.classList.remove('page-menu-lock');
    toggleControl.setAttribute('aria-expanded', 'false');
  };

  const openDrawer = () => {
    toggleControl.classList.add('is-open');
    drawerPanel.classList.add('is-open');
    document.body.classList.add('page-menu-lock');
    toggleControl.setAttribute('aria-expanded', 'true');
  };

  toggleControl.addEventListener('click', () => {
    drawerPanel.classList.contains('is-open') ? closeDrawer() : openDrawer();
  });

  drawerPanel.addEventListener('click', event => {
    const clickedMenuTarget = event.target.closest('a, button');
    if (clickedMenuTarget) closeDrawer();
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawerPanel.classList.contains('is-open')) {
      closeDrawer();
    }
  });
}
