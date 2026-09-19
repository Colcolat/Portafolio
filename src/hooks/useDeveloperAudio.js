import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createDeveloperAudioController } from './developerAudio.js';

export default function useDeveloperAudio({ active, sound = true }) {
  const [status, setStatus] = useState('idle');
  const controller = useRef(null);
  const settings = useRef({ sound });
  useLayoutEffect(() => {
    settings.current = { sound };
    if (!controller.current) return;
    if (!active) controller.current.stop();
    controller.current.setSound(sound);
  }, [active, sound]);
  useEffect(() => {
    const visibility = () => controller.current?.setHidden(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);
  const ensureController = useCallback(() => {
    if (!controller.current) controller.current = createDeveloperAudioController({
      ...settings.current, baseURL: import.meta.env.BASE_URL || '/',
      hidden: document.hidden, onStatus: setStatus,
    });
    return controller.current;
  }, []);
  const start = useCallback(() => ensureController().start(), [ensureController]);
  const stop = useCallback(() => controller.current?.stop(), []);
  const togglePlayback = useCallback(() => ensureController().togglePlayback(), [ensureController]);
  const setSoundFromGesture = useCallback(next => ensureController().setSoundFromGesture(next), [ensureController]);
  return { status, start, stop, togglePlayback, setSoundFromGesture };
}
