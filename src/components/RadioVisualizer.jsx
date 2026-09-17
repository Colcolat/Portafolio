import { useEffect, useRef } from 'react';
import './RadioVisualizer.css';

const columns = 16;
const rows = 12;
const frameInterval = 40;

function RadioMark() {
  return <svg className="radio-visualizer__mark" viewBox="0 0 24 22" aria-hidden="true" focusable="false" shapeRendering="crispEdges" fill="currentColor">
    <path d="M5 2h2v2h2v2h2v2h10v12H3V8h6V6H7V4H5Zm0 8v8h14v-8Z" />
    <path d="M7 12h4v4H7zm6 0h4v2h-4zm0 3h4v1h-4z" />
  </svg>;
}

export default function RadioVisualizer({ t, status = 'idle', readSpectrum, active = true }) {
  const cells = useRef([]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastDraw = -Infinity;

    const draw = (spectrum) => {
      for (let column = 0; column < columns; column += 1) {
        const sample = spectrum?.[column];
        const level = Number.isFinite(sample) ? Math.max(0, Math.min(1, sample)) : 0;
        const height = 1 + Math.round(level * (rows - 1));
        for (let row = 0; row < rows; row += 1) {
          const cell = cells.current[column * rows + row];
          if (cell) cell.setAttribute('opacity', row < height ? String(.58 + row / rows * .42) : '.045');
        }
      }
    };

    const tick = (timestamp) => {
      if (timestamp - lastDraw >= frameInterval) {
        draw(readSpectrum?.());
        lastDraw = timestamp;
      }
      frame = window.requestAnimationFrame(tick);
    };

    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      lastDraw = -Infinity;
      const canPlay = active && status === 'playing' && !document.hidden;
      draw(canPlay ? readSpectrum?.() : undefined);
      if (canPlay && !reducedMotion.matches) frame = window.requestAnimationFrame(tick);
    };

    sync();
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', sync);
      reducedMotion.removeEventListener('change', sync);
    };
  }, [active, readSpectrum, status]);

  const statusLabels = {
    idle: 'Radio ready',
    loading: 'Tuning in…',
    playing: 'On air',
    paused: 'Radio paused',
    muted: 'Sound off',
    blocked: 'Press play on the radio card',
    error: 'Recording unavailable',
  };

  return <div className="radio-visualizer" aria-label={t('Pocket radio audio visualizer')}>
    <div className="radio-visualizer__header"><span>POCKET FM</span><RadioMark /></div>
    <div className="radio-visualizer__spectrum">
      <svg viewBox="0 0 128 96" className="radio-visualizer__bars" aria-hidden="true" focusable="false" shapeRendering="crispEdges" fill="currentColor">
        {Array.from({ length: columns }, (_, column) => Array.from({ length: rows }, (_, row) => <rect
          key={`${column}-${row}`}
          ref={node => { cells.current[column * rows + row] = node; }}
          x={column * 8 + 1} y={88 - row * 8} width="6" height="6"
          opacity={row === 0 ? '.58' : '.045'}
        />))}
      </svg>
    </div>
    <div className="radio-visualizer__track"><strong>{t('Moonlight')}</strong><span>BEETHOVEN · I</span></div>
    <p className="radio-visualizer__status" role="status" aria-live="polite" aria-atomic="true"><span aria-hidden="true">{status === 'playing' ? '●' : '○'}</span>{t(statusLabels[status] || statusLabels.idle)}</p>
  </div>;
}
