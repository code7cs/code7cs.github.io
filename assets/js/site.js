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

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('motion-enabled');

for (const [index, node] of document.querySelectorAll('.hero > *, .page-intro > *, .resume-hero > *').entries()) {
  node.setAttribute('data-intro', '');
  node.style.setProperty('--motion-order', String(index));
}

const revealNodes = [...document.querySelectorAll(
  '.metric-card, .content-card, .story-panel, .cta-panel, .project-card, .resume-card',
)];

for (const [index, node] of revealNodes.entries()) {
  node.setAttribute('data-reveal', '');
  node.style.setProperty('--motion-order', String(index % 4));
}

if (reduceMotion.matches || !('IntersectionObserver' in window)) {
  for (const node of revealNodes) node.classList.add('is-visible');
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.12,
  });

  for (const node of revealNodes) revealObserver.observe(node);
}
