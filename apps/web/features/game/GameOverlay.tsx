import React, { useEffect, useState } from 'react';
import { GameSnapshot, GameEngine } from '@neon-rush/game-contracts';

interface Props {
  snapshot: GameSnapshot | null;
  countdown: number | null;
  engine: GameEngine | null;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
}

export function GameOverlay({ snapshot, countdown, engine, onPause, onResume, onRestart }: Props) {
  const [pressedKeys, setPressedKeys] = useState({ w: false, a: false, s: false, d: false });
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        setPressedKeys(prev => ({ ...prev, [key.replace('arrowup', 'w').replace('arrowdown', 's').replace('arrowleft', 'a').replace('arrowright', 'd')]: true }));
      }
      if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false);
        else if (snapshot?.state === 'PLAYING' || snapshot?.state === 'COUNTDOWN') onPause();
        else if (snapshot?.state === 'PAUSED') onResume();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        setPressedKeys(prev => ({ ...prev, [key.replace('arrowup', 'w').replace('arrowdown', 's').replace('arrowleft', 'a').replace('arrowright', 'd')]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [snapshot?.state, showSettings, onPause, onResume]);

  if (!snapshot) return null;

  const kph = snapshot.speedKph;
  const mph = kph * 0.621371;
  const speedPercentage = Math.min(100, (kph / 400) * 100);

  const keyActiveStyle = "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,255,255,0.8)] border-cyan-300 scale-95";
  const keyInactiveStyle = "bg-black/50 text-cyan-500 border-cyan-800 backdrop-blur-sm shadow-[0_4px_0_rgba(0,0,0,0.5)]";

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 overflow-hidden select-none touch-none">
      
      {/* TOP BAR */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-3 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            <span className="text-xl font-bold text-cyan-400 tracking-widest uppercase italic mb-1">Score</span>
            <span className="text-5xl font-black text-white italic tracking-tighter">{Math.floor(snapshot.score).toLocaleString()}</span>
          </div>
          <div className="flex items-end gap-2 pl-1 drop-shadow-[0_0_5px_rgba(255,100,255,0.4)]">
            <span className="text-sm font-bold text-fuchsia-400 tracking-widest uppercase italic mb-0.5">Distance</span>
            <span className="text-2xl font-black text-fuchsia-100 italic">{Math.floor(snapshot.distanceMeters).toLocaleString()} m</span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setShowSettings(true)}
            className="pointer-events-auto bg-black/60 hover:bg-black border-2 border-white/10 hover:border-cyan-500 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur transition-all shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
          
          {(snapshot.state === 'PLAYING' || snapshot.state === 'COUNTDOWN') && (
            <button 
              onClick={onPause}
              className="pointer-events-auto bg-black/60 hover:bg-black border-2 border-white/10 hover:border-fuchsia-500 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="flex justify-between items-end">
        
        {/* Bottom Left: Input Indicators */}
        <div className="flex flex-col items-center gap-2 drop-shadow-xl">
          {isTouch ? (
            <div className="text-cyan-400 font-bold uppercase tracking-widest text-sm mt-1 bg-black/50 px-4 py-3 rounded border border-cyan-800 text-center shadow-lg">
              <span className="block mb-1 text-white">TAP RIGHT half to Accelerate</span>
              <span className="block mb-1 text-white">TAP LEFT half to Brake</span>
              <span className="block mb-1 text-fuchsia-400">SWIPE L/R to Steer</span>
              <span className="block text-red-400">SWIPE UP for NITRO</span>
            </div>
          ) : (
            <React.Fragment>
              <div className={`w-12 h-12 border-b-4 rounded-lg flex items-center justify-center text-xl font-black font-mono transition-all duration-75 ${pressedKeys.w ? keyActiveStyle : keyInactiveStyle}`}>W</div>
              <div className="flex gap-2">
                <div className={`w-12 h-12 border-b-4 rounded-lg flex items-center justify-center text-xl font-black font-mono transition-all duration-75 ${pressedKeys.a ? keyActiveStyle : keyInactiveStyle}`}>A</div>
                <div className={`w-12 h-12 border-b-4 rounded-lg flex items-center justify-center text-xl font-black font-mono transition-all duration-75 ${pressedKeys.s ? keyActiveStyle : keyInactiveStyle}`}>S</div>
                <div className={`w-12 h-12 border-b-4 rounded-lg flex items-center justify-center text-xl font-black font-mono transition-all duration-75 ${pressedKeys.d ? keyActiveStyle : keyInactiveStyle}`}>D</div>
              </div>
              <div className="text-cyan-400 font-bold uppercase tracking-widest text-xs mt-1 bg-black/50 px-2 py-1 rounded">Hold SPACE to Boost</div>
            </React.Fragment>
          )}
        </div>

        {/* Bottom Right: Advanced Speedometer */}
        <div className="flex flex-col items-end right-0">
          <div className="flex items-baseline gap-2 mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            <span className={`text-7xl font-black italic tracking-tighter ${kph > 250 ? 'text-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]' : 'text-white'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {Math.floor(kph).toString().padStart(3, '0')}
            </span>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-xl font-bold text-cyan-400 italic leading-none">KM/H</span>
              <span className="text-sm font-semibold text-gray-400 italic leading-none">{Math.floor(mph)} MP/H</span>
            </div>
          </div>
          
          <div className="w-64 h-3 bg-black/60 border border-white/10 rounded-full overflow-hidden flex transform -skew-x-12 mt-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-red-600 transition-all duration-75 ease-out"
              style={{ width: `${speedPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Countdown Overlay */}
      {snapshot.state === 'COUNTDOWN' && countdown !== null && !showSettings && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-fuchsia-500 drop-shadow-[0_0_60px_rgba(255,0,255,0.8)] animate-pulse italic pr-8">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        </div>
      )}

      {/* Paused Menu */}
      {snapshot.state === 'PAUSED' && !showSettings && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto z-20">
          <div className="text-center p-12 border-2 border-cyan-500/50 rounded-2xl bg-black/80 shadow-[0_0_50px_rgba(0,255,255,0.15)] transform skew-x-[-2deg]">
            <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-10 tracking-wider italic pr-4">PAUSED</h2>
            <div className="flex gap-6 justify-center">
              <button 
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-10 py-4 rounded-lg uppercase font-black tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] skew-x-[2deg]" 
                onClick={onResume}
              >
                Resume
              </button>
              <button 
                className="bg-transparent border-2 border-red-500/80 hover:bg-red-500 text-red-500 hover:text-white px-10 py-4 rounded-lg uppercase font-black tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,0,0,0.6)] skew-x-[2deg]" 
                onClick={onRestart}
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crashed Screen */}
      {snapshot.state === 'CRASHED' && !showSettings && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-950/80 backdrop-blur-md pointer-events-auto z-20">
          <div className="text-center p-12 border-2 border-red-500 rounded-3xl bg-black shadow-[0_0_100px_rgba(255,0,0,0.4)] transform scale-110">
            <h2 className="text-8xl font-black text-red-500 mb-6 tracking-tighter italic drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] pr-4">CRASHED</h2>
            <div className="bg-red-900/30 p-8 rounded-xl mb-10 border border-red-500/30 inline-block backdrop-blur-sm">
              <h3 className="text-2xl text-red-300 font-bold tracking-widest uppercase mb-2">Final Score</h3>
              <p className="text-7xl font-black text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{Math.floor(snapshot.score).toLocaleString()}</p>
            </div>
            <div className="flex justify-center">
              <button 
                className="bg-red-600 hover:bg-red-500 text-white px-12 py-5 rounded-xl uppercase font-black tracking-widest transition-all hover:scale-110 shadow-[0_0_30px_rgba(255,0,0,0.6)] text-2xl skew-x-[-5deg]" 
                onClick={() => {
                  setShowSettings(false);
                  onRestart();
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      {showSettings && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md pointer-events-auto z-30">
          <div className="bg-gray-900 border border-cyan-500 p-8 rounded-xl w-[500px] shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
              <h2 className="text-3xl font-black text-cyan-400 italic tracking-widest uppercase">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center bg-black/50 p-4 rounded-lg">
                <span className="text-xl font-bold text-white uppercase tracking-wider">Audio</span>
                <button 
                  onClick={() => {
                    setIsMuted(!isMuted);
                    engine?.setMuted(!isMuted);
                  }}
                  className={`px-6 py-2 rounded-lg font-bold uppercase transition-colors ${!isMuted ? 'bg-cyan-500 text-black' : 'bg-red-500 text-white'}`}
                >
                  {!isMuted ? 'UNMUTED' : 'MUTED'}
                </button>
              </div>

              <div className="bg-black/50 p-4 rounded-lg">
                <span className="block text-xl font-bold text-white uppercase tracking-wider mb-3">Time of Day</span>
                <div className="flex gap-2">
                  <button onClick={() => engine?.setTimeOfDay('DAY')} className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500 text-blue-200 hover:text-white font-bold rounded">DAY</button>
                  <button onClick={() => engine?.setTimeOfDay('EVENING')} className="flex-1 py-2 bg-orange-500/20 hover:bg-orange-500 text-orange-200 hover:text-white font-bold rounded">EVENING</button>
                  <button onClick={() => engine?.setTimeOfDay('NIGHT')} className="flex-1 py-2 bg-indigo-900/50 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold rounded">NIGHT</button>
                </div>
              </div>

              <div className="bg-black/50 p-4 rounded-lg">
                <span className="block text-xl font-bold text-white uppercase tracking-wider mb-3">Car Paint</span>
                <div className="flex justify-between px-4">
                  {[0xcc2222, 0x2255cc, 0x22cc55, 0xcccc22, 0x222222, 0xffffff].map(hex => (
                    <button 
                      key={hex}
                      onClick={() => engine?.setCarColor(hex)}
                      className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-white transition-all hover:scale-110 shadow-lg"
                      style={{ backgroundColor: '#' + hex.toString(16).padStart(6, '0') }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-500 text-sm">
              Press ESC to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
