export type GameState = 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'CRASHED' | 'GAME_OVER';

export interface GameSettings {
  musicVolume?: number;
}

export interface GameEngineConfig {
  canvas: HTMLCanvasElement;
  settings?: GameSettings;
}

export interface GameSnapshot {
  state: GameState;
  score: number;
  distanceMeters: number;
  speedKph: number;
}

export interface GameEngine {
  start(): void;
  beginCountdown(): void;
  pause(): void;
  resume(): void;
  restart(): void;
  beginCountdown(): void;
  destroy(): void;
  getSnapshot(): GameSnapshot;
  setCarColor(hexColor: number): void;
  setTimeOfDay(time: 'DAY' | 'EVENING' | 'NIGHT'): void;
  setMuted(muted: boolean): void;
}



