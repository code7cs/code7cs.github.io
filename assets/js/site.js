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

let starPointerX = 0;
let starPointerY = 0;
let starPointerTargetX = 0;
let starPointerTargetY = 0;
const particleReticle = document.querySelector('.particle-reticle');

const updateGlobalPointer = (event) => {
  const viewportWidth = Math.max(window.innerWidth, 1);
  const viewportHeight = Math.max(window.innerHeight, 1);
  starPointerTargetX = (event.clientX / viewportWidth - .5) * 2;
  starPointerTargetY = (event.clientY / viewportHeight - .5) * 2;

  if (!particleReticle) return;
  particleReticle.style.setProperty('--pointer-x', `${event.clientX}px`);
  particleReticle.style.setProperty('--pointer-y', `${event.clientY}px`);
  particleReticle.classList.add('is-visible');
};

const clearGlobalPointer = () => {
  starPointerTargetX = 0;
  starPointerTargetY = 0;
  particleReticle?.classList.remove('is-visible');
};

if (particleReticle) {
  document.documentElement.classList.add('has-global-reticle');
  document.body.append(particleReticle);
}

window.addEventListener('pointermove', updateGlobalPointer, { passive: true });
window.addEventListener('blur', clearGlobalPointer);

const siteStarfield = document.createElement('canvas');
siteStarfield.className = 'site-starfield';
siteStarfield.setAttribute('aria-hidden', 'true');
document.body.prepend(siteStarfield);

const starContext = siteStarfield.getContext('2d');

if (starContext) {
  const stars = Array.from({ length: 190 }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: Math.random() < .1 ? 1.1 + Math.random() * .9 : .35 + Math.random() * .7,
    alpha: .18 + Math.random() * .5,
    phase: Math.random() * Math.PI * 2,
    twinkle: .00035 + Math.random() * .0009,
    drift: .000001 + Math.random() * .000006,
    parallax: .35 + Math.random() * .8,
    warm: Math.random() < .12,
  }));

  let starWidth = 1;
  let starHeight = 1;

  const resizeStarfield = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    starWidth = window.innerWidth;
    starHeight = window.innerHeight;
    siteStarfield.width = Math.round(starWidth * dpr);
    siteStarfield.height = Math.round(starHeight * dpr);
    starContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawStarfield = (timestamp = performance.now()) => {
    starContext.clearRect(0, 0, starWidth, starHeight);
    starPointerX += (starPointerTargetX - starPointerX) * .045;
    starPointerY += (starPointerTargetY - starPointerY) * .045;

    for (const star of stars) {
      const baseX = ((star.x + Math.sin(timestamp * star.drift + star.phase) * .006) % 1 + 1) % 1 * starWidth;
      const baseY = ((star.y + Math.cos(timestamp * star.drift * .7 + star.phase) * .004) % 1 + 1) % 1 * starHeight;
      const x = (baseX + starPointerX * 14 * star.parallax + starWidth) % starWidth;
      const y = (baseY + starPointerY * 12 * star.parallax + starHeight) % starHeight;
      const pulse = .78 + Math.sin(timestamp * star.twinkle + star.phase) * .22;
      const alpha = star.alpha * pulse;
      starContext.fillStyle = star.warm
        ? `rgba(240, 161, 112, ${alpha * .72})`
        : `rgba(191, 232, 255, ${alpha})`;
      starContext.beginPath();
      starContext.arc(x, y, star.radius, 0, Math.PI * 2);
      starContext.fill();
    }

    if (!reduceMotion.matches) requestAnimationFrame(drawStarfield);
  };

  resizeStarfield();
  drawStarfield();
  window.addEventListener('resize', resizeStarfield);
}

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

const scrollColorOnScroll = [...document.querySelectorAll('.scroll-color-on-scroll')];
const clampScrollColor = (value, min, max) => Math.max(min, Math.min(max, value));

const syncScrollHeadings = () => {
  if (reduceMotion.matches || !scrollColorOnScroll.length) return;

  const viewportHeight = Math.max(window.innerHeight, 1);
  const sweepStart = viewportHeight * .92;
  const sweepEnd = viewportHeight * .3;

  for (const heading of scrollColorOnScroll) {
    const progress = clampScrollColor(
      (sweepStart - heading.getBoundingClientRect().top) / (sweepStart - sweepEnd),
      0,
      1,
    );
    heading.style.setProperty(
      '--scroll-color-position',
      `${100 - progress * 100}%`,
    );
  }
};

if (scrollColorOnScroll.length) {
  window.addEventListener('scroll', syncScrollHeadings, { passive: true });
  window.addEventListener('resize', syncScrollHeadings);
  syncScrollHeadings();
}

const particleScene = document.querySelector('[data-particle-scene]');

if (particleScene) {
  const canvas = particleScene.querySelector('.particle-canvas');
  const context = canvas?.getContext('2d');

  if (canvas && context) {
    canvas.classList.add('is-global-particle-canvas');
    document.body.append(canvas);

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const points = Array.from({ length: 560 }, (_, index) => {
      const y = Math.random() * 2 - 1;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(1 - y * y);

      return {
        x: radius * Math.cos(angle),
        y,
        z: radius * Math.sin(angle),
        scatterX: Math.random() * 2 - 1,
        scatterY: Math.random() * 2 - 1,
        size: .7 + Math.random() * 1.8,
        warm: index % 6 === 0,
        offsetX: 0,
        offsetY: 0,
        velocityX: 0,
        velocityY: 0,
      };
    });

    let width = 360;
    let height = 250;
    let rotation = Math.random() * Math.PI;
    let rotationVelocity = 0;
    let scrollProgress = 0;
    let targetScrollProgress = 0;
    let cursorX = 0;
    let cursorY = 0;
    let previousCursorX = 0;
    let previousCursorY = 0;
    let cursorActive = false;
    let brushX = 0;
    let brushY = 0;
    let brushTrail = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      const scale = Math.min(width, height) * .26;
      const dispersion = scrollProgress * scrollProgress * (3 - 2 * scrollProgress);
      const sphereScale = scale * (1 - dispersion * .78);
      const interactionRadius = Math.max(16, scale * (.42 - dispersion * .16));
      const centerX = width / 2;
      const centerY = height * .5;
      const cosine = Math.cos(rotation);
      const sine = Math.sin(rotation);

      points.forEach((point) => {
        const x = point.x * cosine - point.z * sine;
        const depth = point.x * sine + point.z * cosine;
        const spherePx = centerX + x * sphereScale;
        const spherePy = centerY + point.y * sphereScale;
        const spreadPx = centerX + point.scatterX * width * .9;
        const spreadPy = height / 2 + point.scatterY * height * .9;
        const basePx = spherePx + (spreadPx - spherePx) * dispersion;
        const basePy = spherePy + (spreadPy - spherePy) * dispersion;
        const hitPx = basePx + point.offsetX * scale;
        const hitPy = basePy + point.offsetY * scale;

        brushTrail.forEach((brush) => {
          const distanceX = hitPx - brush.x;
          const distanceY = hitPy - brush.y;
          const distance = Math.hypot(distanceX, distanceY);

          if (distance >= interactionRadius) return;

          const falloff = (1 - distance / interactionRadius) * brush.life;
          const normalX = distance > 1 ? distanceX / distance : 0;
          const normalY = distance > 1 ? distanceY / distance : -1;
          const directionLength = Math.hypot(normalX * .85 + brush.dx, normalY * .85 + brush.dy) || 1;
          const impulse = (.008 + Math.min(Math.hypot(brush.dx, brush.dy), 1.2) * .038) * falloff;
          point.velocityX += (normalX * .85 + brush.dx) / directionLength * impulse;
          point.velocityY += (normalY * .85 + brush.dy) / directionLength * impulse;
        });

        point.velocityX += -point.offsetX * .012;
        point.velocityY += -point.offsetY * .012;
        point.velocityX *= .94;
        point.velocityY *= .94;
        point.offsetX = clamp(point.offsetX + point.velocityX, -.45, .45);
        point.offsetY = clamp(point.offsetY + point.velocityY, -.45, .45);

        const interactionScale = 1 - dispersion * .4;
        const px = basePx + point.offsetX * scale * interactionScale;
        const py = basePy + point.offsetY * scale * interactionScale;
        const alpha = (.24 + ((depth + 1) / 2) * .62) * (1 - dispersion * .26);
        const size = point.size * (.6 + ((depth + 1) / 2) * .85) * (1 - dispersion * .28);

        context.fillStyle = point.warm
          ? `rgba(255, ${150 + Math.round(depth * 18)}, 104, ${alpha})`
          : `rgba(142, 219, 247, ${alpha})`;
        context.beginPath();
        context.arc(px, py, size, 0, Math.PI * 2);
        context.fill();
      });

      brushX *= .84;
      brushY *= .84;
      brushTrail = brushTrail
        .map((brush) => ({ ...brush, life: brush.life * .78 }))
        .filter((brush) => brush.life > .035);
    };

    const animate = () => {
      rotation += rotationVelocity;
      rotationVelocity *= .92;
      scrollProgress += (targetScrollProgress - scrollProgress) * .028;
      if (!reduceMotion.matches) rotation += .002;
      draw();
      if (!reduceMotion.matches) requestAnimationFrame(animate);
    };

    const setPointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;

      if (!cursorActive) {
        previousCursorX = nextX;
        previousCursorY = nextY;
      }

      brushX = clamp(brushX + (nextX - previousCursorX) / Math.max(rect.width, 1) * 7, -1.2, 1.2);
      brushY = clamp(brushY + (nextY - previousCursorY) / Math.max(rect.height, 1) * 7, -1.2, 1.2);
      if (Math.abs(nextX - previousCursorX) + Math.abs(nextY - previousCursorY) > 1) {
        brushTrail.push({ x: nextX, y: nextY, dx: brushX, dy: brushY, life: 1 });
        brushTrail = brushTrail.slice(-8);
      }

      previousCursorX = nextX;
      previousCursorY = nextY;
      cursorActive = true;
      if (reduceMotion.matches) draw();
    };

    const clearPointer = () => { cursorActive = false; };

    let lastScrollY = window.scrollY;
    const syncScroll = () => {
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      const sceneStart = particleScene.offsetTop;
      const scrollDistance = Math.max(
        document.documentElement.scrollHeight - window.innerHeight - sceneStart,
        1,
      );
      const pageProgress = clamp((window.scrollY - sceneStart) / scrollDistance, 0, 1);
      const disperseEnd = .52;
      const reassembleStart = .72;
      const dispersion = pageProgress <= disperseEnd
        ? pageProgress / disperseEnd
        : pageProgress >= reassembleStart
          ? 1 - (pageProgress - reassembleStart) / (1 - reassembleStart)
          : 1;
      rotationVelocity += clamp(delta * .0008, -.08, .08);
      targetScrollProgress = dispersion;
      if (reduceMotion.matches) {
        scrollProgress = dispersion;
        draw();
      }
    };

    window.addEventListener('pointermove', setPointer);
    window.addEventListener('blur', clearPointer);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', syncScroll, { passive: true });
    resize();
    syncScroll();
    draw();
    if (!reduceMotion.matches) requestAnimationFrame(animate);
  }
}
