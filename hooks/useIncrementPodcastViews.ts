import { useState, useEffect } from "react";

type AudioTrackingParams = {
  minPlayDuration: number; 
  playbackActive: boolean;
  totalLength: number;
};

const useTrackAudioProgress = ({
  minPlayDuration,
  playbackActive, 
  totalLength,
}: AudioTrackingParams): {
  progressComplete: boolean;
  resetProgress: () => void;
} => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!playbackActive || elapsedTime >= minPlayDuration) {
      return;
    }

    const incrementProgress = () => {
      setElapsedTime((current) => {
        const increment = current + 0.1;
        
        if (increment >= minPlayDuration) {
          return minPlayDuration;
        }
        
        if (increment * 2 >= totalLength) {
          return minPlayDuration;
        }
        
        return increment;
      });
    };

    const tracker = setInterval(incrementProgress, 100);

    return () => {
      clearInterval(tracker);
    };
  }, [totalLength, playbackActive, minPlayDuration, elapsedTime]);

  if (elapsedTime >= minPlayDuration) {
    return { progressComplete: true, resetProgress: () => setElapsedTime(0) };
  }
  return { progressComplete: false, resetProgress: () => setElapsedTime(0) };
};

export default useTrackAudioProgress;