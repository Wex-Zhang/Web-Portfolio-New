/* ============================================================
   HOME.JS — Zhang Wenxu Portfolio
   Handles: cursor, ASCII canvas, timestamp, nav overlay,
            and the scroll-to-page-2 cinematic transition
   ============================================================ */

// ──────────────────────────────────────────────────────────────
//  CUSTOM CURSOR
// ──────────────────────────────────────────────────────────────
const cursorDot     = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');
const mouse   = { x: -200, y: -200 };
const outline = { x: -200, y: -200 };

document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  cursorDot.style.left = `${mouse.x}px`;
  cursorDot.style.top  = `${mouse.y}px`;

  const mxEl = document.getElementById('mouse-x');
  const myEl = document.getElementById('mouse-y');
  if (mxEl) mxEl.textContent = Math.round(mouse.x);
  if (myEl) myEl.textContent = Math.round(mouse.y);
});

(function animOutline() {
  outline.x += (mouse.x - outline.x) * 0.11;
  outline.y += (mouse.y - outline.y) * 0.11;
  cursorOutline.style.left = `${outline.x}px`;
  cursorOutline.style.top  = `${outline.y}px`;
  requestAnimationFrame(animOutline);
})();


// ──────────────────────────────────────────────────────────────
//  LIVE TIMESTAMP
// ──────────────────────────────────────────────────────────────
function updateTimestamp() {
  const el = document.getElementById('timestamp');
  if (el) {
    el.textContent = new Date().toLocaleTimeString('en-US', { hour12: false }) + ' GET';
  }
}
setInterval(updateTimestamp, 1000);
updateTimestamp();


// ──────────────────────────────────────────────────────────────
//  NAV OVERLAY
// ──────────────────────────────────────────────────────────────
const navOverlay = document.getElementById('nav-overlay');

document.querySelectorAll('.trigger-nav').forEach(el => {
  el.addEventListener('click', () => navOverlay.classList.add('active'));
});

document.querySelectorAll('.trigger-nav-close').forEach(el => {
  el.addEventListener('click', () => navOverlay.classList.remove('active'));
});

navOverlay.addEventListener('click', (e) => {
  if (e.target === navOverlay) navOverlay.classList.remove('active');
});

// Nav items that trigger the portfolio transition
const linkPortfolio = document.getElementById('link-portfolio');
if (linkPortfolio) {
  linkPortfolio.addEventListener('click', (e) => {
    e.preventDefault();
    navOverlay.classList.remove('active');
    setTimeout(() => triggerTransition(1), 100);
  });
}


// ──────────────────────────────────────────────────────────────
//  ASCII CANVAS ANIMATION
// ──────────────────────────────────────────────────────────────
const canvas     = document.getElementById('ascii-canvas');
const ctx        = canvas.getContext('2d');
const renderMsEl = document.getElementById('render-ms');

const CHAR_SIZE    = 14;
const DENSITY_CHARS = ' .:-=+*#%@';

let cw = 0, ch = 0;
let ctime = 0;

function resizeCanvas() {
  const zone = document.getElementById('canvas-zone');
  if (!zone) return;
  cw = zone.clientWidth;
  ch = zone.clientHeight;
  canvas.width  = cw;
  canvas.height = ch;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function renderAscii() {
  const t0 = performance.now();
  ctx.clearRect(0, 0, cw, ch);
  ctx.font      = `600 ${CHAR_SIZE}px DM Sans`;
  ctx.textAlign = 'center';

  const cols = Math.ceil(cw / CHAR_SIZE);
  const rows = Math.ceil(ch / CHAR_SIZE);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = col * CHAR_SIZE;
      const py = row * CHAR_SIZE;

      const dx       = px - mouse.x;
      const dy       = py - mouse.y;
      const dist     = Math.sqrt(dx * dx + dy * dy);
      const noise    = Math.sin(col * 0.1 + ctime) * Math.cos(row * 0.1 + ctime * 0.5);
      const proximity = Math.max(0, 1 - dist / 300);

      if (noise > 0.2 || proximity > 0.4) {
        const idx  = Math.floor(((noise + 1) * 0.5) * DENSITY_CHARS.length);
        const char = DENSITY_CHARS[idx % DENSITY_CHARS.length];

        ctx.fillStyle  = proximity > 0.5 ? '#c96b4d' : '#7a8d7d';
        ctx.globalAlpha = 0.2 + proximity * 0.6;
        ctx.fillText(char, px, py);
      }
    }
  }

  ctx.globalAlpha = 1;
  ctime += 0.005;

  if (renderMsEl) {
    renderMsEl.textContent = (performance.now() - t0).toFixed(1);
  }

  requestAnimationFrame(renderAscii);
}

renderAscii();


// ──────────────────────────────────────────────────────────────
//  PAGE TRANSITION  (Page 1 ↔ Page 2)
// ──────────────────────────────────────────────────────────────
const page1 = document.getElementById('page-1');
const page2 = document.getElementById('page-2');

let isPage1     = true;  // which page is logically "active"
let progress    = 0;     // 0 = page1 fully shown, 1 = page2 fully shown
let animFrom    = 0;
let animTo      = 0;
let animStart   = null;  // null means idle

const ANIM_DURATION = 950; // ms

function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function applyProgress(p) {
  // Page 1 slides upward
  page1.style.transform = `translateY(${(-p * 100).toFixed(4)}%)`;

  // Page 2 unblurs and fades in
  const blur    = Math.max(0, 20 * (1 - p));
  const opacity = Math.min(p * 1.6, 1);
  page2.style.filter  = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
  page2.style.opacity = opacity.toFixed(4);
}

function triggerTransition(target) {
  if (animStart !== null) return; // already animating
  if (target === 1 && progress > 0.95) return; // already on page 2
  if (target === 0 && progress < 0.05) return; // already on page 1

  animFrom  = progress;
  animTo    = target;
  animStart = performance.now();
}

function onTransitionComplete(target) {
  progress  = target;
  animStart = null;

  if (target === 1) {
    isPage1 = false;
    page2.style.overflowY = 'auto';
    page2.style.filter    = 'none';
    page2.style.opacity   = '1';
    // Hide scroll hint when leaving page 1
    const hint = document.querySelector('.scroll-hint');
    if (hint) hint.style.opacity = '0';
  } else {
    isPage1 = true;
    page2.style.overflowY = 'hidden';
    page2.scrollTop       = 0;
    const hint = document.querySelector('.scroll-hint');
    if (hint) hint.style.opacity = '';
  }
}

(function animLoop(time) {
  if (animStart !== null) {
    const elapsed = time - animStart;
    const t       = Math.min(elapsed / ANIM_DURATION, 1);
    const eased   = easeInOutQuart(t);

    progress = animFrom + (animTo - animFrom) * eased;
    applyProgress(progress);

    if (t >= 1) {
      onTransitionComplete(animTo);
    }
  }
  requestAnimationFrame(animLoop);
})(0);


// ──────────────────────────────────────────────────────────────
//  SCROLL / WHEEL HANDLING
// ──────────────────────────────────────────────────────────────

// Page 1 → Page 2: any downward wheel on page 1
window.addEventListener('wheel', (e) => {
  if (isPage1 && e.deltaY > 8) {
    e.preventDefault();
    triggerTransition(1);
  }
}, { passive: false });

// Page 2 → Page 1: scroll up when at very top of page 2
page2.addEventListener('wheel', (e) => {
  if (!isPage1 && page2.scrollTop <= 0 && e.deltaY < -8) {
    e.preventDefault();
    triggerTransition(0);
  }
}, { passive: false });

// Touch support
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  const deltaY = touchStartY - e.touches[0].clientY;
  if (isPage1 && deltaY > 40) {
    triggerTransition(1);
  }
}, { passive: true });

page2.addEventListener('touchmove', (e) => {
  const deltaY = touchStartY - e.touches[0].clientY;
  if (!isPage1 && page2.scrollTop <= 0 && deltaY < -40) {
    e.preventDefault();
    triggerTransition(0);
  }
}, { passive: false });

// Clicking logo on page 2 returns to page 1
const projLogoBack = document.getElementById('proj-logo-back');
if (projLogoBack) {
  projLogoBack.addEventListener('click', (e) => {
    if (!isPage1) {
      e.preventDefault();
      triggerTransition(0);
    }
  });
}

// Keyboard support
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navOverlay.classList.contains('active')) {
    navOverlay.classList.remove('active');
    return;
  }
  if ((e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') && isPage1) {
    e.preventDefault();
    triggerTransition(1);
  }
  if ((e.key === 'ArrowUp' || e.key === 'PageUp') && !isPage1 && page2.scrollTop <= 0) {
    e.preventDefault();
    triggerTransition(0);
  }
});


// ──────────────────────────────────────────────────────────────
//  SCROLL HINT — hide after first scroll
// ──────────────────────────────────────────────────────────────
const scrollHint = document.querySelector('.scroll-hint');
if (scrollHint) {
  window.addEventListener('wheel', () => {
    scrollHint.style.transition = 'opacity 0.4s';
    scrollHint.style.opacity = '0';
  }, { once: true });
}
