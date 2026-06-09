// ─── Header + year ──────────────────────────────────────────────
const header = document.querySelector('[data-header]');
const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();

const syncHeader = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
};
syncHeader();

// ─── Progress bar ───────────────────────────────────────────────
const progressBar = document.querySelector('[data-progress]');

const onScroll = () => {
  syncHeader();
  if (progressBar) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = max ? `${(window.scrollY / max) * 100}%` : '0%';
  }
};
window.addEventListener('scroll', onScroll, { passive: true });

// ─── Copy email ─────────────────────────────────────────────────
const copyButton = document.querySelector('[data-copy]');
const copyLabel = document.querySelector('[data-copy-label]');
if (copyButton && copyLabel) {
  copyButton.addEventListener('click', async () => {
    const value = copyButton.getAttribute('data-copy');
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      copyLabel.textContent = 'Copied';
      setTimeout(() => { copyLabel.textContent = 'Copy email'; }, 1600);
    } catch {
      copyLabel.textContent = value;
    }
  });
}

// ─── Dark mode ──────────────────────────────────────────────────
const darkToggle = document.querySelector('[data-dark-toggle]');

const applyTheme = (dark) => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  if (darkToggle) {
    darkToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    darkToggle.setAttribute('aria-pressed', String(dark));
  }
};

const saved = localStorage.getItem('theme');
applyTheme(saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);

if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  });
}

// ─── Scroll reveal ──────────────────────────────────────────────
const revealEls = document.querySelectorAll('[data-reveal]');
if (revealEls.length) {
  const ro = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        ro.unobserve(e.target);
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });
  revealEls.forEach(el => ro.observe(el));
}

// ─── Animated counters ──────────────────────────────────────────
const counterEls = document.querySelectorAll('[data-counter]');
if (counterEls.length) {
  const co = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      const target = parseInt(el.dataset.counter, 10);
      const suffix = el.dataset.counterSuffix ?? '';
      const dur = 1200;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const v = 1 - (1 - p) ** 3;
        el.textContent = Math.floor(v * target) + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      co.unobserve(el);
    }
  }, { threshold: 0.6 });
  counterEls.forEach(el => co.observe(el));
}

// ─── Terminal line reveal ───────────────────────────────────────
const terminal = document.querySelector('[data-terminal]');
if (terminal) {
  const lines = terminal.querySelectorAll('.line');
  const to = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    lines.forEach((line, i) => {
      setTimeout(() => line.classList.add('is-visible'), 100 + i * 150);
    });
    to.disconnect();
  }, { threshold: 0.4 });
  to.observe(terminal);
}

// ─── Hero canvas (data-flow network) ───────────────────────────
const canvas = document.querySelector('[data-hero-canvas]');
if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const ctx = canvas.getContext('2d');
  const N = 36;
  const MAX = 130;
  let W, H, nodes, raf;

  const resize = () => {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };

  const makeNode = () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
    r: Math.random() * 1.6 + 0.6,
  });

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const n of nodes) {
      n.x = (n.x + n.vx + W) % W;
      n.y = (n.y + n.vy + H) % H;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.hypot(dx, dy);
        if (d < MAX) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(159,187,91,${(1 - d / MAX) * 0.22})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(159,187,91,0.5)';
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };

  const start = () => { if (!raf) raf = requestAnimationFrame(draw); };
  const stop  = () => { cancelAnimationFrame(raf); raf = null; };

  resize();
  nodes = Array.from({ length: N }, makeNode);
  start();

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop()).observe(canvas.parentElement);
}
