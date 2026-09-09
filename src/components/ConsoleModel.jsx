import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createConsoleModel, updateConsoleModel, disposeConsoleModel } from '../three/createConsoleModel';
import { CAMERA_DISTANCE, consoleRotation, cssProjectionMatrix, projectionDimensions } from '../three/consoleProjection';

export default function ConsoleModel({ hostRef, powered, pressed, theme }) {
  const mountRef = useRef(null);
  const updateRef = useRef(null);
  const propsRef = useRef({ powered, pressed, theme });
  propsRef.current = { powered, pressed, theme };

  useEffect(() => {
    const host = hostRef.current;
    const mount = mountRef.current;
    if (!host || !mount) return undefined;
    let renderer, model, frame = null, disposed = false, failed = false;
    let dimensions, lastX = NaN, lastY = NaN, visible = true;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.z = CAMERA_DISTANCE;
    const ambient = new THREE.HemisphereLight('#fffceb', '#606b57', 2.1);
    const key = new THREE.DirectionalLight('#fff7de', 3.1); key.position.set(-4, 7, 9);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 25 });
    key.shadow.bias = -0.0002;
    key.shadow.normalBias = 0.008;
    key.shadow.radius = 2;
    const fill = new THREE.DirectionalLight('#d5e3ff', 0.9); fill.position.set(5, 1, 5);
    const rim = new THREE.DirectionalLight('#f5ffda', 1.2); rim.position.set(3, 5, -4);
    scene.add(ambient, key, fill, rim);

    const restoreFallback = () => {
      failed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      delete host.dataset.renderer;
      host.style.removeProperty('--model-transform');
      host.style.removeProperty('--model-perspective');
    };

    const draw = () => {
      frame = null;
      if (disposed || failed || !dimensions || !visible || document.hidden) return;
      try {
        const x = parseFloat(host.style.getPropertyValue('--tilt-x')) || 0;
        const y = parseFloat(host.style.getPropertyValue('--tilt-y')) || 0;
        lastX = x; lastY = y;
        const rotation = consoleRotation(x, y);
        model.rotation.copy(rotation);
        updateConsoleModel(model, propsRef.current);
        const dark = propsRef.current.theme === 'dark';
        ambient.intensity = dark ? 1.6 : 2.1;
        key.intensity = dark ? 2.8 : 3.1;
        fill.intensity = dark ? 0.65 : 0.9;
        renderer.render(scene, camera);
        if (failed) return;
        // Only replace the CSS case after WebGL has rendered successfully.
        host.style.setProperty('--model-transform', cssProjectionMatrix(rotation, dimensions.pixelsPerUnit));
        host.style.setProperty('--model-perspective', `${dimensions.perspective}px`);
        host.dataset.renderer = 'webgl';
      } catch {
        restoreFallback();
      }
    };
    const schedule = () => {
      if (frame === null && !disposed && !failed && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      const width = host.clientWidth, height = host.clientHeight;
      if (!width || !height || failed || !renderer) return;
      dimensions = projectionDimensions(width, height);
      camera.fov = dimensions.fov; camera.aspect = dimensions.aspect; camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(dimensions.canvasWidth, dimensions.canvasHeight, false);
      schedule();
    };
    const contextLost = event => { event.preventDefault(); restoreFallback(); };

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      // Shader failures are reported through this callback, not thrown by render().
      renderer.debug.onShaderError = restoreFallback;
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.03;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.domElement.setAttribute('aria-hidden', 'true');
      renderer.domElement.addEventListener('webglcontextlost', contextLost);
      mount.appendChild(renderer.domElement);
      model = createConsoleModel(); scene.add(model);
    } catch {
      restoreFallback();
      renderer?.dispose(); renderer?.domElement.remove();
      if (model) disposeConsoleModel(model);
      return undefined;
    }

    const styles = new MutationObserver(() => {
      const x = parseFloat(host.style.getPropertyValue('--tilt-x')) || 0;
      const y = parseFloat(host.style.getPropertyValue('--tilt-y')) || 0;
      // The projection also writes CSS variables; ignore those self-generated mutations.
      if (x !== lastX || y !== lastY) schedule();
    });
    styles.observe(host, { attributes: true, attributeFilter: ['style'] });
    const observer = new ResizeObserver(resize); observer.observe(host);
    const intersection = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible) schedule();
    }, { rootMargin: '100px' });
    intersection.observe(host);
    const visibility = () => { if (!document.hidden) schedule(); };
    document.addEventListener('visibilitychange', visibility);
    updateRef.current = schedule;
    resize();

    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      updateRef.current = null;
      styles.disconnect(); observer.disconnect(); intersection.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
      disposeConsoleModel(model);
      delete host.dataset.renderer;
      host.style.removeProperty('--model-transform'); host.style.removeProperty('--model-perspective');
    };
  }, [hostRef]);

  useEffect(() => { updateRef.current?.(); }, [powered, pressed, theme]);
  return <div className="model-viewport" ref={mountRef} aria-hidden="true" />;
}
