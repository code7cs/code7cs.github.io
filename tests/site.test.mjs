import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const primaryPageFiles = ['index.html', 'projects.html', 'resume.html'];
const pageFiles = [...primaryPageFiles, '404.html'];
const read = (file) => readFileSync(join(root, file), 'utf8');

test('required portfolio pages exist', () => {
  for (const file of pageFiles) {
    assert.equal(existsSync(join(root, file)), true, `${file} must exist`);
  }
});

test('each page has a unique title and main heading', () => {
  const titles = new Set();

  for (const file of pageFiles) {
    const html = read(file);
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];

    assert.ok(title, `${file} must have a title`);
    assert.match(html, /<h1[^>]*>.*?<\/h1>/is, `${file} must have an h1`);
    titles.add(title);
  }

  assert.equal(titles.size, pageFiles.length);
});

test('about page communicates positioning and verified impact', () => {
  const html = read('index.html');

  assert.match(html, /Senior Full-Stack Engineer/i);
  assert.match(html, /deep frontend expertise/i);
  assert.match(html, /6\+ years/i);
  assert.match(html, /50\+ feature teams/i);
  assert.match(html, /300\+ routes/i);
  assert.match(html, /under 30 seconds/i);
  assert.match(html, /View Projects/i);
  assert.match(html, /View Resume/i);
});

test('hero headline exposes line spans for a scroll color sweep', () => {
  const html = read('index.html');
  const css = read('assets/css/styles.css');
  const js = read('assets/js/site.js');

  assert.match(html, /<h1 id="hero-title" class="scroll-color-heading">/);
  assert.match(html, /<span>I build dependable web<\/span>/);
  assert.match(html, /<span>platforms that help<\/span>/);
  assert.match(html, /<span>teams move faster\.<\/span>/);
  assert.match(css, /\.scroll-color-heading span/);
  assert.match(css, /background-clip:\s*text/);
  assert.match(css, /background-position:\s*100%\s*0/);
  assert.match(js, /particleScene/);
});

test('hero headline color sweep starts automatically after page load', () => {
  const css = read('assets/css/styles.css');
  const js = read('assets/js/site.js');

  assert.match(css, /@keyframes\s+title-color-sweep/);
  assert.match(css, /\.scroll-color-heading span[\s\S]*animation:\s*title-color-sweep/);
  assert.match(css, /title-color-sweep\s+18s/);
  assert.match(css, /\.scroll-color-heading span:nth-child\(2\)/);
  assert.match(css, /\.scroll-color-heading span:nth-child\(3\)/);
  assert.doesNotMatch(js, /scrollColorLines/);
});

test('selected section headings sweep color with scroll progress', () => {
  const html = read('index.html');
  const css = read('assets/css/styles.css');
  const js = read('assets/js/site.js');

  assert.match(html, /<h2 id="impact-title" class="scroll-color-on-scroll">Platform scale with practical outcomes<\/h2>/);
  assert.match(html, /<h2 id="expertise-title" class="scroll-color-on-scroll">Architecture, delivery, and engineering leverage<\/h2>/);
  assert.match(css, /\.scroll-color-on-scroll[\s\S]*background-position:\s*var\(--scroll-color-position/);
  assert.match(js, /scrollColorOnScroll/);
  assert.match(js, /getBoundingClientRect/);
  assert.match(js, /--scroll-color-position/);
  assert.match(js, /window\.addEventListener\('scroll', syncScrollHeadings/);
});

test('projects page includes all approved case studies and ownership language', () => {
  const html = read('projects.html');
  for (const name of ['Control Hub Frontend Platform', 'Momentum CH Design System', 'Engineering Lab', 'Local Wellness Customer Platform']) {
    assert.match(html, new RegExp(name, 'i'));
  }
  assert.match(html, /Control Hub implementation and adoption/i);
  assert.match(html, /https:\/\/momentum\.design\/en\//i);
  assert.match(html, /https:\/\/github\.com\/code7cs\/Demos/i);
});

test('resume page translates approved resume content without publishing the PDF', () => {
  const html = read('resume.html');
  for (const value of ['Cisco Systems', 'Tesla', 'Infosys', 'Stevens Institute of Technology', 'Tianjin University of Commerce']) {
    assert.match(html, new RegExp(value, 'i'));
  }
  assert.match(html, /Professional Summary/i);
  assert.match(html, /Technical Skills/i);
  assert.doesNotMatch(html, /\.pdf|Download Resume/i);
  assert.equal(existsSync(join(root, 'assets/resume/Hanfan_Wang_Resume_Senior_Frontend_Engineer.pdf')), false);
});

test('work authorization appears only on the resume page', () => {
  const about = read('index.html');
  const resume = read('resume.html');
  assert.match(about, /Verona, NJ · NYC metro/i);
  assert.doesNotMatch(about, /authorized to work without sponsorship/i);
  assert.match(resume, /authorized to work without sponsorship/i);
});

test('public HTML does not expose the phone number', () => {
  for (const file of pageFiles) {
    assert.doesNotMatch(read(file), /201[-.)\s]*238[-.\s]*6649/);
  }
});

test('portfolio pages do not contain stray patch markers', () => {
  for (const file of pageFiles) {
    assert.doesNotMatch(read(file), /^\+/m, `${file} contains a stray patch marker`);
  }
});

test('every page has accessible shared navigation and content landmarks', () => {
  for (const file of pageFiles) {
    const html = read(file);
    assert.match(html, /class="skip-link"[^>]*href="#main-content"/i);
    assert.match(html, /<nav[^>]*aria-label="Primary navigation"/i);
    assert.match(html, /<main id="main-content"/i);
    assert.match(html, /class="nav-toggle"[^>]*aria-expanded="false"/i);
    const expectedCurrentLinks = primaryPageFiles.includes(file) ? 1 : 0;
    assert.equal((html.match(/aria-current="page"/g) ?? []).length, expectedCurrentLinks, `${file} has the wrong current-page state`);
    for (const href of ['index.html', 'projects.html', 'resume.html']) {
      assert.match(html, new RegExp(`href="${href}"`, 'i'));
    }
  }
});

test('new-tab links prevent opener access', () => {
  for (const file of pageFiles) {
    const html = read(file);
    for (const tag of html.match(/<a\b[^>]*target="_blank"[^>]*>/gi) ?? []) {
      assert.match(tag, /rel="[^"]*noopener[^"]*"/i, `${file}: ${tag}`);
    }
  }
});

test('shared assets provide responsive, focus, and reduced-motion behavior', () => {
  assert.equal(existsSync(join(root, 'assets/css/styles.css')), true);
  assert.equal(existsSync(join(root, 'assets/js/site.js')), true);
  const css = read('assets/css/styles.css');
  const js = read('assets/js/site.js');
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media\s*\(max-width:\s*48rem\)/);
  assert.match(css, /@keyframes\s+ambient-drift/);
  assert.match(css, /animation:\s*ambient-drift\s+16s\s+ease-in-out\s+infinite\s+alternate/);
  assert.match(css, /background-position:\s*0%\s*0%,\s*100%\s*100%,\s*center/);
  assert.match(css, /background-position:\s*70%\s*42%,\s*30%\s*58%,\s*center/);
  assert.match(css, /@keyframes\s+intro-reveal/);
  assert.match(css, /\[data-reveal\]\.is-visible/);
  assert.match(css, /@media\s*\(hover:\s*hover\)/);
  assert.doesNotMatch(css, /body\s*\{[^}]*min-width\s*:\s*20rem/s, 'body must shrink inside a 320px viewport with a scrollbar');
  assert.match(js, /aria-expanded/);
  assert.match(js, /Escape/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /data-reveal/);
  assert.match(js, /is-visible/);
});

test('homepage includes the approved scroll-dissolving particle scene', () => {
  const about = read('index.html');
  const css = read('assets/css/styles.css');
  const js = read('assets/js/site.js');

  assert.match(about, /data-particle-scene/);
  assert.match(about, /class="particle-canvas"/);
  assert.match(about, /class="particle-reticle"/);
  assert.match(css, /\.hero-immersive/);
  assert.match(css, /cursor:\s*none/);
  assert.match(js, /scrollProgress/);
  assert.match(js, /targetScrollProgress/);
  assert.match(js, /brushTrail/);
  assert.match(js, /window\.addEventListener\('pointermove', setPointer/);
});

test('particle dispersion cycles from sphere to spread and back while scrolling', () => {
  const js = read('assets/js/site.js');

  assert.match(js, /document\.documentElement\.scrollHeight/);
  assert.match(js, /const disperseEnd = \.52/);
  assert.match(js, /const reassembleStart = \.72/);
  assert.match(js, /const pageProgress/);
  assert.match(js, /targetScrollProgress = dispersion/);
});

test('particle sphere stays centered as a page-wide background layer', () => {
  const css = read('assets/css/styles.css');
  const js = read('assets/js/site.js');

  assert.match(css, /\.particle-canvas\.is-global-particle-canvas\s*\{[\s\S]*position:\s*fixed/);
  assert.match(css, /\.particle-canvas\.is-global-particle-canvas\s*\{[\s\S]*width:\s*100vw/);
  assert.match(js, /canvas\.classList\.add\('is-global-particle-canvas'/);
  assert.match(js, /document\.body\.append\(canvas\)/);
  assert.match(js, /const centerY = height \* \.5/);
  assert.match(js, /window\.addEventListener\('pointermove', setPointer/);
});

test('crosshair follows the pointer across the whole viewport without a glow', () => {
  const css = read('assets/css/styles.css');
  const js = read('assets/js/site.js');

  assert.match(css, /\.particle-reticle\s*\{[\s\S]*position:\s*fixed/);
  assert.match(css, /\.particle-reticle::before,[\s\S]*\.particle-reticle::after\s*\{[\s\S]*box-shadow:\s*none/);
  assert.match(js, /document\.body\.append\(particleReticle\)/);
  assert.match(js, /window\.addEventListener\('pointermove', updateGlobalPointer/);
});

test('major headings stay still on pointer hover', () => {
  const css = read('assets/css/styles.css');

  assert.doesNotMatch(css, /\.hero h1:hover/);
  assert.doesNotMatch(css, /transform:\s*translateY\(-\.12rem\) scale\(1\.006\)/);
  assert.doesNotMatch(css, /text-shadow:\s*0 \.2rem 1\.25rem rgb\(142 219 247 \/ 13%\)/);
});

test('pointer movement gently shifts the randomized site stars', () => {
  const js = read('assets/js/site.js');

  assert.match(js, /parallax:\s*\.35 \+ Math\.random\(\) \* \.8/);
  assert.match(js, /starPointerTargetX/);
  assert.match(js, /starPointerX \+= \(starPointerTargetX - starPointerX\) \* \.045/);
  assert.match(js, /window\.addEventListener\('pointermove', updateGlobalPointer/);
});

test('site uses a page-wide dark particle backdrop', () => {
  const css = read('assets/css/styles.css');

  assert.match(css, /color-scheme:\s*dark/);
  assert.match(css, /--bg:\s*#060d14/);
  assert.match(css, /body::before\s*\{/);
  assert.match(css, /\.site-starfield\s*\{/);
  assert.match(css, /body\s*>\s*\*\s*\{/);
  assert.match(css, /\.hero-immersive\s*\{[\s\S]*background:\s*transparent/);
});

test('sitewide stars use randomized points instead of a repeating grid', () => {
  const css = read('assets/css/styles.css');
  const js = read('assets/js/site.js');

  assert.match(css, /\.site-starfield\s*\{/);
  assert.doesNotMatch(css, /body::before\s*\{[\s\S]*background-size:\s*62px\s+58px/s);
  assert.match(js, /siteStarfield/);
  assert.match(js, /Math\.random\(\)/);
  assert.match(js, /prefers-reduced-motion/);
});

test('particle scene uses the full viewport width for scroll dispersion', () => {
  const css = read('assets/css/styles.css');

  assert.match(css, /\.hero-immersive\s*\{[\s\S]*width:\s*100vw/);
  assert.match(css, /\.hero-immersive\s*\{[\s\S]*max-width:\s*none/);
  assert.match(css, /\.hero-immersive\s*\{[\s\S]*margin-inline:\s*calc\(50%\s*-\s*50vw\)/);
  assert.match(css, /html\s*\{[\s\S]*overflow-x:\s*clip/);
});

test('mobile breakpoint keeps the full-width particle scene centered', () => {
  const css = read('assets/css/styles.css');

  assert.match(css, /@media\s*\(max-width:\s*30rem\)[\s\S]*\.hero-immersive\s*\{[\s\S]*width:\s*100vw/);
  assert.match(css, /@media\s*\(max-width:\s*30rem\)[\s\S]*\.hero-immersive\s*\{[\s\S]*margin-inline:\s*calc\(50%\s*-\s*50vw\)/);
});

test('motion initialization preserves visible content for accessibility fallbacks', () => {
  const js = read('assets/js/site.js');
  assert.match(js, /reduceMotion\.matches/);
  assert.match(js, /'IntersectionObserver' in window/);
  assert.match(js, /node\.classList\.add\('is-visible'\)/);
});

test('every public page includes useful metadata', () => {
  for (const file of pageFiles) {
    const html = read(file);
    assert.match(html, /<meta[^>]*name="viewport"[^>]*content="width=device-width, initial-scale=1"/i);
    assert.match(html, /<meta[^>]*name="description"[^>]*content="[^"]+"/i);
  }
});

test('custom 404 page provides clear recovery paths', () => {
  const html = read('404.html');
  assert.match(html, /Page not found/i);
  assert.match(html, /Return Home/i);
  assert.match(html, /View Projects/i);
});

test('local page and asset links resolve', () => {
  for (const file of pageFiles) {
    const html = read(file);
    const references = [
      ...html.matchAll(/(?:href|src)="([^"]+)"/gi),
    ].map((match) => match[1]);

    for (const reference of references) {
      if (/^(?:https?:|mailto:|#)/i.test(reference)) continue;
      const localPath = reference.split(/[?#]/)[0];
      assert.equal(existsSync(join(root, localPath)), true, `${file} references missing ${localPath}`);
    }
  }
});

test('repository documentation explains the site and local preview', () => {
  assert.equal(existsSync(join(root, 'README.md')), true);
  const readme = read('README.md');
  assert.match(readme, /code7cs\.github\.io/i);
  assert.match(readme, /preview/i);
});
