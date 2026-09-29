import React, { useEffect } from 'react';
import { GameSnapshot } from '@neon-rush/game-contracts';

interface Props {
  snapshot: GameSnapshot | null;
  countdown: number | null;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
}

export function GameOverlay({ snapshot, countdown, onPause, onResume, onRestart }: Props) {
  // Listen for Escape key to pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (snapshot?.state === 'PLAYING' || snapshot?.state === 'COUNTDOWN') {
          onPause();
        } else if (snapshot?.state === 'PAUSED') {
          onResume();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [snapshot?.state, onPause, onResume]);

  if (!snapshot) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Top HUD */}
      <div className="flex justify-between items-start">
        <div className="bg-black/70 border border-cyan-500/30 text-white p-4 rounded backdrop-blur-md shadow-[0_0_15px_rgba(0,255,255,0.2)]">
          <div className="text-sm text-cyan-400 uppercase tracking-widest mb-1">Telemetry</div>
          <p className="font-mono text-2xl text-white font-bold">SCORE: {Math.floor(snapshot.score)}</p>
          <p className="font-mono text-lg text-cyan-100">DIST: {snapshot.distanceMeters.toFixed(0)}m</p>
          <p className="font-mono text-lg text-fuchsia-400 font-bold">SPD: {snapshot.speedKph.toFixed(0)} KPH</p>
        </div>
        
        <div>
          {(snapshot.state === 'PLAYING' || snapshot.state === 'COUNTDOWN') && (
            <button
              className="pointer-events-auto bg-black/50 hover:bg-black/70 border border-white/20 text-white px-4 py-2 rounded transition-colors"
              onClick={onPause}
            >
              Esc to Pause
            </button>
          )}
        </div>
      </div>
      
      {/* Countdown Overlay */}
      {snapshot.state === 'COUNTDOWN' && countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-fuchsia-500 drop-shadow-[0_0_40px_rgba(255,0,255,0.8)] animate-pulse">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        </div>
      )}

      {/* Paused Overlay */}
      {snapshot.state === 'PAUSED' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto">
          <div className="text-center p-12 border border-cyan-500/30 rounded-xl bg-black/50 shadow-[0_0_30px_rgba(0,255,255,0.1)]">
            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-8 tracking-wider">PAUSED</h2>
            <div className="flex gap-6 justify-center">
              <button 
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded uppercase font-bold tracking-widest transition-colors" 
                onClick={onResume}
              >
                Resume
              </button>
              <button 
                className="bg-black border border-red-500/50 hover:bg-red-950 text-red-400 hover:text-red-300 px-8 py-4 rounded uppercase font-bold tracking-widest transition-colors" 
                onClick={onRestart}
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crashed Overlay */}
      {snapshot.state === 'CRASHED' && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/60 backdrop-blur-md pointer-events-auto">
          <div className="text-center p-12 border border-red-500 rounded-xl bg-black/90 shadow-[0_0_50px_rgba(255,0,0,0.5)]">
            <h2 className="text-7xl font-black text-red-500 mb-4 tracking-widest drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]">CRASHED!</h2>
            <div className="bg-red-950/50 p-6 rounded mb-8 border border-red-500/30">
              <h3 className="text-3xl text-white font-mono">FINAL SCORE</h3>
              <p className="text-6xl font-black text-cyan-400">{Math.floor(snapshot.score)}</p>
            </div>
            <div className="flex justify-center">
              <button 
                className="bg-red-600 hover:bg-red-500 text-white px-10 py-5 rounded uppercase font-bold tracking-widest transition-colors shadow-[0_0_20px_rgba(255,0,0,0.5)] text-xl" 
                onClick={onRestart}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom instructions */}
      <div className="text-center text-cyan-200/50 text-sm tracking-widest uppercase font-mono">
        {(snapshot.state === 'PLAYING' || snapshot.state === 'COUNTDOWN') && "W: Accelerate | S: Brake | A/D: Steer"}
      </div>
    </div>
  );
}
