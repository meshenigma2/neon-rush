export class InputManager {
  private keys: Set<string> = new Set();
  private prevKeys: Set<string> = new Set();

  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchActiveId: number | null = null;
  private swipeThreshold: number = 30;

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    window.addEventListener('keydown', this.onKeyDown, true);
    window.addEventListener('keyup', this.onKeyUp, true);
    window.addEventListener('blur', this.onBlur);
    
    // We pass passive: false so we can optionally prevent default if needed
    window.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
    window.addEventListener('touchcancel', this.onTouchEnd);
  }

  public update(): void {
    this.prevKeys = new Set(this.keys);
    
    // Clear momentary triggers (swipe / dpad clicks)
    this.keys.delete('touch_left');
    this.keys.delete('touch_right');
    this.keys.delete('touch_boost');
    this.keys.delete('gp_left');
    this.keys.delete('gp_right');

    this.pollGamepads();
  }

  private pollGamepads(): void {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    
    const gamepads = navigator.getGamepads();
    
    // Reset continuous gamepad states
    this.keys.delete('gp_accel');
    this.keys.delete('gp_brake');
    this.keys.delete('gp_boost');

    for (const gp of gamepads) {
      if (!gp) continue;

      // Axes: 0 is left analog horizontal
      if (gp.axes[0] < -0.5 || (gp.buttons[14] && gp.buttons[14].pressed)) {
        this.keys.add('gp_left');
      } else if (gp.axes[0] > 0.5 || (gp.buttons[15] && gp.buttons[15].pressed)) {
        this.keys.add('gp_right');
      }

      // RT/R2 (7) or A (0)
      if ((gp.buttons[7] && gp.buttons[7].pressed) || (gp.buttons[0] && gp.buttons[0].pressed)) {
        this.keys.add('gp_accel');
      }
      
      // LT/L2 (6) or X (2) or B (1)
      if ((gp.buttons[6] && gp.buttons[6].pressed) || (gp.buttons[2] && gp.buttons[2].pressed)) {
        this.keys.add('gp_brake');
      }

      // Boost: Y (3) or RB (5)
      if ((gp.buttons[3] && gp.buttons[3].pressed) || (gp.buttons[5] && gp.buttons[5].pressed)) {
        this.keys.add('gp_boost');
      }
    }
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.keys.add(e.key.toLowerCase());
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keys.delete(e.key.toLowerCase());
  }

  private onBlur(): void {
    this.keys.clear();
    this.prevKeys.clear();
  }

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length === 0) return;
    // Don't intercept if touching a button
    if ((e.target as HTMLElement).closest('button')) return;

    const touch = e.touches[e.touches.length - 1]; // Use latest touch
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchActiveId = touch.identifier;

    if (touch.clientX > window.innerWidth / 2) {
      this.keys.add('touch_accel');
    } else {
      this.keys.add('touch_brake');
    }
  }

  private onTouchMove(e: TouchEvent): void {
    if (this.touchActiveId === null) return;
    
    // Prevent scrolling when dragging on the game canvas
    if (!(e.target as HTMLElement).closest('button')) {
      e.preventDefault();
    }

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.touchActiveId) {
        const dx = touch.clientX - this.touchStartX;
        const dy = touch.clientY - this.touchStartY;

        if (Math.abs(dx) > this.swipeThreshold) {
          if (dx > 0) this.keys.add('touch_right');
          else this.keys.add('touch_left');
          this.touchStartX = touch.clientX; // Reset to allow continuous swiping
        } 
        
        if (dy < -this.swipeThreshold) {
          this.keys.add('touch_boost');
          this.touchStartY = touch.clientY;
        }
      }
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchActiveId) {
        this.touchActiveId = null;
        this.keys.delete('touch_accel');
        this.keys.delete('touch_brake');
      }
    }
  }

  private getMappedKeys(action: 'accelerate' | 'brake' | 'left' | 'right' | 'boost'): string[] {
    switch (action) {
      case 'accelerate': return ['w', 'arrowup', 'touch_accel', 'gp_accel'];
      case 'brake': return ['s', 'arrowdown', 'touch_brake', 'gp_brake'];
      case 'left': return ['a', 'arrowleft', 'touch_left', 'gp_left'];
      case 'right': return ['d', 'arrowright', 'touch_right', 'gp_right'];
      case 'boost': return [' ', 'spacebar', 'touch_boost', 'gp_boost'];
    }
  }

  public isActionActive(action: 'accelerate' | 'brake' | 'left' | 'right' | 'boost'): boolean {
    return this.getMappedKeys(action).some(k => this.keys.has(k));
  }

  public isActionJustPressed(action: 'accelerate' | 'brake' | 'left' | 'right' | 'boost'): boolean {
    return this.getMappedKeys(action).some(k => this.keys.has(k) && !this.prevKeys.has(k));
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown, true);
    window.removeEventListener('keyup', this.onKeyUp, true);
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('touchcancel', this.onTouchEnd);
    this.keys.clear();
  }
}
