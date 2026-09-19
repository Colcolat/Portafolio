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

- A fresh **Press START to begin** title screen on every page load. Its button, physical START control or Enter opens the section-selection menu without starting a game; A/Z provides an alternative. Arrows, B and Select leave the title screen in place. This entrance state is not persisted.
- Pointer, touch and keyboard controls: arrow keys navigate, Z selects, X goes back, Enter opens the menu. Select cycles sections. Keyboard shortcuts leave text fields and the reading dialog alone.
- A full-portfolio dialog with native focus containment, Escape to close and focus restoration.
- Three original projects, eleven certificates, twenty-four skills and downloadable English/Spanish CVs.
- Byte Snake with pause, restart and a locally saved high score. A starts/pauses, and the directional pad steers. Collect eight food bytes in one round to earn its secret arcade trophy without interrupting play.
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

### More secrets (implementation notes / spoilers)

- **Backend:** turn the console over and remove its four distinct rear screws in any order, without a timer. The full cover lifts and falls, revealing a modeled circuit board, two AA batteries and an internal **{ }** panel that opens the technical field notes. **Restore cover** reassembles it without erasing discoveries; **Reset view** returns to the front. Mouse/touch and native keyboard activation work independently of case dragging. Reduced-motion preferences skip the fall, and the CSS fallback retains the complete puzzle. Cover state resets on reload; the existing `backend` discovery remains saved.
- **Secret cartridge:** tap the console's **pocket** logo five times, with at most 1.2 seconds between taps. A cartridge appears on the LCD; A loads an eight-card, four-pair memory game featuring Juan's favourites: **League of Legends, Elden Ring, Team Fortress 2 and Ghost of Tsushima**. Each pair has a custom monochrome pixel-art icon, a short visible caption and the full game title for screen readers; face-down cards do not expose their identity. Touch/click flips cards; arrows navigate and Enter/Space flip with the keyboard. Matched pairs stay visible, attempts are counted, and replay shuffles the deck. Discoveries persist; individual rounds reset when leaving the game. The artwork uses local SVG pixels in the portfolio's LCD palette, with no external downloads or added framework.
- Partial logo sequences reset on other controls, a dialog, power off, rear view, game navigation, blur or hiding the tab. Holding a key and dragging the shell never count as repeated taps. Both rewards remain available through the collection after discovery.
- **Pocket radio:** tap the speaker grille three times, with at most 1.2 seconds between taps, while the console is powered on and facing forward, with no dialog or Byte Snake game open. Click/touch and native Enter/Space activation work; held keys do not count repeatedly. This fourth discovery opens a music card with the supplied Moonlight recording and a personal invitation to explore below. The background fades into a pixel-textured night, with a soft white wave and floating particles. The extended passage spans `320svh` on desktop and `300svh` on mobile: scrolling gradually fades the portfolio and music card, lowers Moonlight through a smooth volume envelope, and increases the wave's height and brightness. The entire background reaches the salon's ivory before its first content enters the viewport, avoiding a hard seam. A white, black and gold piano salon then reveals an animated pianist and the dedication **Te dedico mi melodía favorita**. Chopin fades in on entry; one audio element prevents overlapping tracks.
- While the radio is open, the console LCD turns black and shows a pale-green, pixel-block spectrum: a `16 × 12` SVG grid driven by the recording's real audio levels. Where supported, optional `captureStream()` analysis reads only the internal audio element; it does not access a microphone or request recording permissions. Unsupported analysis leaves a quiet baseline rather than fabricated movement. The visualizer pauses when playback stops or the tab is hidden, and reduced-motion preferences keep it static.
- The salon shares Juan's piano story: playing since age five, taking part in concerts and studying with **Irina Decheva**, plus the six favourite pieces he supplied. The attached recordings are presented as listening tracks, not as recordings of Juan performing. Audio is local (`public/audio/pocket-moonlight.mp3` and `public/audio/piano-chopin.mp3`) and respects the deployment base path. No audio element or download is created before explicit activation. Playback respects the global mute setting, manual pause and tab visibility; blocked playback can be retried. Back/exit controls and Escape return to the portfolio, and reduced motion removes ambient movement.
- The radio's discovery is saved, but its open state, audio and piano section are not restored automatically on reload. Until the radio is explicitly activated during the visit, the salon is absent from scrolling and keyboard navigation. Discovered listeners can revisit it from **Secrets found** without repeating the speaker sequence. As with the other easter eggs, this is playful discovery rather than a security boundary.
- Once the music card fades out, compact passage controls keep play/pause, mute and exit available until the salon's controls take over. Manual pause, global mute, Escape and return navigation retain their existing behavior. These transition and visualizer refinements do not add another discovery.
- **The tiny visitor:** open the home menu with **START / Enter** and leave it still for **20 seconds**. The console must be powered on, facing forward and at least 35% visible in a visible, focused browser tab. **Bit**, an original pixel mascot, appears in its own menu margin without changing the selected item, playing a sound or stealing focus. Moving the pointer toward Bit after it appears does not send it away. Click/tap Bit or focus it and press Enter/Space to say hello and register this fifth discovery; its appearance alone does not count.
- Activity elsewhere restarts the visitor's wait; once Bit appears, Tab/Shift+Tab also lets keyboard users reach its button without dismissing it. Leaving the menu, turning the console off or over, opening a dialog or the radio, or hiding/unfocusing the tab resets it. Reduced motion keeps Bit static. The reward can be revisited from **Secrets found**, where **Wave to Bit** is a cosmetic interaction that never increments progress. Reloading retains the discovery but does not reveal or unlock the visitor automatically.

- **Byte keeper:** collect **eight food bytes in one current round of Byte Snake**. Reaching the threshold silently records the sixth discovery, `byte-reward`, with a polite accessible announcement and a small trophy star, but no dialog, automatic pause or board resize. Pause with A, or finish the round, to use **View trophy** alongside the normal Resume/Play again control. The reward can also be revisited through **Secrets found**. A previously stored high score does not unlock it; the eight bytes must be earned together during a new round. Saved discoveries keep the existing `pocketfolio.secrets.v1` storage key and preserve all five earlier secrets.

All six agreed secrets are implemented; no new secrets remain in this sequence. The next refinement is the **developer-room remaster**, tracked in [docs/EASTER_EGGS.md](docs/EASTER_EGGS.md). It is pending, not part of the current implementation: keep the Konami trigger and existing discovery, fade the console into a full desk pixel-art scene based on a future photograph from Juan, and add an LCD/scanline treatment, a small ray of light, falling pixel dust and the supplied title-screen music. The reference artwork is a style guide, not a photograph of Juan's desk. The new desk image and soundtrack have not been imported into the application.

## Acknowledgements & Credits

The previous version was based on the following portfolio template. Its original license and attribution remain in this repository.

* **Original Creator:** [ZainAhmadF28](https://github.com/ZainAhmadF28)
* **Original Template Repository:** [zain-portofolio](https://github.com/ZainAhmadF28/zain-portofolio)

The pocket edition replaces the active presentation and interaction code; the references above credit the earlier version and retained legacy files.
