const root = document.documentElement;
const toggleButton = document.getElementById("theme-toggle");
const toggleText = document.getElementById("theme-toggle-text");
const themeMeta = document.querySelector('meta[name="theme-color"]');

let portfolioLocale = "en";
const translate = key => portfolioTranslations[portfolioLocale][key];

function readSavedTheme() {
  try {
    const saved = localStorage.getItem("theme");
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  const nextTheme = theme === "dark" ? "light" : "dark";
  toggleText.textContent = translate(nextTheme);
  toggleButton.setAttribute("aria-label", translate(nextTheme));
  themeMeta.setAttribute("content", theme === "dark" ? "#0b1018" : "#f3f6fb");
}

applyTheme(readSavedTheme() || "dark");
toggleButton.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch { /* Storage can be disabled. */ }
});

document.getElementById("year").textContent = new Date().getFullYear();

/* Restored from the original F404X hero, tuned to the current layout.
   Lightweight ambient particles drift slowly and gather around the pointer. */
const particleCanvas = document.getElementById("cursor-canvas");
const particleHero = document.querySelector(".hero");
const particleContext = particleCanvas?.getContext("2d");

if (particleContext && particleHero) {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: null, y: null };
  const ATTRACTION_RADIUS = 215;
  const CONNECTION_RADIUS = 150;
  const PARTICLE_PULL = 0.3;
  const MAX_SPEED = 2.4;

  let particles = [];
  let width = 0;
  let height = 0;
  let frameId = null;
  let lastFrameTime = 0;
  let heroVisible = true;

  function resizeParticles() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = particleCanvas.clientWidth;
    height = particleCanvas.clientHeight;
    if (!width || !height) return;

    particleCanvas.width = Math.round(width * ratio);
    particleCanvas.height = Math.round(height * ratio);
    particleContext.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.min(100, Math.max(28, Math.round(width * height / 12500)));
    particles = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.09 + Math.random() * 0.23;
      const baseVx = Math.cos(angle) * speed;
      const baseVy = Math.sin(angle) * speed;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: baseVx, vy: baseVy, baseVx, baseVy,
        size: 0.85 + Math.random() * 1.55,
        opacity: 0.42 + Math.random() * 0.36
      };
    });
  }

  function updateParticle(p, step) {
    if (pointer.x !== null) {
      const dx = pointer.x - p.x;
      const dy = pointer.y - p.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 2 && distance < ATTRACTION_RADIUS) {
        const pull = PARTICLE_PULL * (1 - distance / ATTRACTION_RADIUS) * step;
        p.vx += (dx / distance) * pull;
        p.vy += (dy / distance) * pull;
      }
    }

    // Gradually return to the particle's own direction after the pointer leaves.
    const recovery = Math.min(1, 0.025 * step);
    p.vx += (p.baseVx - p.vx) * recovery;
    p.vy += (p.baseVy - p.vy) * recovery;

    const speed = Math.hypot(p.vx, p.vy);
    if (speed > MAX_SPEED) {
      p.vx = p.vx / speed * MAX_SPEED;
      p.vy = p.vy / speed * MAX_SPEED;
    }

    p.x += p.vx * step;
    p.y += p.vy * step;
    if (p.x < -3) p.x = width + 3;
    if (p.x > width + 3) p.x = -3;
    if (p.y < -3) p.y = height + 3;
    if (p.y > height + 3) p.y = -3;
  }

  function drawParticles(time) {
    frameId = null;
    if (motionPreference.matches || document.hidden || !heroVisible || !width || !height) return;

    // Clamp elapsed time so animation remains stable after slow frames.
    const step = lastFrameTime ? Math.min(1.8, (time - lastFrameTime) / (1000 / 60)) : 1;
    lastFrameTime = time;
    const color = getComputedStyle(root).getPropertyValue("--particle").trim();
    particleContext.clearRect(0, 0, width, height);

    if (pointer.x !== null) {
      const glow = particleContext.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 150);
      glow.addColorStop(0, `rgba(${color}, 0.09)`);
      glow.addColorStop(1, `rgba(${color}, 0)`);
      particleContext.fillStyle = glow;
      particleContext.fillRect(pointer.x - 150, pointer.y - 150, 300, 300);
    }

    for (const particle of particles) {
      updateParticle(particle, step);

      particleContext.fillStyle = `rgba(${color}, ${particle.opacity})`;
      particleContext.beginPath();
      particleContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      particleContext.fill();

      if (pointer.x !== null) {
        const distance = Math.hypot(pointer.x - particle.x, pointer.y - particle.y);
        if (distance < CONNECTION_RADIUS) {
          const opacity = (1 - distance / CONNECTION_RADIUS) * 0.22;
          particleContext.strokeStyle = `rgba(${color}, ${opacity})`;
          particleContext.lineWidth = 0.75;
          particleContext.beginPath();
          particleContext.moveTo(particle.x, particle.y);
          particleContext.lineTo(pointer.x, pointer.y);
          particleContext.stroke();
        }
      }
    }

    frameId = requestAnimationFrame(drawParticles);
  }

  function syncParticles() {
    const shouldPlay = !motionPreference.matches && !document.hidden && heroVisible && width > 0 && height > 0;
    if (shouldPlay && frameId === null) {
      lastFrameTime = 0;
      frameId = requestAnimationFrame(drawParticles);
    } else if (!shouldPlay && frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  particleHero.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return; // Do not interfere with scrolling.
    const bounds = particleCanvas.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
  });
  particleHero.addEventListener("pointerleave", () => {
    pointer.x = null;
    pointer.y = null;
  });

  document.addEventListener("visibilitychange", syncParticles);
  motionPreference.addEventListener("change", syncParticles);
  window.addEventListener("resize", () => {
    resizeParticles();
    syncParticles();
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      resizeParticles();
      syncParticles();
    }).observe(particleHero);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      syncParticles();
    }, { threshold: 0.01 }).observe(particleHero);
  }

  resizeParticles();
  syncParticles();
}


// Assemble the address at runtime instead of exposing a plain email string
// in HTML or JS source. This only deters basic static email harvesters.
const emailButton = document.getElementById("copy-email");
const emailDisplay = document.getElementById("email-display");
const emailState = document.getElementById("email-copy-state");
const emailFeedback = document.getElementById("email-feedback");

if (emailButton && emailDisplay && emailState && emailFeedback) {
  let resetFeedbackTimer;
  let latestCopyRequest = 0;
  const mailbox = String.fromCharCode(99, 111, 110, 116, 97, 99, 116);
  const domain = String.fromCharCode(102, 52, 48, 52, 120, 46, 110, 101, 116);
  const email = mailbox + "@" + domain;

  emailDisplay.textContent = email;
  emailButton.hidden = false;

  emailButton.addEventListener("click", async () => {
    const request = ++latestCopyRequest;
    clearTimeout(resetFeedbackTimer);
    emailButton.classList.remove("is-success", "is-error");
    emailFeedback.textContent = "";

    let copied = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(email);
        copied = true;
      } catch { /* Try the legacy clipboard fallback. */ }
    }

    if (!copied) {
      const field = document.createElement("textarea");
      field.value = email;
      field.setAttribute("readonly", "");
      field.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
      document.body.appendChild(field);
      try {
        field.select();
        copied = document.execCommand("copy");
      } catch { /* Manual copy is offered below. */ }
      finally {
        field.remove();
        emailButton.focus();
      }
    }

    // Ignore stale clipboard results if the user clicked again meanwhile.
    if (request !== latestCopyRequest) return;

    emailState.textContent = translate(copied ? "copied" : "copyError");
    emailButton.classList.add(copied ? "is-success" : "is-error");
    emailFeedback.textContent = copied
      ? translate("copied")
      : translate("copyError") + ". " + email;

    resetFeedbackTimer = setTimeout(() => {
      if (request !== latestCopyRequest) return;
      emailButton.classList.remove("is-success", "is-error");
      emailState.textContent = "";
    }, 2000);
  });
}

const languagePicker = document.getElementById("language-picker");
const languageTrigger = document.getElementById("language-trigger");
const languagePanel = document.getElementById("language-panel");
const languageSearch = document.getElementById("language-search");
const languageOptions = document.getElementById("language-options");
const languageEmpty = document.getElementById("language-empty");
const currentLanguage = document.getElementById("language-current");
const localizedNodes = document.querySelectorAll("[data-i18n]");

function languageLabel([code, name, region, emoji]) {
  const flag = document.createElement("img");
  flag.alt = "";
  flag.width = 23;
  flag.height = 16;
  flag.addEventListener("error", () => {
    const fallback = document.createElement("span");
    fallback.setAttribute("aria-hidden", "true");
    fallback.textContent = emoji;
    flag.replaceWith(fallback);
  });
  flag.src = "https://flagcdn.com/w40/" + region + ".png";
  const label = document.createElement("bdi");
  label.lang = code;
  label.textContent = name;
  return [flag, label];
}

function setPortfolioLocale(entry) {
  const [code, name] = entry;
  portfolioLocale = code;
  root.lang = code === "pt" ? "pt-BR" : code;
  root.dir = code === "ar" || code === "he" ? "rtl" : "ltr";
  for (const node of localizedNodes) node.textContent = translate(node.dataset.i18n);
  currentLanguage.replaceChildren(...languageLabel(entry));
  languageTrigger.setAttribute("aria-label", `${translate("language")} · ${name}`);
  languageSearch.placeholder = translate("search");
  languageSearch.setAttribute("aria-label", translate("search"));
  languageEmpty.textContent = translate("empty");
  emailButton.setAttribute("aria-label", translate("copy"));
  emailFeedback.textContent = "";
  emailButton.classList.remove("is-success", "is-error");
  applyTheme(root.dataset.theme);
}

function closeLanguages(restoreFocus = false) {
  languagePanel.hidden = true;
  languageTrigger.setAttribute("aria-expanded", "false");
  if (restoreFocus) languageTrigger.focus();
}

const normalizeSearch = value => value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

function renderLanguages() {
  const query = normalizeSearch(languageSearch.value);
  const matching = portfolioLanguages.filter(entry => normalizeSearch(entry.join(" ")).includes(query));
  languageOptions.replaceChildren(...matching.map(entry => {
    const [code] = entry;
    const button = document.createElement("button");
    button.className = "language-option";
    button.type = "button";
    button.setAttribute("aria-pressed", String(code === portfolioLocale));
    const badge = document.createElement("small");
    badge.textContent = code.toUpperCase();
    badge.setAttribute("aria-hidden", "true");
    button.append(...languageLabel(entry), badge);
    button.addEventListener("click", () => {
      setPortfolioLocale(entry);
      try { localStorage.setItem("portfolio-language", code); } catch { /* Storage can be disabled. */ }
      closeLanguages(true);
    });
    return button;
  }));
  languageEmpty.hidden = matching.length > 0;
}

function openLanguages() {
  languageSearch.value = "";
  renderLanguages();
  languagePanel.hidden = false;
  languageTrigger.setAttribute("aria-expanded", "true");
  languageSearch.focus();
}

languageTrigger.addEventListener("click", () => languagePanel.hidden ? openLanguages() : closeLanguages());
languageTrigger.addEventListener("keydown", event => {
  if (event.key === "ArrowDown" && languagePanel.hidden) {
    event.preventDefault();
    openLanguages();
  }
});
languageSearch.addEventListener("input", renderLanguages);
languagePanel.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeLanguages(true);
    return;
  }
  const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
  if (!keys.includes(event.key) && !(event.key === "Enter" && event.target === languageSearch)) return;
  const options = [...languageOptions.querySelectorAll("button")];
  if (!options.length || (event.target === languageSearch && ["Home", "End"].includes(event.key))) return;
  event.preventDefault();
  const index = options.indexOf(event.target);
  const last = options.length - 1;
  const target = event.key === "Home" ? 0 : event.key === "End" ? last :
    event.key === "ArrowUp" ? (index <= 0 ? last : index - 1) : (index + 1) % options.length;
  options[target].focus();
});
document.addEventListener("pointerdown", event => {
  if (!languagePanel.hidden && !languagePicker.contains(event.target)) closeLanguages();
});
languagePicker.addEventListener("focusout", event => {
  if (!languagePanel.hidden && event.relatedTarget && !languagePicker.contains(event.relatedTarget)) closeLanguages();
});

let savedLanguage;
try { savedLanguage = localStorage.getItem("portfolio-language"); } catch { /* Storage can be disabled. */ }
setPortfolioLocale(portfolioLanguages.find(([code]) => code === savedLanguage) ?? portfolioLanguages[0]);
languagePicker.hidden = false;
