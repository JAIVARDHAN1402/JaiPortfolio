/* ============================================================
   LIVE WALLPAPER ENGINE — animated scenes rendered on canvas,
   shared by both shells. Scenes: bloom, aurora, nebula, grid,
   waves, matrix. Adds a real-time time-of-day tint.
   ============================================================ */
const Wallpaper = (() => {
  let canvas, ctx, raf, preset, w = 0, h = 0, last = 0, S = {};
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hex = (c, a) => c + Math.round(a * 255).toString(16).padStart(2, '0');

  /* ----------------------------------------------------------- scenes */
  const SCENES = {
    /* soft moving color blobs (Windows-like bloom) */
    bloom: {
      blur: 40, scale: .5, fps: 30,
      init() { S.blobs = preset.colors.map((c, i) => ({ c, x: rand(.15, .85), y: rand(.15, .85), r: rand(.35, .55), a: rand(0, 6.28), sp: rand(.08, .16), p: i * 1.3 })); S.rot = 0; },
      draw(t, dt) {
        ctx.fillStyle = preset.base; ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        S.rot += dt * .04;
        for (const b of S.blobs) {
          b.a += dt * b.sp;
          const x = (b.x + Math.cos(b.a) * .14 + Math.cos(S.rot + b.p) * .05) * w, y = (b.y + Math.sin(b.a * .8) * .14 + Math.sin(S.rot + b.p) * .05) * h;
          const R = b.r * Math.max(w, h) * (1 + .1 * Math.sin(t / 2200 + b.p));
          const g = ctx.createRadialGradient(x, y, 0, x, y, R);
          g.addColorStop(0, hex(b.c, .85)); g.addColorStop(.5, hex(b.c, .35)); g.addColorStop(1, hex(b.c, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 6.28); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      },
    },

    /* northern lights ribbons + twinkling stars */
    aurora: {
      blur: 12, scale: .5, fps: 30,
      init() {
        S.stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random() * .7, r: rand(.4, 1.4), p: rand(0, 6.28), s: rand(1, 3) }));
        S.ribbons = preset.colors.map((c, i) => ({ c, y: .25 + i * .12, amp: rand(.05, .1), k: rand(1.5, 3), sp: rand(.25, .5), ph: rand(0, 6.28), hgt: rand(.25, .4) }));
      },
      draw(t) {
        const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#020713'); g.addColorStop(1, preset.base); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        for (const s of S.stars) { const a = .4 + .6 * Math.abs(Math.sin(t / 700 * s.s + s.p)); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(s.x * w, s.y * h, s.r, s.r); }
        ctx.globalCompositeOperation = 'lighter';
        for (const r of S.ribbons) {
          const steps = 40; ctx.beginPath();
          for (let i = 0; i <= steps; i++) { const x = i / steps; const y = r.y + Math.sin(x * r.k * 6.28 + t / 1000 * r.sp + r.ph) * r.amp + Math.sin(x * 9 - t / 1400) * .02; i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h); }
          for (let i = steps; i >= 0; i--) { const x = i / steps; const y = r.y + Math.sin(x * r.k * 6.28 + t / 1000 * r.sp + r.ph) * r.amp + Math.sin(x * 9 - t / 1400) * .02 + r.hgt; ctx.lineTo(x * w, y * h); }
          ctx.closePath();
          const lg = ctx.createLinearGradient(0, r.y * h, 0, (r.y + r.hgt) * h); lg.addColorStop(0, hex(r.c, .55)); lg.addColorStop(.5, hex(r.c, .18)); lg.addColorStop(1, hex(r.c, 0));
          ctx.fillStyle = lg; ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        const gg = ctx.createLinearGradient(0, h * .7, 0, h); gg.addColorStop(0, 'rgba(0,0,0,0)'); gg.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = gg; ctx.fillRect(0, 0, w, h);
      },
    },

    /* deep space: star field, drifting nebula, shooting stars */
    nebula: {
      blur: 0, scale: 1, fps: 60,
      init() {
        S.stars = Array.from({ length: 320 }, () => ({ x: Math.random(), y: Math.random(), z: rand(.2, 1), p: rand(0, 6.28), s: rand(.5, 2.5) }));
        S.clouds = preset.colors.map((c, i) => ({ c, x: rand(.2, .8), y: rand(.2, .8), r: rand(.3, .5), a: rand(0, 6.28), sp: rand(.03, .06), p: i }));
        S.shots = []; S.next = 1500;
      },
      draw(t, dt) {
        ctx.fillStyle = preset.base; ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        for (const c of S.clouds) {
          c.a += dt * c.sp; const x = (c.x + Math.cos(c.a) * .08) * w, y = (c.y + Math.sin(c.a) * .08) * h, R = c.r * Math.max(w, h);
          const g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, hex(c.c, .28)); g.addColorStop(.6, hex(c.c, .08)); g.addColorStop(1, hex(c.c, 0));
          ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        }
        ctx.globalCompositeOperation = 'source-over';
        for (const s of S.stars) {
          s.x += dt * .004 * s.z; if (s.x > 1) s.x = 0;
          const a = .3 + .7 * Math.abs(Math.sin(t / 600 * s.s + s.p)); const r = s.z * 1.6;
          ctx.fillStyle = `rgba(255,255,255,${a * s.z})`; ctx.beginPath(); ctx.arc(s.x * w, s.y * h, r, 0, 6.28); ctx.fill();
        }
        S.next -= dt * 1000;
        if (S.next < 0) { S.next = rand(1800, 5000); S.shots.push({ x: rand(.1, .9), y: rand(0, .4), vx: rand(.6, 1.1), vy: rand(.25, .45), life: 1 }); }
        for (const sh of S.shots) {
          sh.x += sh.vx * dt * .8; sh.y += sh.vy * dt * .8; sh.life -= dt * 1.3;
          const g = ctx.createLinearGradient(sh.x * w, sh.y * h, (sh.x - sh.vx * .12) * w, (sh.y - sh.vy * .12) * h); g.addColorStop(0, `rgba(255,255,255,${Math.max(0, sh.life)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sh.x * w, sh.y * h); ctx.lineTo((sh.x - sh.vx * .12) * w, (sh.y - sh.vy * .12) * h); ctx.stroke();
        }
        S.shots = S.shots.filter((s) => s.life > 0);
      },
    },

    /* synthwave perspective grid + striped sun */
    grid: {
      blur: 0, scale: 1, fps: 60,
      init() { S.off = 0; S.stars = Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random() * .5, p: rand(0, 6.28) })); },
      draw(t, dt) {
        const [c1, c2, c3, c4] = preset.colors; const hz = h * .58;
        const sky = ctx.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#05010f'); sky.addColorStop(1, c4); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, hz);
        for (const s of S.stars) { ctx.fillStyle = `rgba(255,255,255,${.3 + .5 * Math.abs(Math.sin(t / 800 + s.p))})`; ctx.fillRect(s.x * w, s.y * h, 1.5, 1.5); }
        // sun
        const sr = Math.min(w, h) * .22, sx = w / 2, sy = hz - sr * .15;
        const sg = ctx.createLinearGradient(0, sy - sr, 0, sy + sr); sg.addColorStop(0, c1); sg.addColorStop(1, c3);
        ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.28); ctx.clip(); ctx.fillStyle = sg; ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
        ctx.fillStyle = c4; for (let i = 0; i < 7; i++) { const yy = sy + sr * (.1 + i * .13) + ((t / 40) % (sr * .13)); ctx.fillRect(sx - sr, yy, sr * 2, 3 + i * 1.2); }
        ctx.restore();
        ctx.shadowColor = c1; ctx.shadowBlur = 40; ctx.strokeStyle = hex(c1, .6); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.28); ctx.stroke(); ctx.shadowBlur = 0;
        // ground
        const gr = ctx.createLinearGradient(0, hz, 0, h); gr.addColorStop(0, '#12002a'); gr.addColorStop(1, '#03000a'); ctx.fillStyle = gr; ctx.fillRect(0, hz, w, h - hz);
        S.off = (S.off + dt * .9) % 1;
        ctx.strokeStyle = hex(c2, .75); ctx.lineWidth = 1.2; ctx.shadowColor = c2; ctx.shadowBlur = 8;
        for (let i = 0; i < 14; i++) { const k = ((i + S.off) / 14); const y = hz + Math.pow(k, 2.2) * (h - hz); ctx.globalAlpha = .25 + k * .75; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        ctx.globalAlpha = 1;
        for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(w / 2 + i * w * .045, hz); ctx.lineTo(w / 2 + i * w * .28, h); ctx.stroke(); }
        ctx.shadowBlur = 0;
        const hg = ctx.createLinearGradient(0, hz - 60, 0, hz + 40); hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(.5, hex(c3, .35)); hg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = hg; ctx.fillRect(0, hz - 60, w, 100);
      },
    },

    /* layered ocean waves under a moon */
    waves: {
      blur: 0, scale: 1, fps: 60,
      init() { S.stars = Array.from({ length: 150 }, () => ({ x: Math.random(), y: Math.random() * .55, p: rand(0, 6.28) })); },
      draw(t) {
        const [c1, c2, c3, c4] = preset.colors;
        const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#02060f'); sky.addColorStop(.6, c4); sky.addColorStop(1, preset.base); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
        for (const s of S.stars) { ctx.fillStyle = `rgba(255,255,255,${.3 + .6 * Math.abs(Math.sin(t / 900 + s.p))})`; ctx.fillRect(s.x * w, s.y * h, 1.5, 1.5); }
        const mx = w * .72, my = h * .28, mr = Math.min(w, h) * .07;
        const mg = ctx.createRadialGradient(mx, my, mr * .5, mx, my, mr * 5); mg.addColorStop(0, 'rgba(255,255,255,.35)'); mg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = mg; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.28); ctx.fill();
        const layers = [[c4, .58, .028, .9, .5], [c2, .64, .024, 1.3, .6], [c1, .71, .02, 1.7, .75], [c3, .8, .016, 2.2, .9]];
        layers.forEach(([c, base, amp, sp, al], li) => {
          ctx.beginPath(); ctx.moveTo(0, h);
          for (let x = 0; x <= w; x += 8) { const y = h * base + Math.sin(x / w * 8 + t / 1000 * sp + li) * h * amp + Math.sin(x / w * 19 - t / 800 * sp) * h * amp * .4; ctx.lineTo(x, y); }
          ctx.lineTo(w, h); ctx.closePath();
          const g = ctx.createLinearGradient(0, h * base - 40, 0, h); g.addColorStop(0, hex(c, al)); g.addColorStop(1, hex(preset.base, 1)); ctx.fillStyle = g; ctx.fill();
        });
        // moon reflection shimmer
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 14; i++) { const y = h * .6 + i * h * .028; const wdt = mr * (2 + i * .5) * (.6 + .4 * Math.abs(Math.sin(t / 500 + i))); ctx.fillStyle = `rgba(255,255,255,${.12 - i * .007})`; ctx.fillRect(mx - wdt / 2 + Math.sin(t / 700 + i) * 6, y, wdt, 2); }
        ctx.globalCompositeOperation = 'source-over';
      },
    },

    /* digital rain */
    matrix: {
      blur: 0, scale: 1, fps: 24,
      init() { S.fs = Math.max(12, Math.round(w / 90)); S.cols = Math.ceil(w / S.fs); S.drops = Array.from({ length: S.cols }, () => ({ y: rand(-30, h / S.fs), sp: rand(.5, 1.3) })); S.chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789JAIVARDHANSINGH<>{}/=+*#'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); },
      draw() {
        ctx.fillStyle = 'rgba(0,0,0,.09)'; ctx.fillRect(0, 0, w, h);
        ctx.font = `${S.fs}px monospace`;
        S.drops.forEach((d, i) => {
          const ch = S.chars[Math.random() * S.chars.length | 0]; const x = i * S.fs, y = d.y * S.fs;
          ctx.fillStyle = '#d9ffe6'; ctx.fillText(ch, x, y);
          ctx.fillStyle = preset.colors[Math.random() < .85 ? 0 : 2]; ctx.fillText(S.chars[Math.random() * S.chars.length | 0], x, y - S.fs);
          d.y += d.sp; if (y > h + S.fs * 4 && Math.random() > .96) d.y = rand(-30, 0);
        });
      },
    },
  };

  /* --------------------------------------------------- time-of-day tint */
  function tint() {
    const hr = new Date().getHours() + new Date().getMinutes() / 60;
    let c = null;
    if (hr < 5 || hr >= 21) c = 'rgba(8,14,40,.22)';        // night: cool
    else if (hr < 8) c = 'rgba(255,150,80,.10)';             // dawn: warm
    else if (hr >= 17 && hr < 21) c = 'rgba(255,120,60,.12)'; // evening: golden
    if (!c) return;
    ctx.fillStyle = c; ctx.fillRect(0, 0, w, h);
  }

  /* ------------------------------------------------------------- loop */
  function scene() { return SCENES[preset.type] || SCENES.bloom; }
  function resize() {
    if (!canvas) return;
    const sc = scene().scale * Math.min(1.5, devicePixelRatio || 1);
    const cw = canvas.parentElement?.clientWidth || innerWidth, ch = canvas.parentElement?.clientHeight || innerHeight;
    w = canvas.width = Math.max(320, Math.round(cw * sc)); h = canvas.height = Math.max(320, Math.round(ch * sc));
    S = {}; scene().init();
  }
  function apply() {
    canvas.style.filter = scene().blur ? `blur(${scene().blur}px) saturate(1.3)` : 'saturate(1.15)';
    canvas.style.transform = scene().blur ? 'scale(1.18)' : 'scale(1.04)';
    resize(); last = 0;
  }
  function frame(t) {
    raf = requestAnimationFrame(frame);
    const sc = scene(); const minDt = 1000 / sc.fps;
    if (t - last < minDt) return;
    const dt = Math.min(.1, last ? (t - last) / 1000 : .016); last = t;
    sc.draw(t, reduced ? dt * .2 : dt);
    tint();
  }

  return {
    mount(container) {
      this.unmount();
      canvas = document.createElement('canvas'); canvas.className = 'wallpaper';
      container.appendChild(canvas); ctx = canvas.getContext('2d');
      preset = WALLPAPERS[Prefs.get('wallpaper')] || WALLPAPERS[0];
      apply(); raf = requestAnimationFrame(frame);
      window.addEventListener('resize', resize);
    },
    unmount() { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); canvas?.remove(); canvas = null; },
    setPreset(i) {
      const next = WALLPAPERS[i] || WALLPAPERS[0]; if (next === preset) return;
      if (!canvas) { preset = next; return; }
      canvas.style.transition = 'opacity .4s'; canvas.style.opacity = '0';
      setTimeout(() => { preset = next; apply(); canvas.style.opacity = '1'; }, 380);
    },
  };
})();
