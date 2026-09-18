/* ============================================================
   ANDROID SHELL — boot, lock, launcher, app drawer, app stack,
   recents, notification shade, gesture handling
   ============================================================ */
const AndroidOS = (() => {
  let root, phone, clockTimer, fx = null;
  const stack = []; // open apps, last = foreground
  const HOME_APPS = ['about', 'projects', 'experience', 'skills', 'education', 'achievements', 'resume', 'settings', 'github', 'linkedin', 'leetcode'];
  const DOCK = ['about', 'projects', 'terminal', 'contact'];
  const notifications = [
    { app: 'JaiOS', icon: 'sparkles', color: ['#3b82f6', '#8b5cf6'], title: 'Welcome to JaiOS', text: `Swipe up for all apps. Tap an icon to explore ${DATA.firstName}'s work.`, open: 'about' },
    { app: 'Projects', icon: 'ticket', color: ['#f43f5e', '#f97316'], title: 'Bookify is live', text: 'Concurrent ticket booking with atomic seat holds — try it.', open: 'projects', project: 'bookify' },
    { app: 'LinkedIn', icon: 'linkedin', color: ['#0a66c2', '#38bdf8'], title: 'Open to work', text: 'Seeking SDE internships and full-time roles (2027).', open: 'linkedin' },
    { app: 'Terminal', icon: 'terminal', color: ['#111827', '#374151'], title: 'Try the terminal', text: 'Type "help" to list commands, or "neofetch" for fun.', open: 'terminal' },
  ];

  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const fmtTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  /* ------------------------------------------------------------ boot */
  function start(r) {
    root = r; root.className = 'android-root'; root.innerHTML = '';
    Wallpaper.mount(root);
    boot();
  }
  function boot() {
    const el = h(`<div class="a-screen a-boot">
      <div class="a-boot-word"><span>J</span><span>a</span><span>i</span><span class="a-boot-os">OS</span></div>
      <div class="a-boot-bar"><i></i></div>
      <div class="a-boot-sub">powered by ${DATA.firstName}</div>
    </div>`);
    root.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 500); lock(); }, 2600);
  }

  function lock() {
    const now = new Date();
    const el = h(`<div class="a-screen a-lock">
      <div class="a-status"><span>${fmtTime(now)}</span><span class="a-status-icons">${svg('signal', 14)}${svg('wifi', 14)}${svg('battery', 14)}</span></div>
      <div class="a-lock-clock">${fmtTime(now)}</div>
      <div class="a-lock-date">${now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}</div>
      <div class="a-lock-notifs">
        ${notifications.slice(0, 2).map((n) => `<div class="a-lock-card">${tile(n.icon, n.color, 32, 9)}<div><div class="a-lock-card-t">${n.title}</div><div class="a-lock-card-s">${n.text}</div></div></div>`).join('')}
      </div>
      <div class="a-lock-bottom"><span class="a-lock-hint">${svg('chevronUp', 18)} Swipe up to unlock</span><div class="a-lock-actions"><span>${svg('phone', 20)}</span><span>${svg('mail', 20)}</span></div></div>
    </div>`);
    root.appendChild(el);
    const stopParallax = FX.parallax(root, 16);
    const t = setInterval(() => { el.querySelector('.a-lock-clock').textContent = fmtTime(new Date()); }, 1000);
    let sy = null, moved = false;
    const unlock = () => { clearInterval(t); stopParallax(); FX.sfx.unlock(); el.style.transition = 'transform .45s cubic-bezier(.2,.8,.2,1), opacity .4s'; el.style.transform = 'translateY(-100%)'; el.style.opacity = '0'; setTimeout(() => el.remove(), 500); if (!phone) buildHome(); else phone.classList.remove('hidden'); };
    el.addEventListener('pointerdown', (e) => { sy = e.clientY; moved = false; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', (e) => { if (sy == null) return; const dy = Math.min(0, e.clientY - sy); if (dy < -4) moved = true; el.style.transform = `translateY(${dy * 0.6}px)`; });
    el.addEventListener('pointerup', (e) => { if (sy == null) return; const dy = e.clientY - sy; sy = null; if (dy < -70 || !moved) unlock(); else { el.style.transition = 'transform .3s'; el.style.transform = ''; setTimeout(() => (el.style.transition = ''), 300); } });
  }

  /* --------------------------------------------------------- launcher */
  function iconBtn(id, size = 58, i = 0) { const a = APPS[id]; return `<button class="a-icon" data-id="${id}" style="--i:${i}">${tile(a.icon, a.color, size, size / 2)}<span>${a.title}</span></button>`; }

  function buildHome() {
    phone = h(`<div class="a-phone">
      <div class="a-status"><span class="a-time"></span><span class="a-status-icons">${svg('signal', 14)}${svg('wifi', 14)}${svg('battery', 14)}</span></div>
      <div class="a-home">
        <div class="a-widget">
          <div class="a-widget-clock"><span class="a-time"></span></div>
          <div class="a-widget-date"></div>
          <div class="a-widget-chip"><span class="a-live-dot"></span> Open to SDE roles · ${DATA.location.split(',')[0]}</div>
        </div>
        <div class="a-grid a-home-grid">${HOME_APPS.map((id, i) => iconBtn(id, 58, i)).join('')}</div>
        <div class="a-search-pill" data-drawer>${svg('search', 18)}<span>Search apps</span>${avatarHTML(26)}</div>
        <div class="a-dock">${DOCK.map((id) => iconBtn(id, 54).replace('<span>' + APPS[id].title + '</span>', '')).join('')}</div>
      </div>
      <div class="a-drawer">
        <div class="a-drawer-handle"><i></i></div>
        <div class="a-search-pill a-drawer-search">${svg('search', 18)}<input placeholder="Search apps"></div>
        <div class="a-grid a-drawer-grid">${DESKTOP_APPS.map((id) => iconBtn(id)).join('')}</div>
      </div>
      <div class="a-apps"></div>
      <div class="a-recents" hidden></div>
      <div class="a-shade">
        <div class="a-shade-panel">
          <div class="a-shade-top"><span class="a-time"></span><span>${svg('battery', 14)} 100%</span></div>
          <div class="a-tiles">
            <button class="a-tile on" data-t="wifi">${svg('wifi', 20)}<span>Wi-Fi</span></button>
            <button class="a-tile on" data-t="bt">${svg('bluetooth', 20)}<span>Bluetooth</span></button>
            <button class="a-tile ${Prefs.get('theme') === 'dark' ? 'on' : ''}" data-t="dark">${svg('moon', 20)}<span>Dark theme</span></button>
            <button class="a-tile" data-t="night">${svg('sun', 20)}<span>Night light</span></button>
            <button class="a-tile" data-t="air">${svg('airplane', 20)}<span>Airplane</span></button>
            <button class="a-tile" data-t="settings">${svg('settings', 20)}<span>Settings</span></button>
          </div>
          <label class="a-bright">${svg('sun', 16)}<input type="range" min="30" max="100" value="100"></label>
          <div class="a-notif-list">${notifications.map((n, i) => `<button class="a-notif" data-n="${i}">${tile(n.icon, n.color, 30, 9)}<div><div class="a-notif-app">${n.app}</div><div class="a-notif-t">${n.title}</div><div class="a-notif-s">${n.text}</div></div></button>`).join('')}</div>
          <div class="a-shade-foot"><button data-clear>Clear all</button><button data-settings>${svg('settings', 16)}</button></div>
        </div>
      </div>
      <div class="a-night"></div><div class="a-brightness"></div>
      <div class="a-toasts"></div>
      <div class="a-nav"><button data-nav="back" aria-label="Back">${svg('back', 22)}</button><button data-nav="home" aria-label="Home">${svg('circle', 20)}</button><button data-nav="recents" aria-label="Recents">${svg('recents', 18)}</button></div>
    </div>`);
    root.appendChild(phone);
    fx = FX.particles(phone, { count: 40, maxDist: 110, speed: .18 });
    FX.ripple(phone, '.a-icon, .a-tile, .a-notif, .a-nav button, .btn, .a-appbar-back, .a-search-pill');
    FX.hoverFX(phone, '.card, .stat, .project-card, .ach-card');

    // clock
    const tick = () => { const d = new Date(); phone.querySelectorAll('.a-time').forEach((x) => (x.textContent = fmtTime(d))); phone.querySelector('.a-widget-date').textContent = d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }); };
    tick(); clockTimer = setInterval(tick, 1000);

    // icons
    phone.querySelectorAll('.a-icon').forEach((b) => (b.onclick = () => openApp(b.dataset.id, undefined, b)));
    phone.querySelector('[data-drawer]').onclick = () => setDrawer(true);
    const dInput = phone.querySelector('.a-drawer-search input');
    dInput.oninput = () => { const q = dInput.value.toLowerCase(); phone.querySelectorAll('.a-drawer-grid .a-icon').forEach((b) => (b.style.display = b.textContent.toLowerCase().includes(q) ? '' : 'none')); };

    // nav
    phone.querySelectorAll('[data-nav]').forEach((b) => (b.onclick = () => nav(b.dataset.nav)));

    // shade actions
    phone.querySelectorAll('.a-tile').forEach((b) => (b.onclick = () => {
      const t = b.dataset.t;
      if (t === 'settings') { setShade(false); return openApp('settings'); }
      if (t === 'dark') { Prefs.set('theme', Prefs.get('theme') === 'dark' ? 'light' : 'dark'); b.classList.toggle('on', Prefs.get('theme') === 'dark'); return; }
      b.classList.toggle('on');
      if (t === 'night') phone.classList.toggle('night', b.classList.contains('on'));
      if (t === 'air') toast(b.classList.contains('on') ? 'Airplane mode on (not really)' : 'Airplane mode off');
    }));
    phone.querySelector('.a-bright input').oninput = (e) => { phone.querySelector('.a-brightness').style.opacity = (100 - e.target.value) / 130; };
    phone.querySelectorAll('.a-notif').forEach((b) => (b.onclick = () => { const n = notifications[+b.dataset.n]; setShade(false); openApp(n.open, n.project ? { projectId: n.project } : undefined); }));
    phone.querySelector('[data-clear]').onclick = () => { phone.querySelector('.a-notif-list').innerHTML = '<div class="a-empty">No notifications</div>'; };
    phone.querySelector('[data-settings]').onclick = () => { setShade(false); openApp('settings'); };

    gestures();
    requestAnimationFrame(() => phone.classList.add('ready'));
    setTimeout(() => toast(`Welcome! Swipe up for all apps`), 1200);
  }

  /* --------------------------------------------------------- gestures */
  function gestures() {
    const home = phone.querySelector('.a-home'), drawer = phone.querySelector('.a-drawer'), status = phone.querySelector('.a-status'), shade = phone.querySelector('.a-shade');
    // swipe up on home → drawer
    drag(home, { onMove: (dx, dy) => { if (dy < 0) drawer.style.transform = `translateY(calc(100% + ${Math.max(dy, -260)}px))`; }, onEnd: (dx, dy) => { drawer.style.transform = ''; if (dy < -60) setDrawer(true); } });
    // swipe down on drawer (when scrolled to top) → close
    drag(drawer, { when: () => drawer.scrollTop <= 0, onMove: (dx, dy) => { if (dy > 0) drawer.style.transform = `translateY(${dy}px)`; }, onEnd: (dx, dy) => { drawer.style.transform = ''; if (dy > 80) setDrawer(false); } });
    // status bar → shade
    status.onclick = () => setShade(true);
    drag(status, { onMove: (dx, dy) => { if (dy > 0) { shade.classList.add('dragging'); shade.style.transform = `translateY(calc(-100% + ${Math.min(dy, 400)}px))`; } }, onEnd: (dx, dy) => { shade.classList.remove('dragging'); shade.style.transform = ''; if (dy > 40) setShade(true); } });
    // swipe up on shade → close; tap on scrim → close
    drag(shade, { onMove: (dx, dy) => { if (dy < 0) shade.style.transform = `translateY(${dy}px)`; }, onEnd: (dx, dy) => { shade.style.transform = ''; if (dy < -60) setShade(false); } });
    shade.addEventListener('click', (e) => { if (e.target === shade) setShade(false); });
  }
  function drag(el, { when = () => true, onMove, onEnd }) {
    let sx, sy, active = false, id;
    el.addEventListener('pointerdown', (e) => { if (!when() || e.target.closest('input,button,a')) return; sx = e.clientX; sy = e.clientY; active = true; id = e.pointerId; });
    el.addEventListener('pointermove', (e) => { if (!active) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { try { el.setPointerCapture(id); } catch (_) {} } onMove(dx, dy); });
    const end = (e) => { if (!active) return; active = false; onEnd(e.clientX - sx, e.clientY - sy); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }

  function setDrawer(on) { phone.classList.toggle('drawer', on); if (on) setTimeout(() => phone.querySelector('.a-drawer-search input')?.blur(), 0); }
  function setShade(on) { phone.classList.toggle('shade', on); }
  function setRecents(on) {
    const r = phone.querySelector('.a-recents');
    if (!on) { r.classList.remove('in'); setTimeout(() => { r.hidden = true; r.innerHTML = ''; }, 250); phone.classList.remove('recents'); return; }
    r.innerHTML = stack.length ? '' : '<div class="a-empty a-recents-empty">No recent apps</div>';
    [...stack].reverse().forEach((w) => {
      const a = APPS[w.id];
      const card = h(`<div class="a-rc"><div class="a-rc-head">${tile(a.icon, a.color, 22, 7)}<span>${a.title}</span><button class="a-rc-x">${svg('x', 16)}</button></div><div class="a-rc-thumb"></div></div>`);
      const clone = w.el.cloneNode(true); clone.className = 'a-app in a-app-clone'; clone.style.cssText = `transition:none;transform:scale(.7);transform-origin:0 0;width:${phone.clientWidth}px;height:${phone.clientHeight}px;position:absolute;left:0;top:0;pointer-events:none;`;
      card.querySelector('.a-rc-thumb').appendChild(clone);
      card.querySelector('.a-rc-thumb').onclick = () => { setRecents(false); openApp(w.id); };
      card.querySelector('.a-rc-x').onclick = () => { closeApp(w.id, true); card.remove(); if (!stack.length) setRecents(false); };
      // swipe up to dismiss
      let sy = null; card.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; sy = e.clientY; card.setPointerCapture(e.pointerId); });
      card.addEventListener('pointermove', (e) => { if (sy == null) return; const dy = Math.min(0, e.clientY - sy); card.style.transform = `translateY(${dy}px)`; card.style.opacity = 1 + dy / 300; });
      card.addEventListener('pointerup', (e) => { if (sy == null) return; const dy = e.clientY - sy; sy = null; if (dy < -100) { closeApp(w.id, true); card.remove(); if (!stack.length) setRecents(false); } else { card.style.transform = ''; card.style.opacity = ''; } });
      r.appendChild(card);
    });
    r.hidden = false; phone.classList.add('recents'); requestAnimationFrame(() => r.classList.add('in'));
    if (r.querySelector('.a-rc')) r.scrollLeft = 0;
  }

  function nav(kind) {
    if (kind === 'back') {
      if (phone.classList.contains('shade')) return setShade(false);
      if (phone.classList.contains('recents')) return setRecents(false);
      if (phone.classList.contains('drawer')) return setDrawer(false);
      const top = stack[stack.length - 1]; if (top && !top.bg) return closeApp(top.id);
      return;
    }
    if (kind === 'home') { setShade(false); setDrawer(false); setRecents(false); stack.forEach((w) => background(w)); return; }
    if (kind === 'recents') { setShade(false); setDrawer(false); setRecents(!phone.classList.contains('recents')); }
  }

  /* ------------------------------------------------------------- apps */
  function syncNav() { phone.classList.toggle('inapp', stack.some((w) => !w.bg)); }
  function background(w) { if (w.bg) return; w.bg = true; setTimeout(syncNav, 0); w.el.classList.remove('in'); w.el.classList.add('bg'); setTimeout(() => { if (w.bg) w.el.style.display = 'none'; }, 280); }

  function openApp(id, opts = {}, fromEl) {
    const a = APPS[id]; if (!a) return;
    setDrawer(false); setShade(false);
    if (a.external) { window.open(a.external, '_blank', 'noopener'); return; }
    FX.sfx.open();
    const layer = phone.querySelector('.a-apps');
    let w = stack.find((x) => x.id === id);
    if (w) {
      stack.splice(stack.indexOf(w), 1); stack.push(w); layer.appendChild(w.el);
      w.bg = false; w.el.style.display = ''; w.el.getBoundingClientRect(); w.el.classList.remove('bg'); w.el.classList.add('in');
      if (opts.projectId) a.mount?.(w.body, 'android', opts);
      syncNav(); return;
    }
    const el = h(`<div class="a-app" data-id="${id}">
      <div class="a-appbar"><button class="a-appbar-back">${svg('arrowLeft', 22)}</button>${tile(a.icon, a.color, 26, 8)}<span class="a-appbar-title">${a.title}</span></div>
      <div class="a-app-body"></div>
    </div>`);
    const body = el.querySelector('.a-app-body');
    body.innerHTML = a.render('android');
    w = { id, el, body, bg: false }; stack.push(w); layer.appendChild(el);
    a.mount?.(body, 'android', opts);
    el.querySelector('.a-appbar-back').onclick = () => closeApp(id);
    syncNav();
    if (fromEl) { const r = fromEl.getBoundingClientRect(), pr = phone.getBoundingClientRect(); el.style.transformOrigin = `${r.left - pr.left + r.width / 2}px ${r.top - pr.top + r.height / 2}px`; }
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  }

  function closeApp(id, silent = false) {
    const w = stack.find((x) => x.id === id); if (!w) return;
    stack.splice(stack.indexOf(w), 1); syncNav();
    if (silent) { w.el.remove(); return; }
    FX.sfx.close();
    w.el.classList.remove('in'); w.el.classList.add('out');
    setTimeout(() => w.el.remove(), 300);
  }

  function toast(text) {
    const t = h(`<div class="a-toast">${text}</div>`);
    phone.querySelector('.a-toasts').appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 3200);
  }

  function teardown() { clearInterval(clockTimer); fx?.destroy(); fx = null; Wallpaper.unmount(); phone = null; stack.length = 0; }

  return { start, openApp, closeApp, teardown, toast };
})();
