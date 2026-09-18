/* ============================================================
   APPS — shared app registry. Each app renders HTML for both
   the Windows (desktop) and Android (mobile) shells.
   ============================================================ */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const PREFS_KEY = 'jaios.prefs';
const Prefs = {
  data: Object.assign(
    { theme: 'dark', accent: '#3b82f6', wallpaper: 0, osMode: 'auto', sound: true },
    JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')
  ),
  get(k) { return this.data[k]; },
  set(k, v) { this.data[k] = v; localStorage.setItem(PREFS_KEY, JSON.stringify(this.data)); applyPrefs(); },
};
function applyPrefs() {
  document.documentElement.dataset.theme = Prefs.get('theme');
  document.documentElement.style.setProperty('--accent', Prefs.get('accent'));
  if (typeof Wallpaper !== 'undefined') Wallpaper.setPreset(Prefs.get('wallpaper'));
}

const WALLPAPERS = [
  { name: 'Bloom', colors: ['#1e3a8a', '#7c3aed', '#0ea5e9', '#ec4899'], base: '#0b1020' },
  { name: 'Aurora', colors: ['#065f46', '#0d9488', '#22d3ee', '#a3e635'], base: '#041418' },
  { name: 'Sunset', colors: ['#7c2d12', '#ea580c', '#f43f5e', '#facc15'], base: '#1a0a0a' },
  { name: 'Nebula', colors: ['#312e81', '#db2777', '#6d28d9', '#0891b2'], base: '#0a0614' },
];
const ACCENTS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#ef4444', '#eab308'];

function avatarHTML(size = 96) {
  if (DATA.avatar) return `<img class="avatar" src="${DATA.avatar}" alt="${esc(DATA.name)}" style="width:${size}px;height:${size}px">`;
  return `<span class="avatar avatar-initials" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px">${DATA.initials}</span>`;
}

function socialButtons(cls = '') {
  return `
    <a class="btn ${cls}" href="${DATA.socials.github}" target="_blank" rel="noopener">${svg('github', 18)} GitHub</a>
    <a class="btn ${cls}" href="${DATA.socials.linkedin}" target="_blank" rel="noopener">${svg('linkedin', 18)} LinkedIn</a>
    <a class="btn ${cls}" href="${DATA.socials.leetcode}" target="_blank" rel="noopener">${svg('leetcode', 18)} LeetCode</a>
    <a class="btn ${cls}" href="mailto:${DATA.email}">${svg('mail', 18)} Email</a>`;
}

/* --------------------------- APP DEFINITIONS --------------------------- */
const APPS = {
  about: {
    title: 'About Me', icon: 'user', color: ['#3b82f6', '#8b5cf6'], w: 860, h: 600,
    render() {
      return `
      <div class="app app-about">
        <div class="about-hero">
          <div class="about-avatar-wrap"><i class="orbit o1"></i><i class="orbit o2"></i>${avatarHTML(120)}<span class="status-dot" title="Open to work"></span></div>
          <div class="about-head">
            <h1 class="about-name">${esc(DATA.name)}</h1>
            <div class="about-role"><span class="typewriter" data-words='${JSON.stringify(DATA.taglines)}'></span><span class="caret">|</span></div>
            <div class="about-meta">${svg('pin', 16)} ${esc(DATA.location)} &nbsp;·&nbsp; ${svg('graduation', 16)} VIT Vellore '27</div>
            <div class="about-actions">${socialButtons()}</div>
          </div>
        </div>
        <div class="stats-row">
          ${DATA.stats.map((s) => `<div class="stat reveal"><div class="stat-value"><span class="counter" data-to="${s.value}">0</span>${s.suffix}</div><div class="stat-label">${s.label}</div></div>`).join('')}
        </div>
        <div class="card reveal"><h3>${svg('info', 18)} Summary</h3><p class="lead">${esc(DATA.summary)}</p></div>
        <div class="two-col">
          <div class="card reveal"><h3>${svg('zap', 18)} What I do</h3>
            <ul class="check-list">
              <li>Full-stack web apps with Next.js App Router, Route Handlers and MongoDB</li>
              <li>Backend correctness: atomic writes, transactions, JWT auth, TTL-based state</li>
              <li>Industrial automation tooling in VB.NET + Oracle SQL</li>
              <li>Problem solving in C++ — 200+ DSA problems</li>
            </ul></div>
          <div class="card reveal"><h3>${svg('rocket', 18)} Currently</h3>
            <ul class="check-list">
              <li>B.Tech CSE @ VIT Vellore (2023 – 2027)</li>
              <li>Building concurrency-safe booking systems</li>
              <li>Exploring AI-driven products (Gemini APIs)</li>
              <li><strong>Seeking SDE internships / full-time roles</strong></li>
            </ul></div>
        </div>
      </div>`;
    },
    mount(el) { runTypewriter(el); runCounters(el); runReveal(el); },
  },

  projects: {
    title: 'Projects', icon: 'folder', color: ['#f59e0b', '#ef4444'], w: 940, h: 620,
    render(ctx) {
      return `
      <div class="app app-projects" data-ctx="${ctx}">
        <div class="explorer">
          <aside class="explorer-side">
            <div class="side-title">Quick access</div>
            <button class="side-item active" data-filter="all">${svg('grid', 16)} All projects</button>
            <button class="side-item" data-filter="live">${svg('globe', 16)} Live deployments</button>
            <button class="side-item" data-filter="github">${svg('github', 16)} Source code</button>
            <div class="side-title">Shortcuts</div>
            <a class="side-item" href="${DATA.socials.github}" target="_blank" rel="noopener">${svg('external', 16)} GitHub profile</a>
          </aside>
          <section class="explorer-main">
            <div class="explorer-crumb">${svg('folder', 16)} <span>This PC</span> › <span>Jaivardhan</span> › <span class="crumb-current">Projects</span></div>
            <div class="project-grid">
              ${DATA.projects.map((p, i) => `
                <button class="project-card reveal" data-id="${p.id}" style="--d:${i * 80}ms">
                  ${tile(p.icon, p.color, 56)}
                  <div class="pc-body"><div class="pc-name">${esc(p.name)}</div><div class="pc-tag">${esc(p.tagline)}</div>
                  <div class="chips">${p.stack.slice(0, 3).map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div></div>
                  <span class="pc-arrow">${svg('chevronRight', 18)}</span>
                </button>`).join('')}
            </div>
          </section>
          <section class="project-detail" hidden></section>
        </div>
      </div>`;
    },
    mount(el, ctx, opts = {}) {
      const grid = el.querySelector('.explorer-main');
      const detail = el.querySelector('.project-detail');
      const show = (id) => {
        const p = DATA.projects.find((x) => x.id === id); if (!p) return;
        detail.innerHTML = `
          <button class="btn btn-ghost back-btn">${svg('arrowLeft', 16)} Back to projects</button>
          <div class="pd-head">${tile(p.icon, p.color, 72)}<div><h2>${esc(p.name)}</h2><div class="pd-tag">${esc(p.tagline)}</div>
            <div class="chips">${p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div></div></div>
          <div class="pd-actions">
            <a class="btn btn-primary" href="${p.live}" target="_blank" rel="noopener">${svg('external', 16)} Open live app</a>
            <a class="btn" href="${p.github}" target="_blank" rel="noopener">${svg('github', 16)} View source</a>
          </div>
          <div class="card"><h3>${svg('layers', 18)} What I built</h3><ul class="bullet-list">${p.points.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
        grid.hidden = true; detail.hidden = false; detail.scrollTop = 0;
        detail.querySelector('.back-btn').onclick = () => { detail.hidden = true; grid.hidden = false; };
      };
      el.querySelectorAll('.project-card').forEach((c) => (c.onclick = () => show(c.dataset.id)));
      el.querySelectorAll('.side-item[data-filter]').forEach((b) => (b.onclick = () => {
        el.querySelectorAll('.side-item').forEach((x) => x.classList.remove('active')); b.classList.add('active');
        detail.hidden = true; grid.hidden = false;
      }));
      runReveal(el);
      if (opts.projectId) show(opts.projectId);
    },
  },

  experience: {
    title: 'Experience', icon: 'briefcase', color: ['#0ea5e9', '#6366f1'], w: 820, h: 600,
    render() {
      return `
      <div class="app app-experience">
        <h1 class="page-title">${svg('briefcase', 22)} Work Experience</h1>
        <div class="timeline">
          ${DATA.experience.map((e, i) => `
          <div class="tl-item reveal" style="--d:${i * 120}ms">
            <div class="tl-dot"></div>
            <div class="card">
              <div class="tl-head"><div><h3>${esc(e.title)}</h3><div class="tl-company">${esc(e.company)}</div></div><span class="badge">${esc(e.period)}</span></div>
              <div class="chips">${e.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
              <ul class="bullet-list">${e.points.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
            </div>
          </div>`).join('')}
        </div>
      </div>`;
    },
    mount(el) { runReveal(el); },
  },

  skills: {
    title: 'Skills', icon: 'cpu', color: ['#10b981', '#06b6d4'], w: 900, h: 620,
    render() {
      return `
      <div class="app app-skills">
        <div class="tm-tabs"><button class="tm-tab active" data-tab="perf">Performance</button><button class="tm-tab" data-tab="proc">Processes</button></div>
        <div class="tm-pane" data-pane="perf">
          <div class="skills-grid">
          ${DATA.skills.map((g, gi) => `
            <div class="card skill-group reveal" style="--d:${gi * 70}ms"><h3>${esc(g.group)}</h3>
              ${g.items.map(([n, v]) => `
                <div class="skill-row"><div class="skill-name"><span>${esc(n)}</span><span class="skill-pct">${v}%</span></div>
                <div class="bar"><div class="bar-fill" data-w="${v}"></div></div></div>`).join('')}
            </div>`).join('')}
          </div>
        </div>
        <div class="tm-pane" data-pane="proc" hidden>
          <table class="proc-table"><thead><tr><th>Name</th><th>Status</th><th>CPU</th><th>Memory</th></tr></thead><tbody>
            ${DATA.skills.flatMap((g) => g.items.map(([n, v]) => `<tr><td>${esc(n)}</td><td><span class="dot-ok"></span> Running</td><td>${(v / 4).toFixed(1)}%</td><td>${(v * 3.7).toFixed(0)} MB</td></tr>`)).join('')}
          </tbody></table>
        </div>
      </div>`;
    },
    mount(el) {
      el.querySelectorAll('.tm-tab').forEach((t) => (t.onclick = () => {
        el.querySelectorAll('.tm-tab').forEach((x) => x.classList.remove('active')); t.classList.add('active');
        el.querySelectorAll('.tm-pane').forEach((p) => (p.hidden = p.dataset.pane !== t.dataset.tab));
      }));
      runReveal(el);
      setTimeout(() => el.querySelectorAll('.bar-fill').forEach((b) => (b.style.width = b.dataset.w + '%')), 150);
    },
  },

  education: {
    title: 'Education', icon: 'graduation', color: ['#8b5cf6', '#ec4899'], w: 760, h: 560,
    render() {
      return `
      <div class="app app-education">
        <h1 class="page-title">${svg('graduation', 22)} Education</h1>
        ${DATA.education.map((e, i) => `
          <div class="card edu-card reveal" style="--d:${i * 100}ms">
            <div class="edu-icon">${tile('book', i === 0 ? ['#8b5cf6', '#ec4899'] : ['#475569', '#64748b'], 48)}</div>
            <div class="edu-body"><h3>${esc(e.school)}</h3><div class="edu-degree">${esc(e.degree)}</div>${e.details ? `<p class="muted">${esc(e.details)}</p>` : ''}</div>
            <div class="edu-side"><span class="badge badge-accent">${esc(e.score)}</span><span class="muted small">${esc(e.period)}</span></div>
          </div>`).join('')}
      </div>`;
    },
    mount(el) { runReveal(el); },
  },

  achievements: {
    title: 'Achievements', icon: 'trophy', color: ['#f59e0b', '#f97316'], w: 760, h: 520,
    render() {
      return `
      <div class="app app-achievements">
        <h1 class="page-title">${svg('trophy', 22)} Achievements</h1>
        <div class="ach-grid">
        ${DATA.achievements.map((a, i) => `
          <div class="card ach-card reveal" style="--d:${i * 100}ms">${tile(a.icon, a.color, 56)}
            <h3>${esc(a.title)}</h3><p>${esc(a.text)}</p>
            ${a.link ? `<a class="btn btn-sm" href="${a.link}" target="_blank" rel="noopener">${svg('external', 14)} View profile</a>` : ''}
          </div>`).join('')}
        </div>
      </div>`;
    },
    mount(el) { runReveal(el); },
  },

  resume: {
    title: 'Resume', icon: 'file', color: ['#ef4444', '#f97316'], w: 900, h: 700,
    render(ctx) {
      const isMobile = ctx === 'android';
      return `
      <div class="app app-resume">
        <div class="resume-bar">
          <a class="btn btn-primary" href="${DATA.resumeFile}" download>${svg('download', 16)} Download PDF</a>
          <a class="btn" href="${DATA.resumeFile}" target="_blank" rel="noopener">${svg('external', 16)} Open in new tab</a>
        </div>
        ${isMobile ? renderResumeHTML() : `<iframe class="resume-frame" src="${DATA.resumeFile}#toolbar=0&view=FitH" title="Resume"></iframe>`}
      </div>`;
    },
  },

  contact: {
    title: 'Contact', icon: 'mail', color: ['#06b6d4', '#3b82f6'], w: 820, h: 580,
    render() {
      return `
      <div class="app app-contact">
        <div class="contact-grid">
          <div class="card contact-info">
            <h2>Let's build something.</h2>
            <p class="muted">I'm open to SDE internships and full-time roles. Reach out — I usually reply within a day.</p>
            <a class="contact-line" href="mailto:${DATA.email}">${svg('mail', 18)} ${DATA.email}</a>
            <a class="contact-line" href="tel:${DATA.phone.replace(/\s/g, '')}">${svg('phone', 18)} ${DATA.phone}</a>
            <div class="contact-line">${svg('pin', 18)} ${esc(DATA.location)}</div>
            <div class="about-actions">${socialButtons('btn-sm')}</div>
          </div>
          <form class="card contact-form">
            <h3>${svg('send', 18)} Send a message</h3>
            <label>Your name<input name="name" required placeholder="Jane Doe"></label>
            <label>Your email<input name="email" type="email" required placeholder="jane@company.com"></label>
            <label>Message<textarea name="message" rows="5" required placeholder="Hi Jaivardhan, ..."></textarea></label>
            <button class="btn btn-primary" type="submit">${svg('send', 16)} Send via email</button>
            <p class="small muted">Opens your mail client with the message pre-filled.</p>
          </form>
        </div>
      </div>`;
    },
    mount(el) {
      el.querySelector('.contact-form').onsubmit = (e) => {
        e.preventDefault();
        const f = new FormData(e.target);
        const subject = encodeURIComponent(`Portfolio contact from ${f.get('name')}`);
        const body = encodeURIComponent(`${f.get('message')}\n\n— ${f.get('name')} (${f.get('email')})`);
        location.href = `mailto:${DATA.email}?subject=${subject}&body=${body}`;
      };
    },
  },

  terminal: {
    title: 'Terminal', icon: 'terminal', color: ['#111827', '#374151'], w: 760, h: 480,
    render() {
      return `
      <div class="app app-terminal">
        <div class="term-out"></div>
        <div class="term-line"><span class="term-prompt">jai@portfolio:~$</span><input class="term-in" autocomplete="off" spellcheck="false" autocapitalize="off"></div>
      </div>`;
    },
    mount(el) { setupTerminal(el); },
  },

  settings: {
    title: 'Settings', icon: 'settings', color: ['#64748b', '#94a3b8'], w: 820, h: 600,
    render() {
      const p = Prefs.data;
      return `
      <div class="app app-settings">
        <h1 class="page-title">${svg('settings', 22)} Settings</h1>
        <div class="card"><h3>${svg('image', 18)} Personalization</h3>
          <div class="setting-row"><span>Theme</span>
            <div class="seg"><button class="seg-btn ${p.theme === 'dark' ? 'active' : ''}" data-theme="dark">${svg('moon', 14)} Dark</button><button class="seg-btn ${p.theme === 'light' ? 'active' : ''}" data-theme="light">${svg('sun', 14)} Light</button></div></div>
          <div class="setting-row"><span>Accent color</span><div class="swatches">${ACCENTS.map((c) => `<button class="swatch ${c === p.accent ? 'active' : ''}" data-accent="${c}" style="background:${c}"></button>`).join('')}</div></div>
          <div class="setting-row"><span>Wallpaper</span><div class="wp-list">${WALLPAPERS.map((w, i) => `<button class="wp ${i === p.wallpaper ? 'active' : ''}" data-wp="${i}" style="background:linear-gradient(135deg,${w.colors.join(',')})"><span>${w.name}</span></button>`).join('')}</div></div>
        </div>
        <div class="card"><h3>${svg('monitor', 18)} System</h3>
          <div class="setting-row"><span>OS experience</span>
            <div class="seg"><button class="seg-btn ${p.osMode === 'auto' ? 'active' : ''}" data-os="auto">Auto</button><button class="seg-btn ${p.osMode === 'windows' ? 'active' : ''}" data-os="windows">${svg('monitor', 14)} Windows</button><button class="seg-btn ${p.osMode === 'android' ? 'active' : ''}" data-os="android">${svg('smartphone', 14)} Android</button></div></div>
          <div class="setting-row"><span>Startup sound</span><label class="switch"><input type="checkbox" data-sound ${p.sound ? 'checked' : ''}><span></span></label></div>
          <div class="setting-row"><span>Reset everything</span><button class="btn btn-sm" data-reset>${svg('refresh', 14)} Reset</button></div>
        </div>
        <div class="card about-os"><h3>${svg('info', 18)} About</h3>
          <p class="muted">JaiOS · Portfolio Edition · v2.0<br>Built with vanilla HTML, CSS and JavaScript. No frameworks, no build step.<br>Designed & developed by ${esc(DATA.name)}.</p></div>
      </div>`;
    },
    mount(el) {
      const activate = (sel, btn) => { el.querySelectorAll(sel).forEach((x) => x.classList.remove('active')); btn.classList.add('active'); };
      el.querySelectorAll('[data-theme]').forEach((b) => (b.onclick = () => { Prefs.set('theme', b.dataset.theme); activate('[data-theme]', b); }));
      el.querySelectorAll('[data-accent]').forEach((b) => (b.onclick = () => { Prefs.set('accent', b.dataset.accent); activate('[data-accent]', b); }));
      el.querySelectorAll('[data-wp]').forEach((b) => (b.onclick = () => { Prefs.set('wallpaper', +b.dataset.wp); activate('[data-wp]', b); }));
      el.querySelectorAll('[data-os]').forEach((b) => (b.onclick = () => { Prefs.set('osMode', b.dataset.os); activate('[data-os]', b); OS.applyMode(); }));
      el.querySelector('[data-sound]').onchange = (e) => Prefs.set('sound', e.target.checked);
      el.querySelector('[data-reset]').onclick = () => { localStorage.removeItem(PREFS_KEY); location.href = location.pathname; };
    },
  },

  github: { title: 'GitHub', icon: 'github', color: ['#111827', '#4b5563'], external: DATA.socials.github },
  linkedin: { title: 'LinkedIn', icon: 'linkedin', color: ['#0a66c2', '#38bdf8'], external: DATA.socials.linkedin },
  leetcode: { title: 'LeetCode', icon: 'leetcode', color: ['#f59e0b', '#fbbf24'], external: DATA.socials.leetcode },
};

const DESKTOP_APPS = ['about', 'projects', 'experience', 'skills', 'education', 'achievements', 'resume', 'contact', 'terminal', 'settings', 'github', 'linkedin', 'leetcode'];

/* --------------------------- helpers --------------------------- */
function renderResumeHTML() {
  return `
  <div class="resume-doc">
    <h2>${esc(DATA.name)}</h2>
    <p class="muted small">${esc(DATA.location)} · ${esc(DATA.phone)} · ${esc(DATA.email)}</p>
    <h4>Summary</h4><p>${esc(DATA.summary)}</p>
    <h4>Education</h4>${DATA.education.map((e) => `<p><strong>${esc(e.school)}</strong><br>${esc(e.degree)} · ${esc(e.score)}<br><span class="muted small">${esc(e.period)}</span></p>`).join('')}
    <h4>Experience</h4>${DATA.experience.map((e) => `<p><strong>${esc(e.title)} — ${esc(e.company)}</strong><br><span class="muted small">${esc(e.period)}</span></p><ul class="bullet-list">${e.points.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`).join('')}
    <h4>Projects</h4>${DATA.projects.map((p) => `<p><strong>${esc(p.name)}</strong> — ${esc(p.tagline)}</p><ul class="bullet-list">${p.points.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`).join('')}
    <h4>Skills</h4>${DATA.skills.map((g) => `<p><strong>${esc(g.group)}:</strong> ${g.items.map((i) => esc(i[0])).join(', ')}</p>`).join('')}
    <h4>Achievements</h4><ul class="bullet-list">${DATA.achievements.map((a) => `<li><strong>${esc(a.title)}</strong> — ${esc(a.text)}</li>`).join('')}</ul>
  </div>`;
}

function runReveal(el) {
  const items = el.querySelectorAll('.reveal');
  items.forEach((it, i) => setTimeout(() => it.classList.add('in'), 40 + i * 60));
}
function runCounters(el) {
  el.querySelectorAll('.counter').forEach((c) => {
    const to = parseFloat(c.dataset.to); const dec = String(c.dataset.to).includes('.') ? 2 : 0; const t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / 1200); const e = 1 - Math.pow(1 - k, 3); c.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}
function runTypewriter(el) {
  const tw = el.querySelector('.typewriter'); if (!tw) return;
  const words = JSON.parse(tw.dataset.words); let wi = 0, ci = 0, del = false;
  const tick = () => {
    if (!tw.isConnected) return;
    const w = words[wi];
    tw.textContent = w.slice(0, ci);
    if (!del && ci < w.length) { ci++; setTimeout(tick, 55); }
    else if (!del) { del = true; setTimeout(tick, 1600); }
    else if (ci > 0) { ci--; setTimeout(tick, 28); }
    else { del = false; wi = (wi + 1) % words.length; setTimeout(tick, 300); }
  };
  tick();
}

/* --------------------------- terminal --------------------------- */
function setupTerminal(el) {
  const out = el.querySelector('.term-out'); const input = el.querySelector('.term-in');
  const history = []; let hi = -1;
  const print = (html, cls = '') => { const d = document.createElement('div'); d.className = 'term-block ' + cls; d.innerHTML = html; out.appendChild(d); el.scrollTop = el.scrollHeight; };
  const link = (u, t) => `<a href="${u}" target="_blank" rel="noopener">${t || u}</a>`;
  const cmds = {
    help: () => `Available commands:\n  <b>about</b>       who am I\n  <b>projects</b>    list projects\n  <b>open</b> &lt;name&gt; open a project / app (e.g. open bookify, open resume)\n  <b>skills</b>      tech stack\n  <b>experience</b>  work history\n  <b>education</b>   academics\n  <b>contact</b>     how to reach me\n  <b>social</b>      links\n  <b>neofetch</b>    system info\n  <b>date</b>, <b>echo</b>, <b>whoami</b>, <b>ls</b>, <b>clear</b>, <b>exit</b>`,
    about: () => DATA.summary,
    whoami: () => 'jaivardhan — Software Developer · VIT Vellore CSE (2027)',
    projects: () => DATA.projects.map((p) => `• <b>${p.name}</b> — ${p.tagline}\n    ${link(p.live, 'live')} · ${link(p.github, 'source')}`).join('\n'),
    skills: () => DATA.skills.map((g) => `<b>${g.group}:</b> ${g.items.map((i) => i[0]).join(', ')}`).join('\n'),
    experience: () => DATA.experience.map((e) => `• <b>${e.title}</b> @ ${e.company} (${e.period})`).join('\n'),
    education: () => DATA.education.map((e) => `• <b>${e.school}</b> — ${e.degree} (${e.score})`).join('\n'),
    contact: () => `email: ${link('mailto:' + DATA.email, DATA.email)}\nphone: ${DATA.phone}\nlocation: ${DATA.location}`,
    social: () => `github:   ${link(DATA.socials.github)}\nlinkedin: ${link(DATA.socials.linkedin)}\nleetcode: ${link(DATA.socials.leetcode)}`,
    date: () => new Date().toString(),
    echo: (a) => a.join(' '),
    ls: () => 'about.txt  projects/  experience.md  skills.json  education.md  achievements.md  resume.pdf  contact.vcf',
    pwd: () => '/home/jaivardhan',
    sudo: () => 'jaivardhan is not in the sudoers file. This incident will be reported. 😄',
    neofetch: () => `<span class="term-accent">        ██╗ █████╗ ██╗
        ██║██╔══██╗██║
        ██║███████║██║
   ██   ██║██╔══██║██║
   ╚█████╔╝██║  ██║██║
    ╚════╝ ╚═╝  ╚═╝╚═╝</span>
   <b>OS:</b>       JaiOS Portfolio Edition
   <b>Host:</b>     ${DATA.name}
   <b>Kernel:</b>   Next.js · MongoDB · C++
   <b>Uptime:</b>   since 2023 (VIT Vellore)
   <b>Shell:</b>    vanilla-js
   <b>CGPA:</b>     8.16 / 10
   <b>Status:</b>   open to SDE roles`,
    clear: () => { out.innerHTML = ''; return null; },
    exit: () => { OS.closeApp && OS.closeApp('terminal'); return null; },
    open: (a) => {
      const q = (a[0] || '').toLowerCase(); if (!q) return 'usage: open <bookify|interviewai|placement|about|projects|resume|...>';
      const p = DATA.projects.find((x) => x.id.startsWith(q) || x.name.toLowerCase().startsWith(q));
      if (p) { OS.openApp('projects', { projectId: p.id }); return `Opening ${p.name}…`; }
      const app = Object.keys(APPS).find((k) => k.startsWith(q));
      if (app) { OS.openApp(app); return `Opening ${APPS[app].title}…`; }
      return `open: '${q}' not found`;
    },
  };
  const run = (raw) => {
    const line = raw.trim(); if (!line) return;
    history.unshift(line); hi = -1;
    print(`<span class="term-prompt">jai@portfolio:~$</span> ${esc(line)}`, 'term-cmd');
    const [c, ...args] = line.split(/\s+/);
    const fn = cmds[c.toLowerCase()];
    if (!fn) return print(`bash: ${esc(c)}: command not found. Type <b>help</b>.`, 'term-err');
    const r = fn(args); if (r != null) print(r.replace(/\n/g, '<br>'));
  };
  input.onkeydown = (e) => {
    if (e.key === 'Enter') { run(input.value); input.value = ''; }
    else if (e.key === 'ArrowUp') { hi = Math.min(history.length - 1, hi + 1); input.value = history[hi] || ''; e.preventDefault(); }
    else if (e.key === 'ArrowDown') { hi = Math.max(-1, hi - 1); input.value = history[hi] || ''; e.preventDefault(); }
    else if (e.key === 'Tab') { e.preventDefault(); const m = Object.keys(cmds).find((k) => k.startsWith(input.value)); if (m) input.value = m; }
  };
  el.onclick = () => input.focus();
  print(`Welcome to <b>JaiOS Terminal</b> — type <b>help</b> to get started.`);
  print(cmds.neofetch());
  setTimeout(() => input.focus(), 50);
}
