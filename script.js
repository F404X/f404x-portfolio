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
  themeMeta.setAttribute("content", theme === "dark" ? "#10110f" : "#f8f5ec");
}

applyTheme(readSavedTheme() || "dark");
toggleButton.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch { /* Storage can be disabled. */ }
});

document.getElementById("year").textContent = new Date().getFullYear();

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

    emailState.textContent = copied ? "✓ Copiado!" : "Falha ao copiar";
    emailButton.classList.add(copied ? "is-success" : "is-error");
    emailFeedback.textContent = copied
      ? "Email copied to clipboard."
      : "Automatic copy is unavailable. Please copy this address manually: " + email;

    resetFeedbackTimer = setTimeout(() => {
      if (request !== latestCopyRequest) return;
      emailButton.classList.remove("is-success", "is-error");
      emailState.textContent = "";
    }, 2000);
  });
}
