import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRadioAudioController } from './radioAudio.js';

export default function useRadioAudio({ active, scene = 'radio', sound = true }) {
  const [status, setStatus] = useState('idle');
  const controller = useRef(null);
  const settings = useRef({ scene, sound });

  useLayoutEffect(() => {
    settings.current = { scene, sound };
    if (!controller.current) return;
    // Stop first when closing, so changed props cannot briefly resume a track.
    if (!active) controller.current.stop();
    controller.current.setSound(sound);
    controller.current.setScene(scene);
  }, [active, scene, sound]);

  useEffect(() => {
    const handleVisibility = () => controller.current?.setHidden(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);

  const ensureController = useCallback(() => {
    if (!controller.current) {
      controller.current = createRadioAudioController({
        ...settings.current,
        baseURL: import.meta.env.BASE_URL || '/',
        hidden: document.hidden,
        onStatus: setStatus,
      });
    }
    return controller.current;
  }, []);

  const start = useCallback(() => ensureController().start(), [ensureController]);
  const stop = useCallback(() => controller.current?.stop(), []);
  const togglePlayback = useCallback(() => ensureController().togglePlayback(), [ensureController]);

  return { status, start, stop, togglePlayback };
}
