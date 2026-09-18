/* ============================================================
   WINDOWS SHELL — boot, lock, login, desktop, window manager,
   taskbar, start menu, flyouts, notifications
   ============================================================ */
const WinOS = (() => {
  let root, desktop, wm, clockTimer, openFlyout = null, fx = null, stopIdle = null;
  const notifications = [];
  const PINNED = ['about', 'projects', 'terminal', 'contact', 'resume'];
  const TASKBAR_H = 70;

  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const winLogo = (s = 24) => `<svg class="w-logo" width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="2" y="2" width="9.3" height="9.3" rx="1.2"/><rect x="12.7" y="2" width="9.3" height="9.3" rx="1.2"/><rect x="2" y="12.7" width="9.3" height="9.3" rx="1.2"/><rect x="12.7" y="12.7" width="9.3" height="9.3" rx="1.2"/></svg>`;
  const fmtTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (d) => d.toLocaleDateString([], { day: 'numeric', month: 'numeric', year: 'numeric' });

  /* ------------------------------------------------------------ boot */
  function start(r) {
    root = r; root.className = 'win-root'; root.innerHTML = '';
    Wallpaper.mount(root);
    boot();
  }

  function boot() {
    const el = h(`<div class="w-screen w-boot">
      <div class="w-boot-logo">${winLogo(96)}</div>
      <div class="w-boot-progress"><i></i></div>
      <div class="fx-boot-lines"></div>
      <div class="w-boot-text">JaiOS</div>
    </div>`);
    root.appendChild(el);
    FX.typeLines(el.querySelector('.fx-boot-lines'), ['Initializing JaiOS kernel v2.0', 'Loading modules: next.js, mongodb, c++', 'Mounting /projects (3 deployed)', 'Verifying credentials: VIT Vellore CSE', 'Starting window manager'], { speed: 10, lineDelay: 60 });
    setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); landing(); }, 600); }, 3200);
  }


  /* ------------------------------------------------- cinematic landing */
  function landing() {
    const words = (...ws) => ws.map((wd) => `<div class="ld-word">${[...wd].map((c, i) => `<span class="ld-ch" style="--i:${i}">${c}</span>`).join('')}</div>`).join('');
    const el = h(`<div class="w-screen w-landing">
      <div class="ld-bar"><span class="ld-brand">${winLogo(15)} JaiOS</span><nav class="ld-menu"><span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Window</span><span>Help</span></nav><span class="ld-right">${svg('wifi', 14)}${svg('battery', 14)}<span class="ld-time"></span></span></div>
      <div class="ld-scroll">
        <section class="ld-hero">
          <canvas class="ld-canvas"></canvas>
          <div class="ld-hero-text">
            <div class="ld-kicker">Portfolio · Software Developer · VIT Vellore</div>
            <h1 class="ld-name">${esc(DATA.name)}</h1>
            <p class="ld-tag">I build full-stack products with <em>Next.js</em>, <em>MongoDB</em> and <em>C++</em> — and ship them to production.</p>
          </div>
          <div class="ld-hint"><span>Scroll to explore</span><i></i></div>
        </section>
        <section class="ld-sec">
          <div class="ld-side"><div class="ld-eyebrow">I am a</div><p class="ld-desc">Full-stack developer who cares about correctness — atomic writes, transactions, auth done right. Built and deployed <b>${DATA.projects.length} production apps</b> on Next.js + MongoDB, and automation tools used daily on live factory floors at Timken and Tata Cummins.</p><div class="ld-chips">${['Next.js', 'MongoDB', 'React', 'JWT', 'REST APIs', 'VB.NET', 'Oracle SQL'].map((c) => `<span class="chip">${c}</span>`).join('')}</div></div>
          <div class="ld-words">${words('FULL-STACK', 'DEVELOPER')}</div>
        </section>
        <section class="ld-sec ld-alt">
          <div class="ld-words">${words('PROBLEM', 'SOLVER')}</div>
          <div class="ld-side"><div class="ld-eyebrow">As well as a</div><p class="ld-desc"><b>200+ DSA problems</b> in C++ across LeetCode and GeeksforGeeks. 3rd place at IEEE SENSE-A-Thon 2026 against 50+ teams. CGPA 8.16 with a foundation in OS, DBMS, Networks and OOP.</p><div class="ld-chips">${['C++', 'Graphs', 'Trees', 'DP', 'Operating Systems', 'DBMS'].map((c) => `<span class="chip">${c}</span>`).join('')}</div></div>
        </section>
        <section class="ld-enter">
          <div class="ld-enter-card">${avatarHTML(96)}<h2>Enter JaiOS</h2><p>${esc(DATA.headline)}</p><button class="btn btn-primary ld-signin">${svg('lock', 16)} Sign in to the desktop</button><div class="ld-socials">${socialButtons('btn-sm')}</div><div class="ld-foot">Press <kbd>Enter</kbd> anytime · Windows desktop here, Android on your phone</div></div>
        </section>
      </div>
    </div>`);
    root.appendChild(el);
    const scroll = el.querySelector('.ld-scroll'), hero = el.querySelector('.ld-hero-text'), canvas = el.querySelector('.ld-canvas'), hint = el.querySelector('.ld-hint');
    const stopHero = FX.hero(canvas);
    const clock = setInterval(() => { el.querySelector('.ld-time').textContent = new Date().toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }) + '  ' + fmtTime(new Date()); }, 1000); el.querySelector('.ld-time').textContent = fmtTime(new Date());
    scroll.addEventListener('scroll', () => { const y = scroll.scrollTop, k = Math.min(1, y / innerHeight); hero.style.transform = `translateY(${y * .35}px)`; hero.style.opacity = 1 - k * 1.2; canvas.style.transform = `scale(${1 - k * .35}) translateY(${y * .2}px)`; canvas.style.opacity = 1 - k; hint.style.opacity = 1 - k * 3; }, { passive: true });
    const io = new IntersectionObserver((es) => es.forEach((x) => x.target.classList.toggle('in', x.isIntersecting)), { root: scroll, threshold: .35 });
    el.querySelectorAll('.ld-sec, .ld-enter').forEach((s) => io.observe(s));
    FX.splitText(el.querySelector('.ld-tag'));
    let done = false;
    const go = () => {
      if (done) return; done = true;
      document.removeEventListener('keydown', onKey); clearInterval(clock); io.disconnect();
      FX.sfx.unlock(); if (Prefs.get('sound')) chime();
      const wel = h(`<div class="w-screen w-login"><div class="w-login-card">${avatarHTML(120)}<div class="w-login-name glitch" data-text="Welcome">Welcome</div><div class="w-spinner small">${'<i></i>'.repeat(6)}</div></div></div>`);
      root.appendChild(wel); el.classList.add('out'); setTimeout(() => { stopHero(); el.remove(); }, 600);
      setTimeout(() => { wel.classList.add('out'); setTimeout(() => wel.remove(), 600); if (!desktop) buildDesktop(); else desktop.classList.remove('locked'); }, 1600);
    };
    const onKey = (e) => { if (e.key === 'Enter') go(); };
    el.querySelector('.ld-signin').onclick = go; document.addEventListener('keydown', onKey);
    el.querySelectorAll('.ld-menu span').forEach((m) => (m.onclick = () => scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' })));
  }

  function lock() {
    const now = new Date(); const hr = now.getHours(); const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const facts = [
      ['Timken India', 'Cut downtime detection on critical network infra from 15+ minutes to under 1 minute.'],
      ['Bookify', 'Every seat is an atomic conditional write — two people can never book the same seat.'],
      ['Tata Cummins', 'Camera + QR verification cut manual inspection steps by ~50% on the production line.'],
      ['InterviewAI', 'Retry-with-backoff and model fallback so a Gemini rate limit never drops an answer.'],
      ['IEEE SENSE-A-Thon 2026', '3rd place with a real-time multi-sensor Vehicle Health Monitoring System.'],
    ];
    const el = h(`<div class="w-screen w-lock">
      <div class="w-lock-greet">${greet}</div>
      <div class="w-lock-time"></div>
      <div class="w-lock-date">${now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      <div class="w-lock-sig">${esc(DATA.name)}</div>
      <div class="w-spot"><div class="w-spot-k">${svg('sparkles', 14)} Spotlight</div><div class="w-spot-t"></div><div class="w-spot-d"></div><div class="w-spot-dots">${facts.map((_, i) => `<i style="--i:${i}"></i>`).join('')}</div></div>
      <div class="w-lock-hint">${svg('chevronUp', 22)}<span>Click anywhere or press any key to unlock</span></div>
      <div class="w-lock-widgets">
        <div class="w-lock-card">${tile('briefcase', ['#22c55e', '#0ea5e9'], 34, 10)}<div><b>Open to SDE roles</b><span>Graduating May 2027 · ${esc(DATA.location.split(',')[0])}</span></div></div>
        <div class="w-lock-card">${tile('rocket', ['#f43f5e', '#f97316'], 34, 10)}<div><b>${DATA.projects.length} projects live</b><span>Next.js · MongoDB · Gemini</span></div></div>
        <div class="w-lock-card">${tile('mail', ['#06b6d4', '#3b82f6'], 34, 10)}<div><b>${esc(DATA.email)}</b><span>Usually replies within a day</span></div></div>
      </div>
      <div class="w-lock-tray">${svg('wifi', 15)}${svg('volume', 15)}${svg('battery', 15)}</div>
    </div>`);
    root.appendChild(el);
    const stopParallax = FX.parallax(root, 22);
    FX.flipText(el.querySelector('.w-lock-time'), fmtTime(now));
    const t = setInterval(() => FX.flipText(el.querySelector('.w-lock-time'), fmtTime(new Date())), 1000);
    let fi = 0; const spotT = el.querySelector('.w-spot-t'), spotD = el.querySelector('.w-spot-d'), dots = el.querySelectorAll('.w-spot-dots i');
    const showFact = () => { const [k, v] = facts[fi % facts.length]; spotT.parentElement.classList.remove('flip'); void spotT.offsetWidth; spotT.parentElement.classList.add('flip'); spotT.textContent = k; spotD.textContent = v; dots.forEach((d, i) => d.classList.toggle('on', i === fi % facts.length)); fi++; };
    showFact(); const ft = setInterval(showFact, 5000);
    let done = false;
    const go = () => {
      if (done) return; done = true;
      clearInterval(t); clearInterval(ft); stopParallax(); document.removeEventListener('keydown', go);
      // "Hello"-style recognition moment
      const hello = h(`<div class="w-hello">${svg('face', 34)}<span>Looking for you…</span></div>`); el.appendChild(hello);
      setTimeout(() => { hello.classList.add('ok'); hello.querySelector('span').textContent = 'Welcome back'; hello.querySelector('svg').outerHTML = svg('check', 34); FX.sfx.unlock(); }, 700);
      setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 500); login(); }, 1250);
    };
    el.addEventListener('click', go); setTimeout(() => document.addEventListener('keydown', go, { once: true }), 300);
  }

  function login() {
    const el = h(`<div class="w-screen w-login">
      <div class="w-login-card">
        ${avatarHTML(120)}
        <div class="w-login-name">${esc(DATA.name)}</div>
        <div class="w-login-sub">${esc(DATA.headline)}</div>
        <button class="btn btn-primary w-signin">${svg('lock', 16)} Sign in</button>
        <div class="w-login-hint">Press Enter to sign in as guest</div>
      </div>
      <div class="w-login-foot"><span>${svg('wifi', 16)}</span><span>${svg('power', 16)}</span></div>
    </div>`);
    root.appendChild(el);
    const btn = el.querySelector('.w-signin');
    const go = () => {
      document.removeEventListener('keydown', onKey);
      btn.disabled = true;
      el.querySelector('.w-login-card').innerHTML = `${avatarHTML(120)}<div class="w-login-name glitch" data-text="Welcome">Welcome</div><div class="w-spinner small">${'<i></i>'.repeat(6)}</div>`;
      if (Prefs.get('sound')) chime();
      setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 600); if (!desktop) buildDesktop(); else desktop.classList.remove('locked'); }, 1500);
    };
    const onKey = (e) => { if (e.key === 'Enter') go(); };
    btn.onclick = go; document.addEventListener('keydown', onKey);
    setTimeout(() => btn.focus(), 400);
  }

  function chime() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      [[523.25, 0], [659.25, .12], [783.99, .24], [1046.5, .36]].forEach(([f, t]) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ac.destination);
        g.gain.setValueAtTime(0, ac.currentTime + t); g.gain.linearRampToValueAtTime(.12, ac.currentTime + t + .03); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + t + .9);
        o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 1);
      });
    } catch (e) { /* audio not available */ }
  }

  /* --------------------------------------------------------- desktop */
  function buildDesktop() {
    desktop = h(`<div class="w-desktop">
      <div class="w-icons"></div>
      <div class="w-windows"></div>
      <div class="w-snap-preview" hidden></div>
      <div class="w-taskbar">
        <div class="w-tb-left"><button class="w-tb-btn w-widgets-btn" data-fly="widgets"><span class="w-live-dot"></span> Open to work</button></div>
        <div class="w-tb-center">
          <button class="w-tb-btn w-start-btn" data-fly="start" title="Start">${winLogo(22)}</button>
          <button class="w-tb-btn w-tb-search" data-fly="search">${svg('search', 16)}<span>Search</span></button>
          <button class="w-tb-btn" data-action="taskview" title="Task view">${svg('recents', 18)}</button>
          <div class="w-tb-apps"></div>
        </div>
        <div class="w-tb-right">
          <button class="w-tb-btn w-tray" data-fly="quick" title="Quick settings">${svg('wifi', 15)}${svg('volume', 15)}${svg('battery', 15)}</button>
          <button class="w-tb-btn w-clock" data-fly="calendar"><span class="w-time"></span><span class="w-date"></span></button>
          <button class="w-tb-btn w-notif-btn" data-fly="notifs" title="Notifications">${svg('bell', 15)}<span class="w-notif-count" hidden></span></button>
        </div>
      </div>
      <div class="w-flyouts"></div>
      <div class="w-toasts"></div>
      <div class="w-ctx" hidden></div>
      <div class="w-night"></div>
      <div class="w-brightness"></div>
    </div>`);
    root.appendChild(desktop);
    fx = FX.particles(desktop, { count: 80 });
    desktop.insertBefore(h('<div class="fx-hud"></div>'), desktop.querySelector('.w-icons'));
    FX.ripple(desktop, '.w-tb-btn, .w-tb-app, .w-start-app, .w-rec, .w-qs, .btn, .w-icon, .w-ctx button, .w-power-menu button');
    FX.hoverFX(desktop, '.card, .stat, .project-card, .ach-card, .w-widget');

    // cursor light that follows the pointer over the wallpaper
    const light = h('<div class="w-light"></div>'); desktop.insertBefore(light, desktop.querySelector('.w-icons'));
    let lx = 0, ly = 0, lraf = null;
    desktop.addEventListener('pointermove', (e) => { lx = e.clientX; ly = e.clientY; if (!lraf) lraf = requestAnimationFrame(() => { light.style.transform = `translate(${lx}px,${ly}px)`; lraf = null; }); });

    // macOS-style dock magnification on the taskbar
    const center = desktop.querySelector('.w-tb-center');
    const magnify = (x) => center.querySelectorAll('.w-tb-app, .w-tb-btn').forEach((b) => {
      const r = b.getBoundingClientRect(); const d = Math.abs(x - (r.left + r.width / 2)); const s = x == null ? 1 : 1 + 0.38 * Math.max(0, 1 - d / 110);
      const t = b.querySelector('.tile, .w-logo, .ico'); if (t) t.style.transform = s > 1.01 ? `translateY(${-(s - 1) * 14}px) scale(${s})` : '';
    });
    center.addEventListener('pointermove', (e) => magnify(e.clientX)); center.addEventListener('pointerleave', () => magnify(null));

    // idle screensaver
    stopIdle = FX.idle(180000, showScreensaver, hideScreensaver);

    // icons
    const icons = desktop.querySelector('.w-icons');
    DESKTOP_APPS.forEach((id, i) => {
      const a = APPS[id];
      const ic = h(`<button class="w-icon" data-id="${id}" style="--d:${i * 40}ms">${tile(a.icon, a.color, 44)}<span>${a.title}</span></button>`);
      ic.onclick = (e) => { desktop.querySelectorAll('.w-icon.sel').forEach((x) => x.classList.remove('sel')); ic.classList.add('sel'); if (e.detail === 0 || matchMedia('(pointer:coarse)').matches) openApp(id, undefined, ic); };
      ic.ondblclick = () => openApp(id, undefined, ic);
      ic.onkeydown = (e) => { if (e.key === 'Enter') openApp(id, undefined, ic); };
      icons.appendChild(ic);
    });

    wm = new WM(desktop.querySelector('.w-windows'), desktop.querySelector('.w-tb-apps'), desktop.querySelector('.w-snap-preview'));
    PINNED.forEach((id) => wm.addTaskbarButton(id, true));

    // taskbar actions
    desktop.querySelectorAll('[data-fly]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); toggleFlyout(b.dataset.fly, b); }));
    desktop.querySelector('[data-action="taskview"]').onclick = (e) => { e.stopPropagation(); taskView(); };

    // clock
    const tick = () => { const d = new Date(); desktop.querySelector('.w-time').textContent = fmtTime(d); desktop.querySelector('.w-date').textContent = fmtDate(d); };
    tick(); clockTimer = setInterval(tick, 1000);

    // global dismiss
    desktop.addEventListener('pointerdown', (e) => {
      if (openFlyout && !e.target.closest('.w-flyout') && !e.target.closest('[data-fly]')) closeFlyout();
      const ctx = desktop.querySelector('.w-ctx'); if (!ctx.hidden && !e.target.closest('.w-ctx')) ctx.hidden = true;
      if (!e.target.closest('.w-icon') && !e.target.closest('.w-ctx')) desktop.querySelectorAll('.w-icon.sel').forEach((x) => x.classList.remove('sel'));
    });
    desktop.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.w-window') || e.target.closest('.w-taskbar') || e.target.closest('.w-flyout')) return;
      e.preventDefault(); showContextMenu(e.clientX, e.clientY);
    });
    document.addEventListener('keydown', onGlobalKey);

    requestAnimationFrame(() => desktop.classList.add('ready'));
    setTimeout(() => notify('JaiOS', `Welcome, visitor!`, `Double-click an icon or use the Start menu to explore ${DATA.firstName}'s work. Try the Terminal too.`, 'sparkles'), 1400);
    setTimeout(() => { if (!wm.wins.size) openApp('about'); }, 2600);
  }

  function onGlobalKey(e) {
    if (e.key === 'Escape') { closeFlyout(); const ctx = desktop?.querySelector('.w-ctx'); if (ctx) ctx.hidden = true; desktop?.querySelector('.w-taskview')?.remove(); }
  }

  function openApp(id, opts, fromEl) {
    closeFlyout();
    const a = APPS[id]; if (!a) return;
    if (a.external) { window.open(a.external, '_blank', 'noopener'); return; }
    FX.sfx.open();
    wm.open(id, opts, fromEl);
  }
  function closeApp(id) { const w = wm.wins.get(id); if (w) wm.close(w); }

  /* ------------------------------------------------------ window mgr */
  class WM {
    constructor(layer, tbApps, snap) { this.layer = layer; this.tbApps = tbApps; this.snap = snap; this.wins = new Map(); this.z = 10; this.count = 0; }

    addTaskbarButton(id, pinned = false) {
      let b = this.tbApps.querySelector(`[data-app="${id}"]`);
      if (b) return b;
      const a = APPS[id];
      b = h(`<button class="w-tb-app ${pinned ? 'pinned' : ''}" data-app="${id}" title="${a.title}">${tile(a.icon, a.color, 26, 7)}<i class="w-tb-ind"></i></button>`);
      b.onclick = () => {
        const w = this.wins.get(id);
        if (!w) return openApp(id, undefined, b);
        if (w.min) return this.restore(w);
        if (w.el.classList.contains('active')) return this.minimize(w);
        this.focus(w);
      };
      this.tbApps.appendChild(b); return b;
    }

    open(id, opts = {}, fromEl = null) {
      if (this.wins.has(id)) { const w = this.wins.get(id); if (w.min) this.restore(w); else this.focus(w); if (opts.projectId) APPS[id].mount?.(w.body, 'win', opts); return w; }
      const a = APPS[id];
      const vw = innerWidth, vh = innerHeight - TASKBAR_H;
      const width = Math.min(a.w || 800, vw - 24), height = Math.min(a.h || 560, vh - 24);
      const off = (this.count++ % 6) * 28;
      const left = Math.max(12, Math.round((vw - width) / 2 + off - 60)), top = Math.max(12, Math.round((vh - height) / 2 + off - 40));
      const el = h(`<div class="w-window" data-id="${id}" style="left:${left}px;top:${top}px;width:${width}px;height:${height}px;--c1:${a.color[0]};--c2:${a.color[1]}">
        <div class="w-mica"></div>
        <div class="w-titlebar">${tile(a.icon, a.color, 18, 5)}<span class="w-title">${a.title}</span>
          <div class="w-controls"><button data-c="min" title="Minimize">${svg('minus', 14)}</button><button data-c="max" title="Maximize">${svg('square', 12)}</button><button data-c="close" class="w-close" title="Close">${svg('x', 14)}</button></div>
        </div>
        <div class="w-body"></div>
        ${['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((d) => `<div class="w-rs w-rs-${d}" data-dir="${d}"></div>`).join('')}
      </div>`);
      const body = el.querySelector('.w-body');
      body.innerHTML = a.render('win');
      const w = { id, el, body, min: false, max: false, rect: { left, top, width, height } };
      this.wins.set(id, w);
      this.layer.appendChild(el);
      a.mount?.(body, 'win', opts);

      el.addEventListener('pointerdown', () => this.focus(w));
      el.querySelector('[data-c="min"]').onclick = (e) => { e.stopPropagation(); this.minimize(w); };
      el.querySelector('[data-c="max"]').onclick = (e) => { e.stopPropagation(); this.toggleMax(w); };
      el.querySelector('[data-c="close"]').onclick = (e) => { e.stopPropagation(); this.close(w); };
      el.querySelector('.w-titlebar').ondblclick = (e) => { if (!e.target.closest('.w-controls')) this.toggleMax(w); };
      this.makeDraggable(w); this.makeResizable(w);

      this.addTaskbarButton(id).classList.add('running');
      this.focus(w);
      if (fromEl && !FX.reduced) { // genie: grow out of the icon that launched it
        const r = fromEl.getBoundingClientRect();
        el.style.transform = `translate(${r.left + r.width / 2 - (left + width / 2)}px, ${r.top + r.height / 2 - (top + height / 2)}px) scale(${Math.max(.04, r.width / width)})`;
        el.style.opacity = '0';
      }
      requestAnimationFrame(() => requestAnimationFrame(() => { el.classList.add('open'); el.style.transform = ''; el.style.opacity = ''; }));
      FX.splitText(body.querySelector('.page-title'));
      return w;
    }

    focus(w) {
      this.layer.querySelectorAll('.w-window.active').forEach((x) => x.classList.remove('active'));
      this.tbApps.querySelectorAll('.w-tb-app.active').forEach((x) => x.classList.remove('active'));
      w.el.classList.add('active'); w.el.style.zIndex = ++this.z;
      this.tbApps.querySelector(`[data-app="${w.id}"]`)?.classList.add('active');
    }

    tbTarget(w) {
      const b = this.tbApps.querySelector(`[data-app="${w.id}"]`); const r = b.getBoundingClientRect(); const e = w.el.getBoundingClientRect();
      return `translate(${r.left + r.width / 2 - (e.left + e.width / 2)}px, ${r.top + r.height / 2 - (e.top + e.height / 2)}px) scale(0.05)`;
    }

    minimize(w) {
      w.min = true; w.el.style.transition = 'transform .28s cubic-bezier(.4,0,1,1), opacity .25s'; w.el.style.transform = this.tbTarget(w); w.el.style.opacity = '0';
      w.el.classList.remove('active'); this.tbApps.querySelector(`[data-app="${w.id}"]`)?.classList.remove('active');
      setTimeout(() => { w.el.style.display = 'none'; }, 280);
      const next = [...this.wins.values()].filter((x) => !x.min && x !== w).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
      if (next) this.focus(next);
    }
    restore(w) {
      w.min = false; w.el.style.display = ''; w.el.style.transition = 'none'; w.el.style.transform = this.tbTarget(w); w.el.style.opacity = '0';
      w.el.getBoundingClientRect();
      w.el.style.transition = 'transform .3s cubic-bezier(.2,.8,.2,1), opacity .2s'; w.el.style.transform = ''; w.el.style.opacity = '';
      setTimeout(() => { w.el.style.transition = ''; }, 320);
      this.focus(w);
    }
    toggleMax(w, force) {
      const to = force ?? !w.max;
      w.el.classList.add('anim'); setTimeout(() => w.el.classList.remove('anim'), 320);
      if (to) {
        const r = w.el.getBoundingClientRect(); w.rect = { left: r.left, top: r.top, width: r.width, height: r.height };
        Object.assign(w.el.style, { left: '0px', top: '0px', width: innerWidth + 'px', height: (innerHeight - TASKBAR_H) + 'px' });
        w.el.classList.add('max'); w.el.querySelector('[data-c="max"]').innerHTML = svg('restore', 13);
      } else {
        const r = w.rect; Object.assign(w.el.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
        w.el.classList.remove('max'); w.el.querySelector('[data-c="max"]').innerHTML = svg('square', 12);
      }
      w.max = to;
    }
    snapTo(w, zone) {
      if (!w.max) { const r = w.el.getBoundingClientRect(); w.rect = { left: r.left, top: r.top, width: r.width, height: r.height }; }
      if (zone === 'top') return this.toggleMax(w, true);
      w.el.classList.add('anim'); setTimeout(() => w.el.classList.remove('anim'), 320);
      const half = Math.round(innerWidth / 2);
      Object.assign(w.el.style, { left: (zone === 'left' ? 0 : half) + 'px', top: '0px', width: half + 'px', height: (innerHeight - TASKBAR_H) + 'px' });
    }
    close(w) {
      FX.sfx.close();
      w.el.classList.remove('open'); w.el.classList.add('closing');
      setTimeout(() => w.el.remove(), 220);
      this.wins.delete(w.id);
      const b = this.tbApps.querySelector(`[data-app="${w.id}"]`);
      if (b) { b.classList.remove('running', 'active'); if (!b.classList.contains('pinned')) b.remove(); }
      const next = [...this.wins.values()].filter((x) => !x.min).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
      if (next) this.focus(next);
    }

    makeDraggable(w) {
      const bar = w.el.querySelector('.w-titlebar');
      let sx, sy, sl, st, dragging = false, zone = null, lastX = null;
      bar.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || e.target.closest('.w-controls')) return;
        bar.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; dragging = false;
        sl = w.el.offsetLeft; st = w.el.offsetTop;
      });
      bar.addEventListener('pointermove', (e) => {
        if (!bar.hasPointerCapture(e.pointerId)) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!dragging && Math.hypot(dx, dy) < 4) return;
        if (!dragging) {
          dragging = true; w.el.classList.add('dragging');
          if (w.max) { // un-maximize keeping the cursor over the title bar
            const ratio = e.clientX / innerWidth; this.toggleMax(w, false); w.el.classList.remove('anim');
            sl = Math.round(e.clientX - w.rect.width * ratio); st = Math.max(0, e.clientY - 18); sx = e.clientX; sy = e.clientY;
          }
        }
        const vx = e.clientX - (lastX ?? e.clientX); lastX = e.clientX;
        w.el.style.transform = `rotate(${Math.max(-3.5, Math.min(3.5, vx * .35))}deg)`;
        const nl = Math.min(innerWidth - 80, Math.max(-w.el.offsetWidth + 120, sl + (e.clientX - sx)));
        const nt = Math.min(innerHeight - TASKBAR_H - 30, Math.max(0, st + (e.clientY - sy)));
        w.el.style.left = nl + 'px'; w.el.style.top = nt + 'px';
        zone = e.clientY <= 2 ? 'top' : e.clientX <= 2 ? 'left' : e.clientX >= innerWidth - 3 ? 'right' : null;
        this.showSnap(zone);
      });
      const end = (e) => {
        if (!bar.hasPointerCapture(e.pointerId)) return;
        bar.releasePointerCapture(e.pointerId); w.el.classList.remove('dragging'); this.showSnap(null); lastX = null;
        if (dragging) { w.el.classList.add('settle'); w.el.style.transform = ''; setTimeout(() => w.el.classList.remove('settle'), 500); }
        if (dragging && zone) this.snapTo(w, zone); zone = null; dragging = false;
      };
      bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
    }
    showSnap(zone) {
      if (!zone) { this.snap.hidden = true; return; }
      this.snap.hidden = false;
      const half = Math.round(innerWidth / 2), H = innerHeight - TASKBAR_H;
      Object.assign(this.snap.style, zone === 'top' ? { left: '0px', top: '0px', width: innerWidth + 'px', height: H + 'px' }
        : { left: (zone === 'left' ? 0 : half) + 'px', top: '0px', width: half + 'px', height: H + 'px' });
    }
    makeResizable(w) {
      w.el.querySelectorAll('.w-rs').forEach((hd) => {
        let sx, sy, r;
        hd.addEventListener('pointerdown', (e) => { if (w.max) return; e.stopPropagation(); hd.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; r = { l: w.el.offsetLeft, t: w.el.offsetTop, w: w.el.offsetWidth, h: w.el.offsetHeight }; this.focus(w); });
        hd.addEventListener('pointermove', (e) => {
          if (!hd.hasPointerCapture(e.pointerId)) return;
          const d = hd.dataset.dir, dx = e.clientX - sx, dy = e.clientY - sy; const MINW = 360, MINH = 240;
          let { l, t, w: W, h: H } = r;
          if (d.includes('e')) W = Math.max(MINW, r.w + dx);
          if (d.includes('s')) H = Math.max(MINH, r.h + dy);
          if (d.includes('w')) { W = Math.max(MINW, r.w - dx); l = r.l + (r.w - W); }
          if (d.includes('n')) { H = Math.max(MINH, r.h - dy); t = Math.max(0, r.t + (r.h - H)); }
          Object.assign(w.el.style, { left: l + 'px', top: t + 'px', width: W + 'px', height: H + 'px' });
        });
        const end = (e) => { if (hd.hasPointerCapture(e.pointerId)) hd.releasePointerCapture(e.pointerId); };
        hd.addEventListener('pointerup', end); hd.addEventListener('pointercancel', end);
      });
    }
  }

  /* ---------------------------------------------------------- flyouts */
  function closeFlyout() {
    if (!openFlyout) return;
    const f = openFlyout; openFlyout = null; f.classList.remove('in');
    desktop.querySelectorAll('.w-tb-btn.on').forEach((x) => x.classList.remove('on'));
    setTimeout(() => f.remove(), 220);
  }
  function toggleFlyout(kind, btn) {
    if (openFlyout?.dataset.kind === kind) return closeFlyout();
    closeFlyout();
    const builders = { start: startMenu, search: searchFlyout, calendar: calendarFlyout, quick: quickSettings, notifs: notifCenter, widgets: widgetsPanel };
    const f = builders[kind](); f.dataset.kind = kind; f.classList.add('w-flyout');
    desktop.querySelector('.w-flyouts').appendChild(f); openFlyout = f; btn?.classList.add('on');
    requestAnimationFrame(() => requestAnimationFrame(() => { f.classList.add('in'); FX.stagger(f, '.w-start-app, .w-rec, .w-qs, .w-widget, .w-notifs-list .toast', 28); }));
    f.querySelector('input')?.focus();
  }

  function appTile(id, size = 36) { const a = APPS[id]; return `<button class="w-start-app" data-open="${id}">${tile(a.icon, a.color, size)}<span>${a.title}</span></button>`; }
  function bindOpens(el) { el.querySelectorAll('[data-open]').forEach((b) => (b.onclick = () => openApp(b.dataset.open, b.dataset.project ? { projectId: b.dataset.project } : undefined, b))); }

  function startMenu() {
    const hr = new Date().getHours(); const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const f = h(`<div class="w-start">
      <div class="w-start-hero">${avatarHTML(44)}<div><div class="w-start-greet">${greet}, visitor 👋</div><div class="w-start-sub">Exploring ${DATA.firstName}'s portfolio · JaiOS v2.0</div></div><span class="badge badge-accent"><span class="w-live-dot"></span>&nbsp;Open to work</span></div>
      <div class="w-search-box">${svg('search', 16)}<input placeholder="Search for apps, projects, and more"></div>
      <div class="w-start-section"><span>Pinned</span><span class="w-start-link">All apps ${svg('chevronRight', 12)}</span></div>
      <div class="w-start-grid">${DESKTOP_APPS.map((id) => appTile(id)).join('')}</div>
      <div class="w-start-section"><span>Recommended</span></div>
      <div class="w-start-rec">
        ${DATA.projects.map((p) => `<button class="w-rec" data-open="projects" data-project="${p.id}">${tile(p.icon, p.color, 30, 8)}<div><div class="w-rec-name">${p.name}</div><div class="w-rec-sub">${p.tagline}</div></div></button>`).join('')}
        <button class="w-rec" data-open="resume">${tile('file', APPS.resume.color, 30, 8)}<div><div class="w-rec-name">Resume_Jaivardhan_Singh.pdf</div><div class="w-rec-sub">Recently updated</div></div></button>
      </div>
      <div class="w-start-foot">
        <button class="w-user" data-open="about">${avatarHTML(30)}<span>${DATA.name}</span></button>
        <div class="w-power-wrap"><button class="w-tb-btn w-power-btn" title="Power">${svg('power', 18)}</button>
          <div class="w-power-menu" hidden><button data-p="lock">${svg('lock', 15)} Lock</button><button data-p="restart">${svg('refresh', 15)} Restart</button><button data-p="shutdown">${svg('power', 15)} Shut down</button></div></div>
      </div>
    </div>`);
    bindOpens(f);
    const pm = f.querySelector('.w-power-menu');
    f.querySelector('.w-power-btn').onclick = (e) => { e.stopPropagation(); pm.hidden = !pm.hidden; };
    pm.querySelectorAll('[data-p]').forEach((b) => (b.onclick = () => power(b.dataset.p)));
    const input = f.querySelector('input');
    input.oninput = () => {
      const q = input.value.toLowerCase();
      f.querySelectorAll('.w-start-app').forEach((b) => (b.style.display = b.textContent.toLowerCase().includes(q) ? '' : 'none'));
      f.querySelectorAll('.w-rec').forEach((b) => (b.style.display = b.textContent.toLowerCase().includes(q) ? '' : 'none'));
    };
    input.onkeydown = (e) => { if (e.key === 'Enter') { const first = [...f.querySelectorAll('.w-start-app')].find((b) => b.style.display !== 'none'); first?.click(); } };
    return f;
  }

  function searchFlyout() {
    const f = h(`<div class="w-search">
      <div class="w-search-box big">${svg('search', 18)}<input placeholder="Search apps, projects, skills…"></div>
      <div class="w-search-results"></div>
    </div>`);
    const res = f.querySelector('.w-search-results'); const input = f.querySelector('input');
    const items = [
      ...DESKTOP_APPS.map((id) => ({ t: APPS[id].title, s: 'App', icon: APPS[id].icon, color: APPS[id].color, open: id })),
      ...DATA.projects.map((p) => ({ t: p.name, s: 'Project · ' + p.tagline, icon: p.icon, color: p.color, open: 'projects', project: p.id })),
      ...DATA.skills.flatMap((g) => g.items.map((i) => ({ t: i[0], s: 'Skill · ' + g.group, icon: 'cpu', color: APPS.skills.color, open: 'skills' }))),
    ];
    const render = (q = '') => {
      const list = items.filter((i) => (i.t + i.s).toLowerCase().includes(q)).slice(0, 9);
      res.innerHTML = `<div class="w-start-section"><span>${q ? 'Best match' : 'Top apps'}</span></div>` + list.map((i) => `<button class="w-rec" data-open="${i.open}" ${i.project ? `data-project="${i.project}"` : ''}>${tile(i.icon, i.color, 30, 8)}<div><div class="w-rec-name">${esc(i.t)}</div><div class="w-rec-sub">${esc(i.s)}</div></div></button>`).join('') + (list.length ? '' : '<div class="w-empty">No results</div>');
      bindOpens(res);
    };
    render(); input.oninput = () => render(input.value.toLowerCase().trim());
    input.onkeydown = (e) => { if (e.key === 'Enter') res.querySelector('.w-rec')?.click(); };
    return f;
  }

  function calendarFlyout() {
    const now = new Date(); const y = now.getFullYear(), m = now.getMonth();
    const first = new Date(y, m, 1).getDay(); const days = new Date(y, m + 1, 0).getDate();
    let cells = '';
    for (let i = 0; i < first; i++) cells += '<span></span>';
    for (let d = 1; d <= days; d++) cells += `<span class="${d === now.getDate() ? 'today' : ''}">${d}</span>`;
    return h(`<div class="w-cal">
      <div class="w-cal-head"><div class="w-cal-time">${fmtTime(now)}</div><div class="w-cal-date">${now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
      <div class="w-cal-month">${now.toLocaleDateString([], { month: 'long', year: 'numeric' })}</div>
      <div class="w-cal-grid"><b>Su</b><b>Mo</b><b>Tu</b><b>We</b><b>Th</b><b>Fr</b><b>Sa</b>${cells}</div>
      <div class="w-cal-note">${svg('graduation', 14)} Graduating May 2027 · available for SDE roles</div>
    </div>`);
  }

  function quickSettings() {
    const dark = Prefs.get('theme') === 'dark';
    const f = h(`<div class="w-quick">
      <div class="w-qs-grid">
        <button class="w-qs on" data-t="wifi">${svg('wifi', 18)}<span>Wi-Fi</span></button>
        <button class="w-qs on" data-t="bt">${svg('bluetooth', 18)}<span>Bluetooth</span></button>
        <button class="w-qs" data-t="air">${svg('airplane', 18)}<span>Airplane</span></button>
        <button class="w-qs ${desktop.classList.contains('night') ? 'on' : ''}" data-t="night">${svg('moon', 18)}<span>Night light</span></button>
        <button class="w-qs ${dark ? 'on' : ''}" data-t="dark">${svg('sparkles', 18)}<span>Dark mode</span></button>
        <button class="w-qs" data-t="settings">${svg('settings', 18)}<span>Settings</span></button>
      </div>
      <label class="w-slider">${svg('sun', 16)}<input type="range" min="30" max="100" value="${desktop.dataset.bright || 100}" data-s="bright"></label>
      <label class="w-slider">${svg('volume', 16)}<input type="range" min="0" max="100" value="${desktop.dataset.vol || 70}" data-s="vol"></label>
      <div class="w-qs-foot"><span>${svg('battery', 14)} 100%</span><span>JaiOS · Portfolio Edition</span></div>
    </div>`);
    f.querySelectorAll('.w-qs').forEach((b) => (b.onclick = () => {
      const t = b.dataset.t;
      if (t === 'settings') return openApp('settings');
      if (t === 'dark') { Prefs.set('theme', dark ? 'light' : 'dark'); return closeFlyout(); }
      b.classList.toggle('on');
      if (t === 'night') desktop.classList.toggle('night', b.classList.contains('on'));
      if (t === 'air') notify('System', b.classList.contains('on') ? 'Airplane mode on' : 'Airplane mode off', 'Just kidding — you are still connected to the internet.', 'airplane');
    }));
    f.querySelector('[data-s="bright"]').oninput = (e) => { desktop.dataset.bright = e.target.value; desktop.querySelector('.w-brightness').style.opacity = (100 - e.target.value) / 130; };
    f.querySelector('[data-s="vol"]').oninput = (e) => { desktop.dataset.vol = e.target.value; };
    return f;
  }

  function notifCenter() {
    const f = h(`<div class="w-notifs">
      <div class="w-notifs-head"><span>Notifications</span><button class="w-start-link" data-clear>Clear all</button></div>
      <div class="w-notifs-list">${notifications.length ? notifications.map((n) => `<div class="toast"><span>${tile(n.icon, ['#334155', '#64748b'], 34, 9)}</span><div><div class="toast-app">${n.app}</div><div class="toast-title">${n.title}</div><div class="toast-text">${n.text}</div></div></div>`).join('') : '<div class="w-empty">No new notifications</div>'}</div>
    </div>`);
    f.querySelector('[data-clear]').onclick = () => { notifications.length = 0; updateBadge(); f.querySelector('.w-notifs-list').innerHTML = '<div class="w-empty">No new notifications</div>'; };
    return f;
  }

  function widgetsPanel() {
    const p = DATA.projects[0];
    const f = h(`<div class="w-widgets">
      <div class="w-widget"><div class="w-widget-title"><span class="w-live-dot"></span> Availability</div><h3>Open to SDE roles</h3><p class="muted small">Internships & full-time · graduating May 2027 · ${DATA.location}</p><a class="btn btn-sm btn-primary" href="mailto:${DATA.email}">${svg('mail', 14)} Get in touch</a></div>
      <div class="w-widget"><div class="w-widget-title">${svg('rocket', 14)} Latest project</div><h3>${p.name}</h3><p class="muted small">${p.tagline}</p><div class="w-widget-row"><a class="btn btn-sm" href="${p.live}" target="_blank" rel="noopener">${svg('external', 14)} Live</a><a class="btn btn-sm" href="${p.github}" target="_blank" rel="noopener">${svg('github', 14)} Code</a></div></div>
      <div class="w-widget"><div class="w-widget-title">${svg('code', 14)} Coding</div><h3>200+ problems</h3><p class="muted small">C++ · LeetCode & GfG · Arrays, Graphs, Trees, DP</p><a class="btn btn-sm" href="${DATA.socials.leetcode}" target="_blank" rel="noopener">${svg('leetcode', 14)} LeetCode profile</a></div>
      <div class="w-widget"><div class="w-widget-title">${svg('briefcase', 14)} Experience</div><h3>2 internships</h3><p class="muted small">Timken India · Tata Cummins — production tools on live factory floors</p><button class="btn btn-sm" data-open="experience">${svg('arrowRight', 14)} View timeline</button></div>
    </div>`);
    bindOpens(f); return f;
  }

  /* ------------------------------------------------------ task view */
  function taskView() {
    closeFlyout();
    desktop.querySelector('.w-taskview')?.remove();
    const wins = [...wm.wins.values()];
    const tv = h(`<div class="w-taskview"><div class="w-tv-grid">${wins.length ? '' : '<div class="w-empty">No open windows</div>'}</div></div>`);
    const grid = tv.querySelector('.w-tv-grid');
    wins.forEach((w) => {
      const a = APPS[w.id];
      const card = h(`<div class="w-tv-card"><div class="w-tv-head">${tile(a.icon, a.color, 18, 5)}<span>${a.title}</span><button class="w-tv-close">${svg('x', 14)}</button></div><div class="w-tv-thumb"></div></div>`);
      const clone = w.el.cloneNode(true); clone.style.cssText = `left:0;top:0;width:${w.el.offsetWidth}px;height:${w.el.offsetHeight}px;transform:scale(.28);transform-origin:0 0;opacity:1;position:absolute;pointer-events:none;`; clone.classList.add('open');
      card.querySelector('.w-tv-thumb').appendChild(clone);
      card.onclick = () => { tv.remove(); if (w.min) wm.restore(w); else wm.focus(w); };
      card.querySelector('.w-tv-close').onclick = (e) => { e.stopPropagation(); wm.close(w); card.remove(); if (!wm.wins.size) tv.remove(); };
      grid.appendChild(card);
    });
    tv.onclick = (e) => { if (e.target === tv || e.target === grid) tv.remove(); };
    desktop.appendChild(tv); requestAnimationFrame(() => tv.classList.add('in'));
  }

  /* ----------------------------------------------------- context menu */
  function showContextMenu(x, y) {
    const ctx = desktop.querySelector('.w-ctx');
    ctx.innerHTML = `
      <button data-a="refresh">${svg('refresh', 15)} Refresh</button>
      <button data-a="about">${svg('user', 15)} About ${DATA.firstName}</button>
      <button data-a="terminal">${svg('terminal', 15)} Open in Terminal</button>
      <hr><button data-a="wallpaper">${svg('image', 15)} Next wallpaper</button>
      <button data-a="theme">${svg('moon', 15)} Toggle dark mode</button>
      <hr><button data-a="settings">${svg('settings', 15)} Personalize</button>`;
    ctx.hidden = false;
    ctx.style.left = Math.min(x, innerWidth - 220) + 'px'; ctx.style.top = Math.min(y, innerHeight - TASKBAR_H - 260) + 'px';
    ctx.querySelectorAll('button').forEach((b) => (b.onclick = () => {
      ctx.hidden = true; const a = b.dataset.a;
      if (a === 'refresh') { desktop.querySelectorAll('.w-icon').forEach((i) => { i.style.animation = 'none'; i.offsetHeight; i.style.animation = ''; }); }
      else if (a === 'wallpaper') Prefs.set('wallpaper', (Prefs.get('wallpaper') + 1) % WALLPAPERS.length);
      else if (a === 'theme') Prefs.set('theme', Prefs.get('theme') === 'dark' ? 'light' : 'dark');
      else openApp(a);
    }));
  }

  /* ---------------------------------------------------- notifications */
  function updateBadge() { const b = desktop.querySelector('.w-notif-count'); b.hidden = !notifications.length; b.textContent = notifications.length; }
  function notify(app, title, text, icon = 'bell') {
    notifications.unshift({ app, title, text, icon }); updateBadge();
    const t = h(`<div class="toast w-toast"><span>${tile(icon, ['#334155', '#64748b'], 34, 9)}</span><div><div class="toast-app">${app}</div><div class="toast-title">${title}</div><div class="toast-text">${text}</div></div><button class="w-toast-x">${svg('x', 14)}</button></div>`);
    desktop.querySelector('.w-toasts').appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    const dismiss = () => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); };
    t.querySelector('.w-toast-x').onclick = dismiss; setTimeout(dismiss, 7000);
  }

  /* ------------------------------------------------------------ power */
  function power(kind) {
    closeFlyout();
    if (kind === 'lock') { desktop.classList.add('locked'); lock(); return; }
    const el = h(`<div class="w-screen w-power-screen"><div class="w-spinner">${'<i></i>'.repeat(6)}</div><div>${kind === 'restart' ? 'Restarting' : 'Shutting down'}…</div></div>`);
    root.appendChild(el);
    setTimeout(() => {
      teardown();
      if (kind === 'restart') { start(root); return; }
      root.innerHTML = ''; root.className = 'win-root';
      const off = h(`<div class="w-screen w-off"><button class="w-power-on">${svg('power', 40)}</button><span>Click to power on</span></div>`);
      root.appendChild(off); off.querySelector('button').onclick = () => start(root);
    }, 1800);
  }
  function showScreensaver() {
    if (!desktop || desktop.querySelector('.w-saver')) return;
    const s = h(`<div class="w-saver"><div class="w-saver-orb" style="background:#3b82f6"></div><div class="w-saver-orb b" style="background:#8b5cf6"></div><div class="w-saver-clock">${fmtTime(new Date())}</div><div class="w-saver-sub">JaiOS · ${esc(DATA.name)} · move to wake</div></div>`);
    desktop.appendChild(s); s._t = setInterval(() => { s.querySelector('.w-saver-clock').textContent = fmtTime(new Date()); }, 1000);
  }
  function hideScreensaver() { const s = desktop?.querySelector('.w-saver'); if (!s) return; clearInterval(s._t); s.style.transition = 'opacity .5s'; s.style.opacity = '0'; setTimeout(() => s.remove(), 500); }

  function teardown() { clearInterval(clockTimer); fx?.destroy(); fx = null; stopIdle?.(); stopIdle = null; document.removeEventListener('keydown', onGlobalKey); Wallpaper.unmount(); desktop = null; wm = null; openFlyout = null; }

  return { start, openApp, closeApp, teardown, notify };
})();
