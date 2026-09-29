import { GAME_CONFIG } from '../config/constants';

export class AudioManager {
  private ctx: AudioContext | null = null;
  
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  
  private isInitialized = false;

  public init(): void {
    if (this.isInitialized) return;
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0;
      this.engineGain.connect(this.ctx.destination);
      
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 50;
      this.engineOsc.connect(this.engineGain);
      this.engineOsc.start();
      
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  public updateEngineSound(speedKph: number, state: string): void {
    if (!this.ctx || !this.engineOsc || !this.engineGain) return;
    
    if (state === 'PLAYING') {
      const normalizedSpeed = speedKph / GAME_CONFIG.gameplay.maxSpeedKph;
      
      // Pitch goes from 50Hz to 150Hz
      const targetFreq = 50 + (normalizedSpeed * 100);
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
      
      // Volume increases with speed
      const targetVol = 0.05 + (normalizedSpeed * 0.15);
      this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);
    } else {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  public playCrashSound(): void {
    if (!this.ctx) return;
    
    // Create a burst of white noise
    const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Lowpass filter to make it sound muffled/bassy like an impact
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noiseSource.start();
  }

  public suspend(): void {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  public resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public dispose(): void {
    if (this.engineOsc) {
      this.engineOsc.stop();
      this.engineOsc.disconnect();
    }
    if (this.engineGain) {
      this.engineGain.disconnect();
    }
    if (this.ctx) {
      this.ctx.close();
    }
    this.isInitialized = false;
  }
}
