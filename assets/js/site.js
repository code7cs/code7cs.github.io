const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.primary-nav');

const setMenu = (open) => {
  if (!toggle || !nav) return;
  toggle.setAttribute('aria-expanded', String(open));
  nav.toggleAttribute('data-open', open);
  toggle.textContent = open ? 'Close' : 'Menu';
};

toggle?.addEventListener('click', () => {
  setMenu(toggle.getAttribute('aria-expanded') !== 'true');
});

nav?.addEventListener('click', (event) => {
  if (event.target instanceof HTMLAnchorElement) setMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    toggle.focus();
  }
});

const desktopQuery = window.matchMedia('(min-width: 48rem)');
desktopQuery.addEventListener('change', (event) => {
  if (event.matches) setMenu(false);
});

for (const node of document.querySelectorAll('[data-current-year]')) {
  node.textContent = String(new Date().getFullYear());
}
