const root = document.documentElement;
const toggleButton = document.getElementById("theme-toggle");
const toggleText = document.getElementById("theme-toggle-text");
const themeMeta = document.querySelector('meta[name="theme-color"]');

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
  toggleText.textContent = `${nextTheme[0].toUpperCase()}${nextTheme.slice(1)} mode`;
  toggleButton.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
  themeMeta.setAttribute("content", theme === "dark" ? "#121210" : "#fffdf4");
}

applyTheme(readSavedTheme() || "dark");
toggleButton.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch { /* Storage can be disabled. */ }
});

document.getElementById("year").textContent = new Date().getFullYear();

const canvas = document.getElementById("cursor-canvas");
const hero = document.querySelector(".hero");
const ctx = canvas?.getContext("2d");

if (ctx && hero) {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mouse = { x: null, y: null };
  const LINK_DISTANCE = 200;
  const MOUSE_RADIUS = 180;
  const MOUSE_PULL = 0.04;
  const GLOW_SIZE = 200;

  let particles = [];
  let width = 0;
  let height = 0;
  let frameId = null;
  let heroVisible = true;

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(100, Math.max(24, Math.round((width * height) / 12500)));
    particles = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.18 + 0.08;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      return { x: Math.random() * width, y: Math.random() * height, vx, vy, baseVx: vx, baseVy: vy, size: Math.random() * 1.8 + 0.8 };
    });
  }

  function updateParticle(particle) {
    if (mouse.x !== null) {
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 1 && distance < MOUSE_RADIUS) {
        particle.vx += (dx / distance) * MOUSE_PULL;
        particle.vy += (dy / distance) * MOUSE_PULL;
      }
    }
    particle.vx += (particle.baseVx - particle.vx) * 0.03;
    particle.vy += (particle.baseVy - particle.vy) * 0.03;
    particle.x += particle.vx;
    particle.y += particle.vy;
    if (particle.x < 0) particle.x = width;
    if (particle.x > width) particle.x = 0;
    if (particle.y < 0) particle.y = height;
    if (particle.y > height) particle.y = 0;
  }

  function drawFrame() {
    frameId = null;
    if (motionPreference.matches || document.hidden || !heroVisible) return;
    ctx.clearRect(0, 0, width, height);
    const color = getComputedStyle(root).getPropertyValue("--particle").trim();

    if (mouse.x !== null) {
      const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, GLOW_SIZE);
      glow.addColorStop(0, `rgba(${color}, 0.22)`);
      glow.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    for (const particle of particles) {
      updateParticle(particle);
      ctx.fillStyle = `rgba(${color}, 0.85)`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      if (mouse.x !== null) {
        const distance = Math.hypot(mouse.x - particle.x, mouse.y - particle.y);
        if (distance < LINK_DISTANCE) {
          ctx.strokeStyle = `rgba(${color}, ${1 - distance / LINK_DISTANCE})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
    frameId = requestAnimationFrame(drawFrame);
  }

  function syncAnimation() {
    const shouldPlay = !motionPreference.matches && !document.hidden && heroVisible;
    if (shouldPlay && frameId === null) frameId = requestAnimationFrame(drawFrame);
    if (!shouldPlay && frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const bounds = canvas.getBoundingClientRect();
    mouse.x = event.clientX - bounds.left;
    mouse.y = event.clientY - bounds.top;
  });
  hero.addEventListener("pointerleave", () => { mouse.x = null; mouse.y = null; });
  document.addEventListener("visibilitychange", syncAnimation);
  motionPreference.addEventListener("change", syncAnimation);
  window.addEventListener("resize", () => { resizeCanvas(); syncAnimation(); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      syncAnimation();
    }, { threshold: 0.01 }).observe(hero);
  }

  resizeCanvas();
  syncAnimation();
}
