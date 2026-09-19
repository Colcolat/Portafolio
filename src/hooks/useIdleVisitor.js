import { useCallback, useEffect, useRef, useState } from 'react';
import { createIdleVisitor, createVisitorActivityClassifier, idleVisitorVisibility, visitorTargetInViewport } from './idleVisitor.js';

export default function useIdleVisitor({ enabled, targetRef }) {
  const [visible, setVisible] = useState(false);
  const controllerRef = useRef(null);
  const reset = useCallback(() => controllerRef.current?.reset(), []);

  useEffect(() => {
    setVisible(false);
    if (!enabled || !targetRef.current) return undefined;
    const target = targetRef.current;
    const host = target.ownerDocument.defaultView;
    const doc = target.ownerDocument;
    let alive = true;
    let focused = doc.hasFocus?.() ?? true;
    let inViewport = false;
    let observer = null;
    const controller = createIdleVisitor({ onChange: next => { if (alive) setVisible(next); } });
    const isActivity = createVisitorActivityClassifier();
    controllerRef.current = controller;

    function syncEligibility() {
      if (!alive) return;
      controller.setEligible(!doc.hidden && focused && inViewport);
    }
    function checkViewport() {
      if (observer) return;
      inViewport = visitorTargetInViewport(target.getBoundingClientRect(), host.innerWidth, host.innerHeight);
      syncEligibility();
    }
    function onActivity(event) {
      if (!alive) return;
      if (event.type === 'scroll') checkViewport();
      if (isActivity(event, controller.visible)) controller.reset();
    }
    function onFocus() { focused = true; checkViewport(); syncEligibility(); }
    function onBlur() { focused = false; syncEligibility(); }
    function onVisibility() {
      focused = doc.hasFocus?.() ?? true;
      checkViewport();
      syncEligibility();
    }
    function onResize() { controller.reset(); checkViewport(); }

    if (host.IntersectionObserver) {
      observer = new host.IntersectionObserver(entries => {
        if (!alive) return;
        const entry = entries.find(item => item.target === target);
        if (!entry) return;
        inViewport = entry.isIntersecting && entry.intersectionRatio >= idleVisitorVisibility;
        syncEligibility();
      }, { threshold: [0, idleVisitorVisibility] });
      observer.observe(target);
    } else {
      checkViewport();
    }

    const activityEvents = ['keydown', 'pointerdown', 'pointermove', 'touchstart', 'wheel', 'scroll'];
    const options = { capture: true, passive: true };
    activityEvents.forEach(type => doc.addEventListener(type, onActivity, options));
    host.addEventListener('focus', onFocus);
    host.addEventListener('blur', onBlur);
    host.addEventListener('resize', onResize);
    doc.addEventListener('visibilitychange', onVisibility);

    return () => {
      alive = false;
      controller.dispose();
      if (controllerRef.current === controller) controllerRef.current = null;
      observer?.disconnect();
      activityEvents.forEach(type => doc.removeEventListener(type, onActivity, options));
      host.removeEventListener('focus', onFocus);
      host.removeEventListener('blur', onBlur);
      host.removeEventListener('resize', onResize);
      doc.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, targetRef]);

  return { visible: enabled && visible, reset };
}
