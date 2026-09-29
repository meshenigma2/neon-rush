import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameRuntime } from '../src/core/GameRuntime';

vi.mock('../src/renderer/Renderer', () => {
  return {
    GameRenderer: vi.fn().mockImplementation(() => ({
      getScene: vi.fn().mockReturnValue({
        add: vi.fn(),
        remove: vi.fn(),
      }),
      setCameraZ: vi.fn(),
      handleResize: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
    })),
  };
});

describe('GameRuntime', () => {
  let canvas: HTMLCanvasElement;
  let runtime: GameRuntime;

  beforeEach(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    
    canvas = document.createElement('canvas');
    runtime = new GameRuntime({
      canvas,
      settings: {},
    });
  });

  it('starts in MENU state', () => {
    expect(runtime.getSnapshot().state).toBe('MENU');
  });

  it('transitions to PLAYING on start', () => {
    runtime.start();
    expect(runtime.getSnapshot().state).toBe('PLAYING');
  });

  it('can be paused and resumed', () => {
    runtime.start();
    runtime.pause();
    expect(runtime.getSnapshot().state).toBe('PAUSED');
    
    runtime.resume();
    expect(runtime.getSnapshot().state).toBe('PLAYING');
  });

  it('resets score on restart', () => {
    runtime.start();
    // mock game loop logic would normally increase score
    runtime.restart();
    expect(runtime.getSnapshot().score).toBe(0);
  });

  it('cleans up on destroy', () => {
    const disposeSpy = vi.spyOn(runtime as any, 'pause');
    runtime.destroy();
    expect(disposeSpy).toHaveBeenCalled();
  });
});
