const clamp = value => Math.max(0, Math.min(1, value));
const ease = (start, end, value) => {
  const step = clamp((value - start) / (end - start));
  return step * step * (3 - 2 * step);
};

/** Scroll geometry only: no hidden page exists until its explicit activation. */
export function getRadioJourneyState({ scrollY, startY, roomTop, viewportHeight, previousScene = 'radio' }) {
  const height = Math.max(1, Number.isFinite(viewportHeight) ? viewportHeight : 1);
  const start = Number.isFinite(startY) ? startY : 0;
  const top = Number.isFinite(roomTop) ? roomTop : start + height * 2;
  const current = Number.isFinite(scrollY) ? scrollY : start;
  const progress = clamp((current - start) / Math.max(height, top - start));
  const reveal = clamp((current + height - top) / height);
  // Finish the wash before the concert's first pixel enters the viewport.
  // Its paper must meet an already-white atmosphere, not a black rectangle.
  const passage = clamp((current - start) / Math.max(height, top - height * 1.12 - start));
  const daylight = ease(0.2, 1, passage);
  const ticketOpacity = 1 - ease(0.08, 0.78, passage);
  const opacity = 1 - ease(0, 0.4, passage);
  // Hysteresis avoids swapping songs repeatedly at a single scroll boundary.
  const scene = previousScene === 'piano' ? reveal < 0.2 ? 'radio' : 'piano' : reveal >= 0.65 ? 'piano' : 'radio';
  return {
    progress, reveal, passage, opacity, hidden: opacity <= 0.001, scene,
    ticketOpacity, radioGain: ticketOpacity, pianoGain: ease(0.65, 1, reveal),
    daylight, dawn: Math.sin(daylight * Math.PI), pulse: ease(0, 0.95, passage),
  };
}
