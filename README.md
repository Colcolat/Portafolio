# Juan Jose Zapata Buenfil — Pocket Portfolio

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Site-cyan?style=for-the-badge&logo=github)](https://colcolat.github.io/Portafolio/)

An interactive, pocket-console portfolio for Juan Jose Zapata Buenfil. A working directional pad, A/B buttons, LCD screen, and an editorial reading view present the original projects, skills, certifications and CVs.

## About The Project

The pocket edition uses a real Three.js model for the handheld hardware: a solid ivory case, recessed olive LCD, raised controls, speaker openings and a ribbed power switch. The screen stays interactive HTML, projected onto the front of the model. The interface is original; content and documents are preserved from the previous portfolio.

### Built With

The active application uses:

* **[React](https://reactjs.org/)** - For building the user interface.
* **[Vite](https://vitejs.dev/)** - Next Generation Frontend Tooling for fast builds.
* **Three.js** — For the modeled case, buttons, lighting and real-time 3D perspective.
* **CSS** — For the live LCD, responsive layout and a lightweight hardware fallback.
* **Supabase (optional)** — For reading existing activity-gallery entries when configured.
* **Self-hosted fonts** — Instrument Serif, DM Sans and Silkscreen; OFL licenses are in `public/fonts`.

## Features

- Pointer, touch and keyboard controls: arrow keys navigate, Z selects, X goes back, Enter opens the menu. Select cycles sections. Keyboard shortcuts leave text fields and the reading dialog alone.
- A full-portfolio dialog with native focus containment, Escape to close and focus restoration.
- Three original projects, eleven certificates, twenty-four skills and downloadable English/Spanish CVs.
- Byte Snake with pause, restart and a locally saved high score. A starts/pauses, and the directional pad steers.
- A **Secrets found** collection at the bottom of the page, with locally saved, deduplicated discoveries. Undiscovered entries remain anonymous, and found rewards can be revisited. Only implemented secrets count toward the total; new ones will be introduced individually.
- Synthesized button sounds, on by default after a user interaction, and a working power switch. Sound can be muted from the header.
- English/Spanish interface and a light/dark appearance switch. Sound, language and appearance choices are saved locally; the site still works if browser storage is blocked. Names, official credentials and original files are preserved.
- A real 3D console with beveled geometry, sidewalls, a rear shell, recessed speaker openings, moving buttons and lighting. The cursor gently changes the viewing angle outside the console; movement freezes over its controls and is disabled for touch pointers or reduced-motion preferences.
- Hold the primary mouse button and drag the casing to inspect the console, including its back. Rotation stays where released; **Reset view** restores the original angle. The LCD, physical controls and power switch are excluded using both HTML targets and real mesh picking. Deliberate dragging has no inertia and remains available with reduced motion; touch keeps its normal scrolling/game gestures. The rear-facing HTML display is hidden and removed from keyboard focus until it faces forward again.
- The HTML display and accessible controls share the model's camera projection, so the original portfolio and game remain fully interactive. The optional 3D renderer loads separately, renders only when needed and pauses offscreen. If WebGL2 is unavailable or the graphics context is lost, the working CSS console remains available.
- Responsive layouts, reduced-motion support, descriptive controls and a skip-to-portfolio link.
- Contact links and a contact form that opens an encoded email draft in the visitor's own email app.

## Running Locally

To run this project on your local machine:

1. Clone the repository:
   ```bash
   git clone https://github.com/Colcolat/Portafolio.git
   ```
2. Navigate into the directory:
   ```bash
   cd Portafolio
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Content and configuration

`src/data/portfolio.js` is the source of truth for the original profile, projects, certificates and skills. The original screenshots, certificate images and CVs live in `public`. The project called Portfolio retains its original description and screenshot as an archive of the previous edition.

### Secret 01 (implementation notes / spoilers)

The developer room is unlocked with **↑ ↑ ↓ ↓ ← → ← → B A**, using keyboard arrows plus B/A, the existing X/Z aliases, or the on-screen directional pad and B/A buttons. Enter/Start is not required. The reward appears on the LCD; A opens its reading view. It uses original pixel art and the existing profile, not invented personal information.

`src/data/secrets.js` lists the implemented discoveries. `src/hooks/konamiCode.js` recognizes the sequence, ignores held keys and editing/browser shortcuts, and expires partial attempts after a 12-second gap. Inputs are disabled while powered off, playing Byte Snake, or using a dialog. `src/hooks/useSecrets.js` validates and saves the collection under `pocketfolio.secrets.v1`; blocked storage still permits discoveries for the current visit. Secrets are playful UI features, not access control.

All asset URLs respect the Vite base path `/Portafolio/`. Run `npm run build` for production, `npm run lint` for the active application, `npm test` for preference/translation/motion/model/projection checks and `npm run preview` to review the build. Publication is a separate action; `npm run deploy` publishes to the existing GitHub Pages branch.

The procedural model is defined in `src/three/createConsoleModel.js`, the shared camera math in `src/three/consoleProjection.js`, and the renderer lifecycle in `src/components/ConsoleModel.jsx`. There is no external model service or runtime asset download. Geometry and materials are disposed when the component is removed.

To show activity-gallery records, configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as in `.env.example`. Without these variables the rest of the portfolio works normally and the gallery shows an empty state. No gallery records are bundled or invented.

Two original data details are intentionally preserved: the English for Business and Entrepreneurship credential is dated `OCT, 2026`, and the AWS DevOps credential has no verification URL. The latter offers its original image for download instead.

## Acknowledgements & Credits

The previous version was based on the following portfolio template. Its original license and attribution remain in this repository.

* **Original Creator:** [ZainAhmadF28](https://github.com/ZainAhmadF28)
* **Original Template Repository:** [zain-portofolio](https://github.com/ZainAhmadF28/zain-portofolio)

The pocket edition replaces the active presentation and interaction code; the references above credit the earlier version and retained legacy files.
