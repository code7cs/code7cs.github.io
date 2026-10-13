(() => {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".deck-slide"));
  const pageLinks = Array.from(document.querySelectorAll(".deck-pages a"));
  const presentButton = document.querySelector("[data-present]");
  const exitButton = document.querySelector("[data-present-exit]");
  const previousButton = document.querySelector("[data-slide-prev]");
  const nextButton = document.querySelector("[data-slide-next]");
  const counter = document.querySelector(".presenter-count");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let currentIndex = 0;
  let presenting = false;

  if (!slides.length || !presentButton || !exitButton || !previousButton || !nextButton || !counter) return;

  const clamp = (index) => Math.max(0, Math.min(slides.length - 1, index));
  const hashIndex = () => {
    const match = location.hash.match(/^#slide-(\d+)$/);
    return match ? clamp(Number(match[1]) - 1) : 0;
  };

  function setCurrent(index, updateHash = false) {
    currentIndex = clamp(index);
    slides.forEach((slide, i) => slide.classList.toggle("current-slide", i === currentIndex));
    pageLinks.forEach((link, i) => {
      if (i === currentIndex) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    counter.textContent = String(currentIndex + 1).padStart(2, "0") + " / " + slides.length;
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;
    if (updateHash) {
      const url = new URL(location.href);
      url.hash = slides[currentIndex].id;
      history.replaceState({}, "", url);
    }
  }

  function nearestSlide() {
    let bestDistance = Infinity;
    let index = 0;
    slides.forEach((slide, i) => {
      const distance = Math.abs(slide.getBoundingClientRect().top - 82);
      if (distance < bestDistance) {
        bestDistance = distance;
        index = i;
      }
    });
    return index;
  }

  function navigate(index) {
    setCurrent(index, true);
    if (!presenting) slides[currentIndex].scrollIntoView({
      behavior: reducedMotion ? "instant" : "smooth",
      block: "start"
    });
  }

  function togglePresent(on) {
    if (on) {
      setCurrent(nearestSlide(), true);
      document.activeElement?.blur?.();
      document.body.classList.add("is-presenting");
      presenting = true;
      window.scrollTo(0, 0);
      exitButton.focus({ preventScroll: true });
    } else {
      document.body.classList.remove("is-presenting");
      presenting = false;
      slides[currentIndex].scrollIntoView({ block: "start", behavior: "instant" });
      presentButton.focus({ preventScroll: true });
    }
  }

  presentButton.addEventListener("click", () => togglePresent(true));
  exitButton.addEventListener("click", () => togglePresent(false));
  previousButton.addEventListener("click", () => navigate(currentIndex - 1));
  nextButton.addEventListener("click", () => navigate(currentIndex + 1));

  document.querySelectorAll(".portfolio-deck a[href^='#slide-']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href").slice(1);
      const index = slides.findIndex((slide) => slide.id === id);
      if (index < 0) return;
      event.preventDefault();
      navigate(index);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!presenting || event.target.closest?.("input,textarea,select,[contenteditable=true]")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      togglePresent(false);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      navigate(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
    }
  });

  window.addEventListener("hashchange", () => {
    setCurrent(hashIndex());
    if (presenting) window.scrollTo(0, 0);
    else slides[currentIndex].scrollIntoView({ block: "start", behavior: "instant" });
  });

  const initialIndex = hashIndex();
  setCurrent(initialIndex);
  if (location.hash) requestAnimationFrame(() => {
    slides[initialIndex].scrollIntoView({ block: "start", behavior: "instant" });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (presenting) return;
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length) {
        const closest = visible.reduce((best, entry) =>
          Math.abs(entry.boundingClientRect.top - 82) < Math.abs(best.boundingClientRect.top - 82)
            ? entry : best
        );
        setCurrent(slides.indexOf(closest.target));
      }
    }, { rootMargin: "-15% 0px -55% 0px", threshold: 0 });
    slides.forEach((slide) => observer.observe(slide));
  }

  document.querySelectorAll("[data-theme-preview]").forEach((button) => {
    button.addEventListener("click", () => {
      const scene = button.closest(".theme-scene");
      const dark = scene.dataset.previewTheme !== "dark";
      scene.dataset.previewTheme = dark ? "dark" : "light";
      button.setAttribute("aria-pressed", String(dark));
      button.textContent = dark ? "Switch to light" : "Switch to dark";
      scene.querySelector("[data-theme-name]").textContent = dark ? "Dark theme" : "Light theme";
    });
  });

  const toggle = document.querySelector("[data-form-example]");
  const output = document.querySelector("[data-form-value]");
  if (toggle && output) {
    const updateState = () => {
      output.textContent = "Analytics export: " + (toggle.checked ? "On" : "Off");
    };
    toggle.addEventListener("change", updateState);
    updateState();
  }
})();
