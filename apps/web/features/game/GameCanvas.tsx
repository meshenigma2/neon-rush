'use client';

import React from 'react';
import { useGameSession } from './useGameSession';
import { GameOverlay } from './GameOverlay';

export function GameCanvas() {
  const {
    canvasRef,
    snapshot,
    error,
    isInitializing,
    countdown,
    handlePause,
    handleResume,
    handleRestart,
  } = useGameSession();

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-red-500 flex-col p-8 h-full w-full">
        <h2 className="text-3xl font-bold mb-4">Engine Initialization Failed</h2>
        <p className="font-mono bg-red-950 p-4 rounded text-red-300">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100vh] bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block outline-none"
        tabIndex={0}
      />
      
      {isInitializing ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
          <div className="text-cyan-400 text-2xl font-bold tracking-[0.3em] uppercase animate-pulse">
            Booting System...
          </div>
        </div>
      ) : (
        <GameOverlay
          snapshot={snapshot}
          countdown={countdown}
          onPause={handlePause}
          onResume={handleResume}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
