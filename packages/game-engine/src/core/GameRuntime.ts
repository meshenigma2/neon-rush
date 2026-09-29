import { GameEngine, GameEngineConfig, GameSnapshot, GameState } from '@neon-rush/game-contracts';
import { GameRenderer } from '../renderer/Renderer';
import { GAME_CONFIG } from '../config/constants';
import { RoadManager } from '../world/RoadManager';
import { PlayerController } from '../world/PlayerController';
import { TrafficManager } from '../world/TrafficManager';
import { EnvironmentManager } from '../world/EnvironmentManager';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';

export class GameRuntime implements GameEngine {
  private renderer: GameRenderer;
  private canvas: HTMLCanvasElement;
  private roadManager: RoadManager;
  private playerController: PlayerController;
  private trafficManager: TrafficManager;
  private inputManager: InputManager;
  private environmentManager: EnvironmentManager;
  private audioManager: AudioManager;
  
  private state: GameState = 'MENU';
  private score: number = 0;
  private distanceMeters: number = 0;
  
  private playerZ: number = 0;

  private animationFrameId: number | null = null;
  private lastTimeMs: number = 0;

  private resizeObserver: ResizeObserver;

  constructor(config: GameEngineConfig) {
    this.canvas = config.canvas;
    this.renderer = new GameRenderer(this.canvas);
    this.roadManager = new RoadManager(this.renderer);
    this.playerController = new PlayerController(this.renderer);
    this.trafficManager = new TrafficManager(this.renderer);
    this.environmentManager = new EnvironmentManager(this.renderer);
    this.inputManager = new InputManager();
    this.audioManager = new AudioManager();
    this.gameLoop = this.gameLoop.bind(this);

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.renderer.handleResize(width, height);
      }
    });
    this.resizeObserver.observe(this.canvas);
  }

    public beginCountdown(): void {
    if (this.state === 'PLAYING') return;
    this.state = 'COUNTDOWN';
    this.audioManager.init(); // Init audio context
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  }

  public start(): void {
    if (this.state === 'PLAYING') return;
    this.state = 'PLAYING';
    
    // Audio Context requires user gesture to start, calling init here guarantees we are in a gesture (from UI button)
    this.audioManager.init();
    this.audioManager.resume();
    
    this.lastTimeMs = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  public pause(): void {
    if (this.state === 'MENU' || this.state === 'PAUSED') return;
    if (this.state === 'COUNTDOWN') {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
      this.render();
      return;
    }
    this.state = 'PAUSED';
    this.audioManager.suspend();
    // Loop continues to render camera shake
  }

  public resume(): void {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.audioManager.resume();
    this.lastTimeMs = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  public restart(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.score = 0;
    this.distanceMeters = 0;
    this.playerZ = 0;
    this.state = 'MENU';
    
    this.roadManager.dispose();
    this.roadManager = new RoadManager(this.renderer);

    this.environmentManager.dispose();
    this.environmentManager = new EnvironmentManager(this.renderer);
    
    this.playerController.reset();
    this.trafficManager.reset();
    
    this.start();
  }

  public setCarColor(hexColor: number): void {
    this.playerController.setCarColor(hexColor);
  }

  public setTimeOfDay(time: 'DAY' | 'EVENING' | 'NIGHT'): void {
    this.renderer.setTimeOfDay(time);
  }
  
  public setMuted(muted: boolean): void {
    // audioManager.setMuted(muted) if implemented
  }

  public destroy(): void {
    this.pause();
    this.resizeObserver.disconnect();
    this.inputManager.dispose();
    this.trafficManager.dispose();
    this.environmentManager.dispose();
    this.roadManager.dispose();
    this.playerController.dispose();
    this.renderer.dispose();
    this.audioManager.dispose();
  }

  public getSnapshot(): GameSnapshot {
    return {
      state: this.state,
      score: this.score,
      distanceMeters: this.distanceMeters,
      speedKph: this.playerController ? this.playerController.getSpeed() : 0,
    };
  }

  private gameLoop(timeMs: number): void {
    if (this.state === 'MENU' || this.state === 'PAUSED') return;
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop);

    if (this.state === 'COUNTDOWN' || this.state === 'CRASHED') {
      this.render();
      if (this.state === 'CRASHED') {
          this.playerController.resetSpeed();
      }
      return;
    }

    let deltaSeconds = (timeMs - this.lastTimeMs) / 1000;
    this.lastTimeMs = timeMs;
    deltaSeconds = Math.min(deltaSeconds, GAME_CONFIG.engine.maxDeltaSeconds);
    
    this.update(deltaSeconds, timeMs);
    this.render();
    this.inputManager.update();
  }

  private checkCollisions(): void {
    const playerX = this.playerController.getPositionX();
    const hitDistanceX = 1.6;
    const hitDistanceZ = 4.0;

    const activeTraffic = this.trafficManager.getActiveCars();
    
    for (const car of activeTraffic) {
      const trafficX = car.mesh.position.x;
      const trafficZ = car.mesh.position.z;
      
      const diffX = Math.abs(playerX - trafficX);
      const diffZ = Math.abs(this.playerZ - trafficZ);
      
      if (diffX < hitDistanceX && diffZ < hitDistanceZ) {
        this.crash();
        return;
      }
    }
  }

  private crash(): void {
    this.state = 'CRASHED';
    this.audioManager.playCrashSound();
    this.audioManager.updateEngineSound(0, this.state); // silence engine
    // Loop continues to render camera shake
  }

  private update(deltaSeconds: number, timeMs: number): void {
    const speedKph = this.playerController.update(deltaSeconds, this.inputManager, this.playerZ);
    const speedMetersPerSecond = speedKph / 3.6;
    const distanceThisFrame = speedMetersPerSecond * deltaSeconds;
    
    this.distanceMeters += distanceThisFrame;
    const speedMultiplier = speedKph > 100 ? (speedKph / 100) : 1;
      this.score += (distanceThisFrame * 0.5) * speedMultiplier;
    this.playerZ -= distanceThisFrame;

    this.roadManager.update(this.playerZ);
    this.environmentManager.update(this.playerZ);
    this.trafficManager.update(deltaSeconds, this.playerZ, timeMs, this.score);
    this.renderer.setCameraZ(this.playerZ);
    
    this.audioManager.updateEngineSound(speedKph, this.state);
    
    this.checkCollisions();
  }

  private render(): void {
    this.renderer.render();
  }
}













