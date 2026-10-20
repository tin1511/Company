import { useState, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth.ts';

export function useAudio() {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      audioSynth.setMuted(next);
      return next;
    });
  }, []);

  const playClick = useCallback(() => {
    audioSynth.playClick();
  }, []);

  const playFocusChime = useCallback(() => {
    audioSynth.playFocusChime();
  }, []);

  const playCameraReset = useCallback(() => {
    audioSynth.playCameraReset();
  }, []);

  return {
    isMuted,
    toggleMute,
    playClick,
    playFocusChime,
    playCameraReset,
  };
}
