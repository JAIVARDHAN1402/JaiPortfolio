# JaiOS — Portfolio Operating System

A personal portfolio for **Jaivardhan Singh** that behaves like an operating system:

- **Desktop / laptop** → boots into a **Windows 11-style** desktop (boot screen → lock screen → login → desktop with draggable, resizable, snappable windows, taskbar, Start menu, search, task view, quick settings, calendar, notifications, widgets, right-click menu, terminal, power menu).
- **Phone / tablet** → boots into an **Android-style** launcher (boot animation → swipe-to-unlock → home screen with widget, app grid, dock, swipe-up app drawer, pull-down notification shade with quick tiles, recents with swipe-to-dismiss, back/home/recents nav).

No frameworks, no build step — plain HTML, CSS and JavaScript. Open `index.html` or deploy the folder anywhere static.

## Run locally

```bash
npx -y serve -l 5173 .
```

Then open <http://localhost:5173>. Force a shell with `?os=windows` or `?os=android`.

## Edit content

Everything personal lives in **`js/data.js`** — name, summary, socials, education, experience, projects, skills, achievements. Change values there and reload.

- Add a photo: put it in `assets/` and set `avatar: "assets/photo.jpg"` in `data.js`.
- Replace the resume: overwrite `assets/Resume_Jaivardhan_Singh.pdf` (or change `resumeFile`).
- Add an app: register it in `js/apps.js` (`APPS`) and add its id to `DESKTOP_APPS`.

## Structure

```
index.html
css/base.css       shared tokens + app content styles
css/windows.css    Windows shell
css/android.css    Android shell
css/fx.css         next-gen visual layer (glow borders, holographic sweeps, boot terminal)
js/data.js         portfolio content (edit this)
js/icons.js        SVG icon set + gradient tiles
js/apps.js         app registry (About, Projects, Experience, Skills, Education, Achievements, Resume, Contact, Terminal, Settings)
js/wallpaper.js    animated canvas wallpaper
js/fx.js           effects engine: particle network, custom cursor, ripples, 3D tilt, spotlight, parallax, glitch, UI sounds
js/windows.js      Windows shell: boot/lock/login, window manager, taskbar, flyouts
js/android.js      Android shell: launcher, drawer, app stack, shade, recents, gestures
js/main.js         picks the shell from screen size / preference
assets/            resume PDF (and optional avatar)
```

## Deploy

Static hosting works out of the box — Vercel (`vercel --prod`), Netlify, GitHub Pages, Cloudflare Pages. No build command; output directory is the project root.

## Tips for visitors

- Windows: double-click desktop icons, drag windows to the top edge to maximize or to the sides to snap, try the Terminal (`help`, `neofetch`, `open bookify`).
- Android: swipe up for all apps, pull down the status bar for quick settings, tap the square button for recents.
- Settings lets you switch theme, accent, wallpaper — or force the other OS.
