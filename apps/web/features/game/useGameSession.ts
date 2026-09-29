import { useEffect, useRef, useState, useCallback } from 'react';
import { GameRuntime } from '@neon-rush/game-engine';
import { GameSnapshot } from '@neon-rush/game-contracts';

export function useGameSession() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameRuntime | null>(null);
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    setIsInitializing(true);
    let intervalId: NodeJS.Timeout;

    try {
      const engine = new GameRuntime({
        canvas: canvasRef.current,
        settings: {},
      });
      engineRef.current = engine;
      engine.beginCountdown();

      setSnapshot(engine.getSnapshot());
      setIsInitializing(false);

      intervalId = setInterval(() => {
        if (engineRef.current) {
          setSnapshot(engineRef.current.getSnapshot());
        }
      }, 100);

    } catch (err) {
      console.error('Failed to initialize game engine', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsInitializing(false);
    }

    return () => {
      clearInterval(intervalId);
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // Manage Countdown Logic
  useEffect(() => {
    if (snapshot?.state === 'COUNTDOWN' && countdown === null) {
      setCountdown(3);
    } else if (snapshot?.state !== 'COUNTDOWN') {
      setCountdown(null);
    }
  }, [snapshot?.state]);

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // GO!
      engineRef.current?.start();
      setCountdown(null);
    }
  }, [countdown]);

  const handlePause = useCallback(() => {
    engineRef.current?.pause();
    if (engineRef.current) setSnapshot(engineRef.current.getSnapshot());
  }, []);

  const handleResume = useCallback(() => {
    engineRef.current?.beginCountdown(); // Resume with a countdown!
    if (engineRef.current) setSnapshot(engineRef.current.getSnapshot());
  }, []);

  const handleRestart = useCallback(() => {
    engineRef.current?.restart();
    if (engineRef.current) setSnapshot(engineRef.current.getSnapshot());
  }, []);

  return {
    canvasRef,
    snapshot,
    error,
    isInitializing,
    countdown,
    handlePause,
    handleResume,
    handleRestart,
  };
}
