// ════════════════════════════════════════════════════════════════
// André Monteiro — site interactions
// ════════════════════════════════════════════════════════════════
const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
const EMAIL = 'andrefbmonteiro@gmail.com';
const CV_URL = 'assets/Andre_Monteiro_CV.pdf';

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

// ─── Year + keyboard hints ──────────────────────────────────────
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
document.querySelectorAll('[data-kbd]').forEach((el) => { el.textContent = isMac ? '⌘K' : 'Ctrl K'; });

// ─── Theme ──────────────────────────────────────────────────────
const themeBtn = document.querySelector('[data-theme-toggle]');
const themeMeta = document.querySelector('[data-theme-color]');
const flowHooks = [];

const applyTheme = (theme) => {
  root.setAttribute('data-theme', theme);
  const dark = theme === 'dark';
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  if (themeMeta) themeMeta.setAttribute('content', dark ? '#120D1C' : '#FFF5D9');
  flowHooks.forEach((fn) => fn());
};

const currentTheme = () => (root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
const toggleTheme = () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  store.set('theme', next);
};

applyTheme(currentTheme());
themeBtn?.addEventListener('click', toggleTheme);

// ─── Header state + progress ────────────────────────────────────
const header = document.querySelector('[data-header]');
const progress = document.querySelector('[data-progress]');
let scrollTick = false;

const onScroll = () => {
  scrollTick = false;
  const y = window.scrollY;
  header?.classList.toggle('is-scrolled', y > 24);
  if (progress) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
  }
};
window.addEventListener('scroll', () => {
  if (!scrollTick) { scrollTick = true; requestAnimationFrame(onScroll); }
}, { passive: true });
onScroll();

// ─── Active nav link ────────────────────────────────────────────
const navLinks = [...document.querySelectorAll('[data-nav]')];
if (navLinks.length && 'IntersectionObserver' in window) {
  const byId = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  const navIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      navLinks.forEach((a) => a.removeAttribute('aria-current'));
      byId.get(e.target.id)?.setAttribute('aria-current', 'true');
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) navIO.observe(s); });
}

// ─── Scroll reveal ──────────────────────────────────────────────
const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const ro = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        ro.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el) => ro.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// ─── Counters ───────────────────────────────────────────────────
const counters = document.querySelectorAll('[data-counter]');
if (counters.length && !reduced && 'IntersectionObserver' in window) {
  const co = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      const target = parseInt(el.dataset.counter, 10);
      const t0 = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = String(Math.round((1 - (1 - p) ** 4) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      el.textContent = '0';
      requestAnimationFrame(tick);
      co.unobserve(el);
    }
  }, { threshold: 0.6 });
  counters.forEach((el) => co.observe(el));
}

// ─── Hero name: split letters + variable-weight wave ────────────
const letters = [];
document.querySelectorAll('[data-wave]').forEach((line) => {
  [...line.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      for (const ch of node.textContent) {
        if (!ch.trim()) { frag.append(ch); continue; }
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch;
        frag.append(s);
        letters.push(s);
      }
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.classList.add('ch');
      letters.push(node);
    }
  });
});
letters.forEach((s, i) => s.style.setProperty('--i', i));

const hero = document.querySelector('.hero');
if (hero && letters.length && finePointer && !reduced) {
  let mx = -1e4;
  let my = -1e4;
  let raf = 0;
  const update = () => {
    raf = 0;
    for (const s of letters) {
      const r = s.getBoundingClientRect();
      const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
      const k = Math.max(0, 1 - d / 280);
      s.style.fontWeight = String(Math.round(800 - k * 580));
      s.style.transform = k > 0 ? `translateY(${(-k * 0.05).toFixed(3)}em)` : '';
    }
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
  hero.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; queue(); });
  hero.addEventListener('pointerleave', () => { mx = -1e4; my = -1e4; queue(); });
}

// ─── Rotator ────────────────────────────────────────────────────
const rotator = document.querySelector('[data-rotator]');
if (rotator && !reduced) {
  const phrases = [
    'a desktop app for production partners',
    'supplier orders on autopilot',
    'an internal API for files & job tickets',
    'pricing engines with an audit trail',
    'test suites that try to break things',
  ];
  let i = 0;
  setInterval(() => {
    rotator.classList.add('is-out');
    setTimeout(() => {
      i = (i + 1) % phrases.length;
      rotator.textContent = phrases[i];
      rotator.classList.remove('is-out');
    }, 280);
  }, 2800);
}

// ─── Hero flow field (data streams) ─────────────────────────────
const flowCanvas = document.querySelector('[data-flow]');
if (flowCanvas && flowCanvas.getContext) {
  const ctx = flowCanvas.getContext('2d');
  let W = 0;
  let H = 0;
  let lines = [];
  let packets = [];
  let t = 0;
  let raf = 0;
  let visible = true;
  const mouse = { x: -1e4, y: -1e4 };
  let lineRGB = '148, 112, 219';
  let packetRGB = '231, 45, 73';

  const readColors = () => {
    const cs = getComputedStyle(root);
    lineRGB = cs.getPropertyValue('--flow-line').trim() || lineRGB;
    packetRGB = cs.getPropertyValue('--flow-packet').trim() || packetRGB;
  };

  const build = () => {
    const n = W < 700 ? 7 : 11;
    lines = Array.from({ length: n }, (_, i) => ({
      y0: H * (0.3 + (0.68 * (i + 0.5)) / n),
      a: 12 + Math.random() * 30,
      f: 0.0014 + Math.random() * 0.0024,
      p: Math.random() * Math.PI * 2,
      s: 0.22 + Math.random() * 0.36,
      w: i % 3 === 0 ? 2.2 : 1.3,
      alpha: 0.16 + Math.random() * 0.24,
    }));
    packets = [];
    lines.forEach((l, i) => {
      if (i % 2 === 0 || i === n - 1) {
        packets.push({ line: l, x: Math.random() * W, v: 1 + Math.random() * 1.9, c: i % 4 === 0 ? 'line' : 'packet' });
      }
    });
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = flowCanvas.clientWidth;
    H = flowCanvas.clientHeight;
    flowCanvas.width = Math.round(W * dpr);
    flowCanvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    if (reduced) draw();
  };

  const yAt = (l, x) => {
    let y = l.y0 + l.a * Math.sin(x * l.f + t * l.s + l.p) + l.a * 0.45 * Math.sin(x * l.f * 2.3 - t * l.s * 1.3);
    const dx = x - mouse.x;
    const dy = y - mouse.y;
    const d2 = dx * dx + dy * dy;
    const R = 150;
    if (d2 < R * R * 6) {
      const k = Math.exp(-d2 / (2 * R * R));
      y += (dy >= 0 ? 1 : -1) * k * 52;
    }
    return y;
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const l of lines) {
      ctx.beginPath();
      for (let x = -12; x <= W + 12; x += 14) {
        const y = yAt(l, x);
        if (x === -12) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${lineRGB}, ${l.alpha})`;
      ctx.lineWidth = l.w;
      ctx.stroke();
    }
    for (const p of packets) {
      const rgb = p.c === 'packet' ? packetRGB : lineRGB;
      for (let k = 7; k >= 0; k--) {
        const x = p.x - k * 7;
        const y = yAt(p.line, x);
        ctx.beginPath();
        ctx.arc(x, y, k === 0 ? 4.5 : Math.max(0.8, 3.4 - k * 0.38), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${k === 0 ? 0.95 : Math.max(0.05, 0.5 - k * 0.06)})`;
        ctx.fill();
      }
    }
  };

  const frame = () => {
    t += 0.016;
    for (const p of packets) {
      p.x += p.v;
      if (p.x > W + 60) p.x = -40;
    }
    draw();
    raf = visible ? requestAnimationFrame(frame) : 0;
  };

  readColors();
  resize();
  flowHooks.push(() => { readColors(); if (reduced) draw(); });

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(flowCanvas);
  else window.addEventListener('resize', resize);

  if (!reduced) {
    const host = flowCanvas.parentElement;
    host.addEventListener('pointermove', (e) => {
      const r = flowCanvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    host.addEventListener('pointerleave', () => { mouse.x = -1e4; mouse.y = -1e4; });
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    }).observe(host);
  }
}

// ─── Hero terminal replay ───────────────────────────────────────
const agentBody = document.querySelector('[data-agent]');
if (agentBody && !reduced) {
  const lines = [...agentBody.querySelectorAll('.a-line')];
  const typed = lines.map((l) => (l.hasAttribute('data-type') ? l.querySelector('.a-txt') : null));
  const full = typed.map((el) => (el ? el.textContent : ''));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let started = false;

  const play = async () => {
    agentBody.classList.add('is-playing');
    for (;;) {
      lines.forEach((l, i) => {
        l.classList.remove('on', 'typing');
        if (typed[i]) typed[i].textContent = '';
      });
      await wait(500);
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        l.classList.add('on');
        if (typed[i]) {
          l.classList.add('typing');
          for (let c = 1; c <= full[i].length; c++) {
            typed[i].textContent = full[i].slice(0, c);
            await wait(18 + Math.random() * 38);
          }
          await wait(420);
          l.classList.remove('typing');
        } else {
          await wait(l.classList.contains('a-slow') ? 1000 : 360);
        }
      }
      await wait(5600);
    }
  };

  new IntersectionObserver(([e], obs) => {
    if (e.isIntersecting && !started) {
      started = true;
      obs.disconnect();
      play();
    }
  }, { threshold: 0.3 }).observe(agentBody);
}

// ─── Copy email ─────────────────────────────────────────────────
const copyEmail = async (labelEl) => {
  let ok = false;
  try {
    await navigator.clipboard.writeText(EMAIL);
    ok = true;
  } catch { /* clipboard blocked */ }
  if (labelEl) {
    const original = labelEl.dataset.original || labelEl.textContent;
    labelEl.dataset.original = original;
    labelEl.textContent = ok ? 'copied ✓' : 'select & copy';
    setTimeout(() => { labelEl.textContent = original; }, 1800);
  }
  if (ok) toast('Email copied to clipboard');
  return ok;
};

document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', () => copyEmail(btn.querySelector('[data-copy-label]')));
});

// tiny toast
let toastEl;
function toast(msg) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.setAttribute('role', 'status');
    toastEl.style.cssText = [
      'position:fixed', 'left:50%', 'bottom:24px', 'z-index:95', 'transform:translateX(-50%) translateY(20px)',
      'padding:10px 18px', 'border:2px solid var(--line)', 'border-radius:999px', 'background:var(--surface)',
      'color:var(--text)', 'font:600 0.92rem var(--f-sans)', 'box-shadow:4px 4px 0 var(--cherry)',
      'opacity:0', 'transition:opacity .2s ease, transform .25s cubic-bezier(.2,.85,.2,1)', 'pointer-events:none',
    ].join(';');
    document.body.append(toastEl);
  }
  toastEl.textContent = msg;
  requestAnimationFrame(() => {
    toastEl.style.opacity = '1';
    toastEl.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2000);
}

// ─── Data rain (easter egg) ─────────────────────────────────────
function rain() {
  if (reduced) { toast('Rain skipped: reduced motion is on'); return; }
  const glyphs = ['SELECT *', '{ }', '✓ 200 OK', 'JOIN', '→ S3', 'NULL', 'async', '✺', 'pytest ✓', 'UPSERT', '[ ]', 'ETL', '∑'];
  const layer = document.createElement('div');
  layer.className = 'rain';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 54; i++) {
    const s = document.createElement('span');
    s.textContent = glyphs[i % glyphs.length];
    s.dataset.c = ['v', 'c', 'i'][i % 3];
    s.style.left = `${Math.random() * 96}vw`;
    s.style.animationDelay = `${Math.random() * 1.6}s`;
    s.style.animationDuration = `${2.2 + Math.random() * 2}s`;
    s.style.setProperty('--r', `${Math.random() * 120 - 60}deg`);
    layer.append(s);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 6000);
}

// ─── Command palette ────────────────────────────────────────────
const palette = document.querySelector('[data-palette]');
const pInput = document.querySelector('[data-palette-input]');
const pList = document.querySelector('[data-palette-list]');

const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
const openUrl = (url) => window.open(url, '_blank', 'noopener');

const actions = [
  { label: 'Work — shipped in 2026', icon: '◆', hint: 'section', keys: 'projects portfolio', run: () => goTo('work') },
  { label: 'How I work', icon: '✦', hint: 'section', keys: 'approach process spec', run: () => goTo('approach') },
  { label: 'Experience', icon: '⎇', hint: 'section', keys: 'career git log jobs', run: () => goTo('experience') },
  { label: 'Stack', icon: '≡', hint: 'section', keys: 'skills tools', run: () => goTo('stack') },
  { label: 'Contact', icon: '@', hint: 'section', keys: 'hire talk', run: () => goTo('contact') },
  { label: 'Copy email address', icon: '⧉', hint: EMAIL, keys: 'mail clipboard', run: () => copyEmail() },
  { label: 'Download CV', icon: '↓', hint: 'pdf', keys: 'resume curriculum', run: () => openUrl(CV_URL) },
  { label: 'Toggle dark mode', icon: '◐', hint: 'theme', keys: 'light dark theme', run: toggleTheme },
  { label: 'Open GitHub', icon: '↗', hint: 'AndreFBM', keys: 'code repos', run: () => openUrl('https://github.com/AndreFBM') },
  { label: 'Open LinkedIn', icon: '↗', hint: 'andrefbmonteiro', keys: 'profile', run: () => openUrl('https://www.linkedin.com/in/andrefbmonteiro') },
  { label: 'Make it rain data', icon: '✺', hint: 'surprise', keys: 'rain fun easter egg party', run: rain },
  { label: 'Back to top', icon: '↑', hint: 'top', keys: 'home start', run: () => goTo('top') },
];

let filtered = actions;
let active = 0;

const renderPalette = () => {
  const q = pInput.value.trim().toLowerCase();
  filtered = q
    ? actions.filter((a) => `${a.label} ${a.keys} ${a.hint}`.toLowerCase().includes(q))
    : actions;
  active = Math.min(active, Math.max(filtered.length - 1, 0));
  pList.innerHTML = '';
  if (!filtered.length) {
    const li = document.createElement('li');
    li.className = 'palette-empty';
    li.textContent = `0 rows affected — nothing matches “${q}”.`;
    pList.append(li);
    pInput.removeAttribute('aria-activedescendant');
    return;
  }
  filtered.forEach((a, i) => {
    const li = document.createElement('li');
    li.className = 'palette-item';
    li.id = `pi-${i}`;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(i === active));
    const icon = document.createElement('span');
    icon.className = 'pi-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = a.icon;
    const label = document.createElement('span');
    label.textContent = a.label;
    const hint = document.createElement('span');
    hint.className = 'pi-hint';
    hint.textContent = a.hint;
    li.append(icon, label, hint);
    li.addEventListener('pointermove', () => { if (active !== i) { active = i; syncActive(); } });
    li.addEventListener('click', () => runAction(i));
    pList.append(li);
  });
  syncActive();
};

const syncActive = () => {
  [...pList.children].forEach((li, i) => li.setAttribute && li.setAttribute('aria-selected', String(i === active)));
  const el = document.getElementById(`pi-${active}`);
  if (el) {
    pInput.setAttribute('aria-activedescendant', el.id);
    el.scrollIntoView({ block: 'nearest' });
  }
};

const openPalette = () => {
  if (!palette || palette.open) return;
  pInput.value = '';
  active = 0;
  renderPalette();
  if (typeof palette.showModal === 'function') palette.showModal();
  else palette.setAttribute('open', '');
  pInput.focus();
};

const closePalette = () => {
  if (!palette?.open) return;
  if (typeof palette.close === 'function') palette.close();
  else palette.removeAttribute('open');
};

const runAction = (i) => {
  const a = filtered[i];
  if (!a) return;
  closePalette();
  setTimeout(a.run, 60);
};

if (palette && pInput && pList) {
  document.querySelectorAll('[data-palette-open]').forEach((b) => b.addEventListener('click', openPalette));
  pInput.addEventListener('input', () => { active = 0; renderPalette(); });
  pInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(filtered.length, 1); syncActive(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + filtered.length) % Math.max(filtered.length, 1); syncActive(); }
    else if (e.key === 'Enter') { e.preventDefault(); runAction(active); }
  });
  palette.addEventListener('click', (e) => { if (e.target === palette) closePalette(); });

  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '') || document.activeElement?.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (palette.open) closePalette(); else openPalette();
    } else if (e.key === '/' && !typing && !palette.open) {
      e.preventDefault();
      openPalette();
    }
  });
}

// ─── Hello, console ─────────────────────────────────────────────
console.log(
  '%c am. %c Hey, fellow engineer 👋',
  'background:#9470DB;color:#1A1424;font:800 14px system-ui;padding:4px 8px;border-radius:6px',
  'color:#E72D49;font:700 14px system-ui',
);
console.log(`Press ${isMac ? '⌘K' : 'Ctrl+K'} and type "rain". Or skip straight to ${EMAIL}`);
