import { useEffect, useRef } from 'react';
import './RearConsole.css';

// The labels and hit targets share the rear camera projection with the hardware.
const screwPositions = [[-1.72, 2.86], [1.72, 2.86], [-1.72, -2.84], [1.57, -2.72]];

function preventHeldActivation(event) {
  if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
}

export default function RearConsole({ t, backFacing, removedScrews = [], coverPhase = 'closed', onScrew, onDiscover }) {
  const rearRef = useRef(null);
  const panelRef = useRef(null);
  const lastScrewRef = useRef(null);
  const open = coverPhase === 'open';

  useEffect(() => {
    if (!backFacing || coverPhase === 'closed') return;
    if (open) {
      const previous = lastScrewRef.current;
      const active = document.activeElement;
      // Opening the case should not take focus away from a preference or toolbar.
      if (previous && (active === previous || active === document.body)) panelRef.current?.focus();
      lastScrewRef.current = null;
    }
  }, [backFacing, coverPhase, open]);

  useEffect(() => {
    if (!backFacing || coverPhase === 'closed' && removedScrews.length === 0) lastScrewRef.current = null;
  }, [backFacing, coverPhase, removedScrews.length]);

  return <div ref={rearRef} className="console-rear" data-back-facing={backFacing} data-cover-phase={coverPhase}
    inert={backFacing ? undefined : ''} aria-hidden={!backFacing}>
    <div className="rear-internals" aria-hidden="true">
      <div className="rear-circuit-board">
        <svg className="rear-circuit-traces" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
          <g fill="none" stroke="currentColor" strokeWidth=".55">
            <path d="M8 12h16v12h12v14M12 18h7v12h12v12M8 37h10v8h12M77 12H65v15H54M87 18H73v21H62M92 31H82v16H68M8 65h22V53M12 72h25V58M88 65H75V53M87 76H67V62M24 89V78h19V63M78 90V84H53V69" />
            <path d="M5 53h15v-2M92 52H80v5M44 9v9h7v8M56 8v8h5M47 91V78h7M7 83h10v9M89 88h-6v5" />
          </g>
          <g fill="currentColor">
            {[[8, 12], [8, 37], [77, 12], [92, 31], [8, 65], [87, 76], [24, 89], [78, 90], [44, 9], [56, 8], [7, 83]].map(([x, y]) => <rect key={`${x}-${y}`} x={x - 1} y={y - 1} width="2" height="2" />)}
          </g>
        </svg>
        <div className="rear-chip rear-chip--left"><i /><i /><i /><i /></div>
        <div className="rear-chip rear-chip--right"><i /><i /><i /><i /></div>
        <i className="rear-capacitor rear-capacitor--one" /><i className="rear-capacitor rear-capacitor--two" />
        <span className="rear-board-number">JJZB / REV. 01</span>
      </div>
      <div className="rear-battery-tray">
        {[0, 1].map(index => <div className={`rear-cell rear-cell--${index + 1}`} key={index}>
          <span className="rear-cell-polarity">+</span><span className="rear-cell-label">pocket <small>AA / 1.5V</small></span><span className="rear-cell-polarity">−</span>
        </div>)}
      </div>
    </div>
    {!open && <div className="rear-cover" aria-hidden="true">
      <div className="rear-service-plate">
        <span className="rear-wordmark">pocket</span>
        <span className="rear-edition">{t('PORTFOLIO SYSTEM')} / 01</span>
        <span className="rear-rule" />
        <span className="rear-serial">JJZB · B-SIDE / 01</span>
      </div>
      <div className="rear-battery-cover"><span>{t('OPEN')} ▾</span><i /><i /><i /></div>
    </div>}
    {!open && screwPositions.map(([x, y], index) => {
      const removed = removedScrews.includes(index);
      const inactive = removed || coverPhase !== 'closed' || !backFacing;
      return <button key={index} className="rear-screw" type="button" data-removed={removed}
        style={{ left: `${(-x + 2.07) / 4.14 * 100}%`, top: `${(3.29 - y) / 6.58 * 100}%` }}
        aria-label={t(removed ? 'Rear screw {number} removed' : 'Remove rear screw {number}', { number: index + 1 })}
        aria-pressed={removed} aria-disabled={inactive} tabIndex={inactive ? -1 : 0}
        onKeyDown={preventHeldActivation} onClick={event => {
          if (inactive) return;
          lastScrewRef.current = event.currentTarget;
          onScrew?.(index);
        }}><span className="rear-screw-head" aria-hidden="true"><i /></span></button>;
    })}
    <button ref={panelRef} type="button" className="rear-backend-panel" hidden={!open}
      disabled={!open || !backFacing} tabIndex={open && backFacing ? 0 : -1}
      aria-label={t('Inspect the backend panel')} onKeyDown={preventHeldActivation} onClick={onDiscover}>
      <span className="rear-panel-code" aria-hidden="true">{'{ }'}</span>
      <span className="rear-panel-name" aria-hidden="true">{t('BACKEND')}</span>
      <span className="rear-panel-access" aria-hidden="true">{t('SERVICE ACCESS')} ↗</span>
    </button>
  </div>;
}
