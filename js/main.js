/* ============================================================
   MAIN — picks the shell (Windows on desktop, Android on mobile)
   ============================================================ */
const OS = {
  mode: null,
  shell() { return this.mode === 'android' ? AndroidOS : WinOS; },

  detect() {
    const pref = Prefs.get('osMode');
    if (pref === 'windows' || pref === 'android') return pref;
    const param = new URLSearchParams(location.search).get('os');
    if (param === 'windows' || param === 'android') return param;
    const coarse = matchMedia('(pointer: coarse)').matches;
    return innerWidth < 820 || (coarse && innerWidth < 1100) ? 'android' : 'windows';
  },

  boot(mode) {
    if (this.mode) this.shell().teardown();
    this.mode = mode;
    document.body.dataset.os = mode;
    const root = document.getElementById('os-root');
    this.shell().start(root);
  },

  /* Called by Settings after the OS preference changes */
  applyMode() {
    if (Prefs.get('osMode') !== 'auto' && location.search) history.replaceState(null, '', location.pathname);
    const m = this.detect();
    if (m !== this.mode) this.boot(m);
  },

  openApp(id, opts) { this.shell().openApp(id, opts); },
  closeApp(id) { this.shell().closeApp(id); },
};

applyPrefs();
OS.boot(OS.detect());

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => OS.applyMode(), 350);
});

// Prevent pinch-zoom / pull-to-refresh interfering with the OS gestures
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => { if (e.scale && e.scale !== 1) e.preventDefault(); }, { passive: false });
