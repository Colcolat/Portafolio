const clamp = value => Math.max(0, Math.min(1, value));

/** Scroll geometry only: no hidden page exists until its explicit activation. */
export function getRadioJourneyState({ scrollY, startY, roomTop, viewportHeight, previousScene = 'radio' }) {
  const height = Math.max(1, Number.isFinite(viewportHeight) ? viewportHeight : 1);
  const start = Number.isFinite(startY) ? startY : 0;
  const top = Number.isFinite(roomTop) ? roomTop : start + height * 2;
  const current = Number.isFinite(scrollY) ? scrollY : start;
  const progress = clamp((current - start) / Math.max(height, top - start));
  const reveal = clamp((current + height - top) / height);
  // Hysteresis avoids swapping songs repeatedly at a single scroll boundary.
  const scene = previousScene === 'piano' ? reveal < 0.2 ? 'radio' : 'piano' : reveal >= 0.65 ? 'piano' : 'radio';
  return { progress, reveal, opacity: clamp(1 - progress / 0.5), hidden: progress >= 0.5, scene };
}
