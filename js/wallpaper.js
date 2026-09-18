/* ============================================================
   WALLPAPER — animated "bloom" canvas shared by both shells
   ============================================================ */
const Wallpaper = (() => {
  let canvas, ctx, blobs = [], raf, preset = WALLPAPERS[0], w = 0, h = 0, last = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeBlobs() {
    blobs = preset.colors.map((c, i) => ({
      c, x: rand(0.1, 0.9), y: rand(0.1, 0.9), r: rand(0.35, 0.55),
      vx: rand(-0.02, 0.02), vy: rand(-0.02, 0.02), p: i * 1.3,
    }));
  }

  function resize() {
    if (!canvas) return;
    w = canvas.width = Math.max(320, Math.floor(innerWidth / 2));
    h = canvas.height = Math.max(320, Math.floor(innerHeight / 2));
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (t - last < 33) return; // ~30fps is plenty for a blurred backdrop
    const dt = Math.min(0.1, (t - last) / 1000); last = t;
    ctx.fillStyle = preset.base; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const b of blobs) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < 0.05 || b.x > 0.95) b.vx *= -1;
      if (b.y < 0.05 || b.y > 0.95) b.vy *= -1;
      const pulse = 1 + 0.08 * Math.sin(t / 2500 + b.p);
      const R = b.r * Math.max(w, h) * pulse;
      const g = ctx.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, R);
      g.addColorStop(0, b.c + 'cc'); g.addColorStop(0.5, b.c + '55'); g.addColorStop(1, b.c + '00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x * w, b.y * h, R, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  return {
    mount(container) {
      this.unmount();
      canvas = document.createElement('canvas'); canvas.className = 'wallpaper';
      container.appendChild(canvas); ctx = canvas.getContext('2d');
      preset = WALLPAPERS[Prefs.get('wallpaper')] || WALLPAPERS[0];
      resize(); makeBlobs(); last = 0; raf = requestAnimationFrame(frame);
      window.addEventListener('resize', resize);
    },
    unmount() { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); canvas?.remove(); canvas = null; },
    setPreset(i) { preset = WALLPAPERS[i] || WALLPAPERS[0]; if (canvas) makeBlobs(); },
  };
})();
