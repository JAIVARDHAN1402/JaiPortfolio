/* ============================================================
   FX — visual effects engine: particle network, custom cursor,
   ripples, 3D tilt, spotlight hover, parallax, glitch, UI sounds
   ============================================================ */
const FX = (() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  let audio;

  /* ---------------------------------------------------- particles */
  function particles(container, { count = 70, maxDist = 130, color = '255,255,255', speed = 0.25 } = {}) {
    if (reduced) return { destroy() {} };
    const c = document.createElement('canvas'); c.className = 'fx-particles'; container.appendChild(c);
    const ctx = c.getContext('2d'); let w, hgt, raf, nodes = [], mouse = { x: -9999, y: -9999 };
    const resize = () => { w = c.width = container.clientWidth; hgt = c.height = container.clientHeight; };
    resize();
    const n = Math.round(count * Math.min(1, (w * hgt) / (1400 * 850)) + 20);
    for (let i = 0; i < n; i++) nodes.push({ x: Math.random() * w, y: Math.random() * hgt, vx: (Math.random() - .5) * speed, vy: (Math.random() - .5) * speed, r: Math.random() * 1.6 + .6, p: Math.random() * 6.28 });
    const onMove = (e) => { const r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const onLeave = () => { mouse.x = mouse.y = -9999; };
    container.addEventListener('pointermove', onMove); container.addEventListener('pointerleave', onLeave);
    const ro = new ResizeObserver(resize); ro.observe(container);
    let t0 = 0;
    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      if (t - t0 < 16) return; t0 = t;
      ctx.clearRect(0, 0, w, hgt);
      for (const p of nodes) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > hgt) p.vy *= -1;
        const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
        if (d < 180) { p.x -= dx / d * 0.6; p.y -= dy / d * 0.6; }
        const a = 0.35 + 0.35 * Math.sin(t / 900 + p.p);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fillStyle = `rgba(${color},${a})`; ctx.fill();
      }
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < maxDist) { ctx.strokeStyle = `rgba(${color},${(1 - d / maxDist) * 0.22})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      if (mouse.x > 0) for (const p of nodes) { const d = Math.hypot(mouse.x - p.x, mouse.y - p.y); if (d < 200) { ctx.strokeStyle = `rgba(${color},${(1 - d / 200) * 0.35})`; ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(p.x, p.y); ctx.stroke(); } }
    };
    raf = requestAnimationFrame(frame);
    return { destroy() { cancelAnimationFrame(raf); ro.disconnect(); container.removeEventListener('pointermove', onMove); container.removeEventListener('pointerleave', onLeave); c.remove(); } };
  }

  /* ------------------------------------------------------- cursor */
  function cursor() {
    if (!finePointer || reduced || document.querySelector('.fx-cursor')) return;
    const dot = document.createElement('div'); dot.className = 'fx-cursor';
    const ring = document.createElement('div'); ring.className = 'fx-cursor-ring';
    document.body.append(dot, ring); document.body.classList.add('fx-cursor-on');
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf;
    document.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; const t = e.target.closest('a,button,[role=button],.w-icon,.a-icon,.w-titlebar,input,textarea,.w-rs'); ring.classList.toggle('hover', !!t && !t.matches('input,textarea')); ring.classList.toggle('text', !!t && t.matches('input,textarea')); });
    document.addEventListener('pointerdown', () => ring.classList.add('down')); document.addEventListener('pointerup', () => ring.classList.remove('down'));
    document.addEventListener('pointerleave', () => { dot.style.opacity = ring.style.opacity = 0; }); document.addEventListener('pointerenter', () => { dot.style.opacity = ring.style.opacity = 1; });
    const loop = () => { rx += (x - rx) * .18; ry += (y - ry) * .18; ring.style.transform = `translate(${rx}px,${ry}px)`; raf = requestAnimationFrame(loop); }; loop();
  }

  /* ------------------------------------------------------- ripple */
  function ripple(container, selector) {
    container.addEventListener('pointerdown', (e) => {
      const el = e.target.closest(selector); if (!el || reduced) return;
      el.classList.add('fx-rp');
      const r = el.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
      const rp = document.createElement('span'); rp.className = 'fx-ripple';
      rp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
      el.appendChild(rp); setTimeout(() => rp.remove(), 650);
    });
  }

  /* ------------------------------------------------- tilt + spotlight */
  function hoverFX(container, selector) {
    if (!finePointer || reduced) return;
    container.addEventListener('pointermove', (e) => {
      const el = e.target.closest(selector); if (!el) return;
      const r = el.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${px * 100}%`); el.style.setProperty('--my', `${py * 100}%`);
      if (el.classList.contains('tilt') || el.matches('.stat, .ach-card, .w-widget, .project-card')) el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 8}deg) translateY(-2px)`;
    });
    container.addEventListener('pointerout', (e) => { const el = e.target.closest(selector); if (el && !el.contains(e.relatedTarget)) el.style.transform = ''; });
  }

  /* ------------------------------------------------------ parallax */
  function parallax(target, strength = 18) {
    if (reduced) return () => {};
    let tx = 0, ty = 0, cx = 0, cy = 0, raf;
    const onMove = (e) => { tx = (e.clientX / innerWidth - .5) * strength; ty = (e.clientY / innerHeight - .5) * strength; };
    const onTilt = (e) => { if (e.gamma == null) return; tx = Math.max(-1, Math.min(1, e.gamma / 30)) * strength; ty = Math.max(-1, Math.min(1, (e.beta - 40) / 30)) * strength; };
    window.addEventListener('pointermove', onMove); window.addEventListener('deviceorientation', onTilt);
    const loop = () => { cx += (tx - cx) * .06; cy += (ty - cy) * .06; target.style.setProperty('--px', cx + 'px'); target.style.setProperty('--py', cy + 'px'); raf = requestAnimationFrame(loop); }; loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove); window.removeEventListener('deviceorientation', onTilt); };
  }

  /* --------------------------------------------------------- typer */
  function typeLines(el, lines, { speed = 14, lineDelay = 90, done } = {}) {
    let li = 0;
    const next = () => {
      if (li >= lines.length) { done?.(); return; }
      const row = document.createElement('div'); row.className = 'fx-typeline'; el.appendChild(row);
      const text = lines[li++]; let ci = 0;
      const tick = () => { row.textContent = text.slice(0, ++ci); if (ci < text.length) setTimeout(tick, speed); else { row.classList.add('ok'); setTimeout(next, lineDelay); } };
      tick();
    };
    next();
  }

  /* --------------------------------------------------------- sound */
  function ctx() { if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); return audio; }
  function tone(f, dur = .08, type = 'sine', vol = .05, delay = 0) {
    try { const ac = ctx(), o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, ac.currentTime + delay); o.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0, ac.currentTime + delay); g.gain.linearRampToValueAtTime(vol, ac.currentTime + delay + .01); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + delay + dur);
      o.start(ac.currentTime + delay); o.stop(ac.currentTime + delay + dur + .02); } catch (e) { /* no audio */ }
  }
  const sfx = {
    open() { if (!Prefs.get('sound')) return; tone(520, .12, 'sine', .04); tone(780, .14, 'sine', .03, .05); },
    close() { if (!Prefs.get('sound')) return; tone(620, .1, 'sine', .035); tone(380, .14, 'sine', .03, .05); },
    tap() { if (!Prefs.get('sound')) return; tone(900, .05, 'triangle', .02); },
    unlock() { if (!Prefs.get('sound')) return; [440, 660, 880].forEach((f, i) => tone(f, .25, 'sine', .04, i * .07)); },
  };

  return { particles, cursor, ripple, hoverFX, parallax, typeLines, sfx, reduced };
})();

/* ============================================================
   FX v2 — confetti, text split, stagger, flip digits, idle
   ============================================================ */
Object.assign(FX, {
  confetti(container, { count = 140, duration = 2800 } = {}) {
    if (FX.reduced) return;
    const c = document.createElement('canvas'); c.className = 'fx-confetti'; container.appendChild(c);
    const ctx = c.getContext('2d'); const w = c.width = container.clientWidth, h = c.height = container.clientHeight;
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#facc15'];
    const ps = Array.from({ length: count }, () => ({ x: w / 2 + (Math.random() - .5) * 80, y: h * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 3, c: colors[Math.random() * colors.length | 0], a: Math.random() * 6.28, va: (Math.random() - .5) * .3 }));
    const t0 = performance.now();
    const frame = (t) => {
      const k = (t - t0) / duration; ctx.clearRect(0, 0, w, h);
      for (const p of ps) { p.vy += .35; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = Math.max(0, 1 - k * 1.1); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); }
      if (k < 1) requestAnimationFrame(frame); else c.remove();
    };
    requestAnimationFrame(frame);
  },

  splitText(el) {
    if (!el || el.dataset.split || FX.reduced) return;
    el.dataset.split = '1';
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) { const frag = document.createDocumentFragment(); [...n.textContent].forEach((ch) => { const s = document.createElement('span'); s.className = 'fx-ch'; s.textContent = ch === ' ' ? '\u00a0' : ch; frag.appendChild(s); }); n.replaceWith(frag); }
        else if (n.nodeType === 1 && !n.matches('svg, .ico')) walk(n);
      });
    };
    walk(el);
    el.querySelectorAll('.fx-ch').forEach((s, i) => s.style.setProperty('--i', i));
    el.classList.add('fx-split');
  },

  stagger(container, selector, step = 35) {
    if (!container) return;
    container.querySelectorAll(selector).forEach((el, i) => { el.style.setProperty('--i', i); el.style.setProperty('--step', step + 'ms'); el.classList.remove('fx-stagger'); void el.offsetWidth; el.classList.add('fx-stagger'); });
  },

  flipText(el, text) {
    if (!el) return;
    if (el.dataset.txt === text) return;
    const old = el.dataset.txt || '';
    el.dataset.txt = text;
    if (!old || FX.reduced) { el.textContent = text; return; }
    el.innerHTML = [...text].map((ch, i) => `<span class="fx-flip ${old[i] !== ch ? 'go' : ''}">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
  },

  idle(ms, onIdle, onWake) {
    let t, idle = false;
    const reset = () => { if (idle) { idle = false; onWake?.(); } clearTimeout(t); t = setTimeout(() => { idle = true; onIdle(); }, ms); };
    ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((e) => document.addEventListener(e, reset, { passive: true }));
    reset();
    return () => { clearTimeout(t); ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((e) => document.removeEventListener(e, reset)); };
  },
});
