(function() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;

  // Garante 2 cópias no HTML (já existem), duplica mais se necessário depois de medir
  let pos = 0;
  let speed = 0.5; // px por frame
  let singleW = 0; // largura de UMA cópia do conteúdo

  function setup() {
    const items = Array.from(track.children);
    if (!items.length) return;

    // Mede largura de uma cópia (metade do track original com 2 items)
    singleW = items.reduce((s, el) => s + el.offsetWidth, 0) / 2;

    // Clona até ter ao menos 6 cópias para não ver o fim
    while (track.scrollWidth < window.innerWidth * 5) {
      items.slice(0, items.length / 2).forEach(el => {
        track.appendChild(el.cloneNode(true));
      });
    }

    // Recalcula singleW com todo o conteúdo / número de cópias
    const totalItems = Array.from(track.children).length;
    singleW = track.scrollWidth / totalItems * (totalItems / 2);

    tick();
  }

  function tick() {
    pos -= speed;
    if (Math.abs(pos) >= singleW) pos = 0; // loop sem pulo
    track.style.transform = `translateX(${pos}px)`;
    requestAnimationFrame(tick);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setup);
  } else {
    window.addEventListener('load', setup);
  }
})();

/* ─── SCROLL HINT — some ao rolar ─── */
(function() {
  const hint = document.getElementById('scrollHint');
  if (!hint) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 60) {
      hint.classList.add('hidden');
    } else {
      hint.classList.remove('hidden');
    }
  }, { passive: true });
})();

/* ─── CURSOR ─── */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx = -100, my = -100, rx = -100, ry = -100;

window.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
});

function animCursor() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursor.style.left     = mx + 'px';
  cursor.style.top      = my + 'px';
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top  = ry + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();

/* ─── NAVBAR SCROLL ─── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ─── MOBILE MENU ─── */
const hamburger     = document.getElementById('hamburger');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileClose   = document.getElementById('mobileClose');

function openMenu() {
  mobileOverlay.classList.add('open');
  hamburger.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileOverlay.classList.remove('open');
  hamburger.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', openMenu);
mobileClose.addEventListener('click', closeMenu);
mobileOverlay.querySelectorAll('a[href]').forEach(a => {
  a.addEventListener('click', closeMenu);
});

/* ─── GRID CANVAS ─── */
(function () {
  const canvas = document.getElementById('grid-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  const CELL    = 60;
  const NODES   = [];
  const PACKETS = [];

  function resize() {
    const hero = canvas.parentElement;
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
    buildNodes();
  }

  function buildNodes() {
    NODES.length = 0;
    const cols = Math.ceil(W / CELL) + 1;
    const rows = Math.ceil(H / CELL) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        NODES.push({ x: c * CELL, y: r * CELL, glow: Math.random() < 0.04 ? Math.random() : 0 });
      }
    }
    // Spawn data packets
    if (PACKETS.length === 0) {
      for (let i = 0; i < 4; i++) spawnPacket();
    }
  }

  function spawnPacket() {
    const horiz = Math.random() > 0.5;
    const row   = Math.floor(Math.random() * (H / CELL)) * CELL;
    const col   = Math.floor(Math.random() * (W / CELL)) * CELL;
    PACKETS.push({
      x: horiz ? 0 : col,
      y: horiz ? row : 0,
      dx: horiz ? 0.25 + Math.random() * 0.25 : 0,
      dy: horiz ? 0 : 0.25 + Math.random() * 0.25,
      alpha: 0.5 + Math.random() * 0.3,
      size: 1.5 + Math.random() * 1.5,
    });
  }

  let animating = true;

  function draw() {
    if (!animating) return;
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    const cols = Math.ceil(W / CELL) + 1;
    const rows = Math.ceil(H / CELL) + 1;

    ctx.strokeStyle = 'rgba(0,255,136,0.04)';
    ctx.lineWidth = 1;
    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL, 0);
      ctx.lineTo(c * CELL, H);
      ctx.stroke();
    }
    for (let r = 0; r < rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL);
      ctx.lineTo(W, r * CELL);
      ctx.stroke();
    }

    // Nodes
    NODES.forEach(n => {
      if (n.glow > 0) {
        n.glow -= 0.001;
        if (n.glow < 0) n.glow = 0;
      } else if (Math.random() < 0.00005) {
        n.glow = 0.9;
      }
      const a = 0.08 + n.glow * 0.7;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.glow > 0.1 ? 2.5 : 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,136,${a})`;
      ctx.fill();
      if (n.glow > 0.2) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 16);
        g.addColorStop(0, `rgba(0,255,136,${n.glow * 0.2})`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(n.x, n.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
    });

    // Packets
    for (let i = PACKETS.length - 1; i >= 0; i--) {
      const p = PACKETS[i];
      p.x += p.dx;
      p.y += p.dy;

      // Trail
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,136,${p.alpha})`;
      ctx.fill();

      // Glow
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
      g.addColorStop(0, `rgba(0,255,136,${p.alpha * 0.3})`);
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      if (p.x > W + 20 || p.y > H + 20) {
        PACKETS.splice(i, 1);
        spawnPacket();
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Pausar animação quando aba não está visível (economia de bateria/CPU)
  document.addEventListener('visibilitychange', () => {
    animating = !document.hidden;
    if (animating) draw();
  });

  draw();
})();

/* ─── SCROLL REVEAL ─── */
const revealEls = document.querySelectorAll('.reveal, .reveal-left');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObs.observe(el));

/* ─── COUNTER ANIMATION ─── */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function animateCounter(el) {
  if (el.dataset.static) return; // already set
  const target   = parseInt(el.dataset.target, 10);
  const prefix   = el.dataset.prefix  || '';
  const suffix   = el.dataset.suffix  || '';
  const override = el.dataset.labelOverride;
  const dur      = 1800;
  const start    = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const v = Math.round(easeOutCubic(t) * target);
    el.textContent = override && t >= 1 ? override : (prefix + v.toLocaleString('pt-BR') + suffix);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

let countersStarted = false;
const impactSection = document.getElementById('impact');
new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    document.querySelectorAll('.impact-number[data-target]').forEach(animateCounter);
  }
}, { threshold: 0.25 }).observe(impactSection);

/* ─── CTA CANVAS — scan lines minimalistas ─── */
(function() {
  const canvas = document.getElementById('cta-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, offset = 0;

  function resize() {
    const sec = canvas.parentElement;
    W = canvas.width  = sec.offsetWidth;
    H = canvas.height = sec.offsetHeight;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Glow central — único, suave
    const g = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.min(W,H) * .55);
    g.addColorStop(0,   'rgba(0,255,136,0.07)');
    g.addColorStop(.5,  'rgba(0,176,203,0.03)');
    g.addColorStop(1,   'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Linhas horizontais finas que deslizam para baixo — idêntico ao estilo hero
    const STEP = 80;
    ctx.strokeStyle = 'rgba(0,255,136,0.04)';
    ctx.lineWidth   = 1;
    for (let y = (offset % STEP) - STEP; y < H + STEP; y += STEP) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // 1 linha brilhante que percorre a seção
    const bright = (offset % H);
    const grad = ctx.createLinearGradient(0, bright - 40, 0, bright + 40);
    grad.addColorStop(0,   'transparent');
    grad.addColorStop(.5,  'rgba(0,255,136,0.12)');
    grad.addColorStop(1,   'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, bright - 40, W, 80);

    offset += .4;
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  draw();
})();

/* ─── SMOOTH SCROLL ─── */
function smoothScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const diff   = targetY - startY;
  let start    = null;

  // easeInOutCubic — aceleração suave na entrada e saída
  function ease(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(timestamp) {
    if (!start) start = timestamp;
    const elapsed  = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.scrollY;
      smoothScrollTo(offsetTop, 900); // 900ms — ajuste à vontade
    }
  });
});
/* ─── TYPEWRITER ─── */
(function () {
  // Cada entrada é a palavra + "..." já embutidos como uma string contínua
  const words      = ['manual...', 'ultrapassada...', 'limitada...', 'comum...'];
  const el         = document.getElementById('typewriter-word');
  if (!el) return;

  const SPEED_TYPE   = 85;  // ms por caractere ao escrever
  const SPEED_DELETE = 45;  // ms por caractere ao apagar
  const PAUSE_END    = 900; // pausa quando termina de escrever tudo
  const PAUSE_NEXT   = 220; // pausa antes de começar próxima palavra

  let wordIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const full = words[wordIdx];

    if (!deleting) {
      charIdx++;
      el.textContent = full.slice(0, charIdx);

      if (charIdx === full.length) {
        // terminou de escrever — pausa e começa a apagar
        setTimeout(() => { deleting = true; tick(); }, PAUSE_END);
        return;
      }
      setTimeout(tick, SPEED_TYPE);

    } else {
      charIdx--;
      el.textContent = full.slice(0, charIdx);

      if (charIdx === 0) {
        // terminou de apagar — próxima palavra
        deleting = false;
        wordIdx  = (wordIdx + 1) % words.length;
        setTimeout(tick, PAUSE_NEXT);
        return;
      }
      setTimeout(tick, SPEED_DELETE);
    }
  }

  setTimeout(tick, 900);
})();


/* ─── SHATTER EFFECT — canvas particles ─── */
(function () {
  const wordEl = document.getElementById('shatter-word');
  if (!wordEl) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const EXPLODE_T = 1200;
  const IMPLODE_T = 1000;
  const GLOW_T    = 500;
  const LOOP_GAP  = 1200;
  const NUM_PARTS = 280;
  const MAX_DIST  = 55;

  let particles = [];
  let animId    = null;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function getWordPixels() {
    const r   = wordEl.getBoundingClientRect();
    const tmp = document.createElement('canvas');
    const cs  = window.getComputedStyle(wordEl);
    tmp.width  = Math.ceil(r.width) + 4;
    tmp.height = Math.ceil(r.height) + 4;
    const tc  = tmp.getContext('2d');
    tc.font        = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    tc.strokeStyle = '#00ff88';
    tc.lineWidth   = 1.5;
    tc.strokeText(wordEl.textContent, 2, Math.ceil(r.height) * 0.82);
    const data = tc.getImageData(0, 0, tmp.width, tmp.height).data;
    const pts  = [];
    // Guarda coordenadas relativas ao DOCUMENTO (scroll-safe)
    const ox = r.left + window.scrollX;
    const oy = r.top  + window.scrollY;
    for (let y = 0; y < tmp.height; y += 2)
      for (let x = 0; x < tmp.width; x += 2)
        if (data[(y * tmp.width + x) * 4 + 3] > 60)
          pts.push({ x: ox + x, y: oy + y });
    return pts;
  }

  // Converte coordenada de documento para viewport atual
  function docToVP(x, y) {
    return { x: x - window.scrollX, y: y - window.scrollY };
  }

  function spawnParticles() {
    resizeCanvas();
    const pts = getWordPixels();
    particles = [];
    for (let i = 0; i < NUM_PARTS; i++) {
      const pt    = pts[Math.floor(Math.random() * pts.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist  = Math.random() * MAX_DIST + 10; // deslocamento fixo: 10–65px
      const size  = Math.random() * Math.random() * 4 + 0.5;
      particles.push({
        ox: pt.x, oy: pt.y,         // origem
        dx: Math.cos(angle) * dist,  // deslocamento alvo
        dy: Math.sin(angle) * dist,
        x: pt.x, y: pt.y,           // posição atual
        rot: 0,
        drot: (Math.random() - 0.5) * Math.PI * 1.5,
        size,
        shape: Math.floor(Math.random() * 3),
        w: Math.random() * 7 + 1,
        h: Math.random() * 3 + 0.5,
        color: Math.random() > 0.3 ? '#00ff88' : (Math.random() > 0.5 ? '#00bda4' : '#00b0cb'),
      });
    }
  }

  function drawParticle(p, alpha, glow) {
    const vp = docToVP(p.x, p.y);
    ctx.save();
    ctx.translate(vp.x, vp.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = p.color;
    ctx.strokeStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = glow || 4;
    if (p.shape === 0) {
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s); ctx.lineTo(s*.866, s*.5); ctx.lineTo(-s*.866, s*.5);
      ctx.closePath(); ctx.fill();
    } else if (p.shape === 1) {
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
    } else {
      ctx.lineWidth = Math.max(0.5, p.size * 0.4);
      ctx.beginPath(); ctx.moveTo(-p.w/2, 0); ctx.lineTo(p.w/2, 0); ctx.stroke();
    }
    ctx.restore();
  }

  function easeOut(t)   { return 1 - Math.pow(1-t, 2.5); }
  function easeInOut(t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t; }

  // FASE 1 — explode com deslocamento fixo
  function phaseExplode(onDone) {
    let t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / EXPLODE_T, 1);
      const e = easeOut(p);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(pt => {
        pt.x   = pt.ox + pt.dx * e;
        pt.y   = pt.oy + pt.dy * e;
        pt.rot = pt.drot * e;
        drawParticle(pt, 0.9, 4);
      });
      if (p < 1) animId = requestAnimationFrame(frame);
      else onDone();
    }
    animId = requestAnimationFrame(frame);
  }

  // FASE 2 — hold espalhado
  function phaseHold(onDone) {
    let t0 = null;
    (function frame(ts) {
      if (!t0) t0 = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(pt => drawParticle(pt, 0.9, 4));
      if (ts - t0 < HOLD_T) animId = requestAnimationFrame(frame);
      else onDone();
    })(performance.now());
  }

  // FASE 3 — implode: volta à origem formando a palavra
  function phaseImplode(onDone) {
    let t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / IMPLODE_T, 1);
      const e = easeInOut(p);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // A partir de 75% do implode, a palavra HTML já aparece junto
      if (p >= 0.75 && wordEl.style.opacity < '1') {
        wordEl.style.transition = 'none';
        wordEl.style.opacity    = '1';
      }

      particles.forEach(pt => {
        pt.x   = pt.ox + pt.dx * (1 - e);
        pt.y   = pt.oy + pt.dy * (1 - e);
        pt.rot = pt.drot * (1 - e);
        // fragmentos somem suavemente nos últimos 25%
        const alpha = p > 0.75 ? 0.9 * (1 - (p - 0.75) / 0.25) : 0.9;
        drawParticle(pt, alpha, 4);
      });

      if (p < 1) animId = requestAnimationFrame(frame);
      else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDone();
      }
    }
    animId = requestAnimationFrame(frame);
  }

  // FASE 4 — brilho final no HTML (stroke pulse)
  function phaseGlow(onDone) {
    wordEl.style.transition = 'filter 0.25s ease';
    wordEl.style.filter     = 'drop-shadow(0 0 18px #00ff88)';
    setTimeout(() => {
      wordEl.style.filter     = 'drop-shadow(0 0 8px rgba(0,255,136,0.5))';
      setTimeout(() => {
        wordEl.style.transition = '';
        onDone();
      }, 300);
    }, 250);
  }

  function runLoop() {
    wordEl.style.transition = '';
    wordEl.style.opacity    = '0';
    if (animId) cancelAnimationFrame(animId);

    setTimeout(() => {
      spawnParticles();
      phaseExplode(() =>
        phaseImplode(() =>
          phaseGlow(() =>
            setTimeout(runLoop, LOOP_GAP)
          )
        )
      );
    }, 40);
  }

  setTimeout(runLoop, 1800);
})();
(function () {
  const el = document.getElementById('exec-count');
  if (!el) return;

  let current = 847;

  function flicker() {
    // Variação aleatória: +1 a +4 na maioria, raro -1
    const delta = Math.random() < 0.12
      ? -Math.floor(Math.random() * 2 + 1)        // 12% chance: cai 1-2
      : Math.floor(Math.random() * 4 + 1);         // 88% chance: sobe 1-4

    current = Math.max(800, current + delta);

    // Animação de flip rápida
    el.style.transition = 'opacity 0.08s ease, transform 0.08s ease';
    el.style.opacity    = '0.3';
    el.style.transform  = 'translateY(-3px)';

    setTimeout(() => {
      el.textContent      = current.toLocaleString('pt-BR');
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    }, 90);

    // Intervalo variável: 400ms a 1800ms — parece orgânico
    setTimeout(flicker, 400 + Math.random() * 1400);
  }

  setTimeout(flicker, 1200);
})();
(function () {
  const SKETCH_DUR  = 4500;  // ms desenhando apenas as linhas
  const PAUSE_MS    = 300;   // pausa após sketch antes de pintar
  const FILL_DUR    = 1400;  // ms do fill entrando suavemente
  const HOLD_DUR    = 3000;  // ms exibindo logo completa
  const FADE_DUR    = 700;   // ms apagando tudo
  const LOOP_GAP    = 500;   // ms antes de reiniciar

  const strokeEl = document.getElementById('logo-stroke');
  const fillEl   = document.getElementById('logo-fill');
  if (!strokeEl || !fillEl) return;

  function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
  function easeOut(t)   { return 1 - Math.pow(1-t, 2.8); }

  /* ── 1. Sketch: desenha só as linhas ── */
  function doSketch(cb) {
    let len;
    try { len = strokeEl.getTotalLength(); } catch(e) { len = 80000; }

    strokeEl.style.transition       = 'none';
    strokeEl.style.opacity          = '1';
    strokeEl.style.strokeDasharray  = len;
    strokeEl.style.strokeDashoffset = len;
    fillEl.style.transition         = 'none';
    fillEl.style.opacity            = '0';

    let t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / SKETCH_DUR, 1);
      strokeEl.style.strokeDashoffset = len * (1 - easeInOut(p));
      if (p < 1) requestAnimationFrame(frame);
      else cb();
    }
    requestAnimationFrame(frame);
  }

  /* ── 2. Fill: tinta preenchendo por dentro, stroke some junto ── */
  function doFill(cb) {
    let t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / FILL_DUR, 1);
      const e = easeOut(p);

      // fill entra suavemente
      fillEl.style.opacity = e;

      // stroke some ao mesmo tempo que o fill aparece
      strokeEl.style.opacity = 1 - e;

      if (p < 1) requestAnimationFrame(frame);
      else {
        fillEl.style.opacity   = '1';
        strokeEl.style.opacity = '0';
        cb();
      }
    }
    requestAnimationFrame(frame);
  }

  /* ── 3. Fade-out de tudo ── */
  function doFadeOut(cb) {
    fillEl.style.transition   = `opacity ${FADE_DUR}ms ease`;
    strokeEl.style.transition = `opacity ${FADE_DUR}ms ease`;
    fillEl.style.opacity      = '0';
    strokeEl.style.opacity    = '0';
    setTimeout(() => {
      fillEl.style.transition   = 'none';
      strokeEl.style.transition = 'none';
      cb();
    }, FADE_DUR + 60);
  }

  /* ── Loop ── */
  function run() {
    doSketch(() => {
      setTimeout(() => {
        doFill(() => {
          setTimeout(() => {
            doFadeOut(() => {
              setTimeout(run, LOOP_GAP);
            });
          }, HOLD_DUR);
        });
      }, PAUSE_MS);
    });
  }

  setTimeout(run, 500);
})();



/* ═══════════════════════════════════════════════
   PROTEÇÃO DE CONTEÚDO
═══════════════════════════════════════════════ */
(function() {

  // Bloquear clique direito
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // Bloquear atalhos de teclado
  document.addEventListener('keydown', function(e) {
    const key = e.key.toLowerCase();

    // Ctrl+U (view-source), Ctrl+S (salvar), Ctrl+A (selecionar tudo)
    // Ctrl+C (copiar), Ctrl+X (recortar), Ctrl+P (imprimir)
    // F12 (DevTools), Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
    if (e.ctrlKey && ['u','s','a','c','x','p'].includes(key)) {
      e.preventDefault();
      return false;
    }
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(key)) {
      e.preventDefault();
      return false;
    }
  });

  // Bloquear arrastar elementos
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
  });

  // Bloquear seleção via toque (mobile)
  document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
  });

})();
