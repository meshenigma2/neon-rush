export class InputManager {
  private keys: Set<string> = new Set();
  private prevKeys: Set<string> = new Set();

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onBlur = this.onBlur.bind(this);

    // Listen globally on window so focus isn't an issue
    window.addEventListener('keydown', this.onKeyDown, true);
    window.addEventListener('keyup', this.onKeyUp, true);
    window.addEventListener('blur', this.onBlur);
  }

  public update(): void {
    this.prevKeys = new Set(this.keys);
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

  private getMappedKeys(action: 'accelerate' | 'brake' | 'left' | 'right'): string[] {
    switch (action) {
      case 'accelerate': return ['w', 'arrowup'];
      case 'brake': return ['s', 'arrowdown'];
      case 'left': return ['a', 'arrowleft'];
      case 'right': return ['d', 'arrowright'];
    }
  }

  public isActionActive(action: 'accelerate' | 'brake' | 'left' | 'right'): boolean {
    return this.getMappedKeys(action).some(k => this.keys.has(k));
  }

  public isActionJustPressed(action: 'accelerate' | 'brake' | 'left' | 'right'): boolean {
    return this.getMappedKeys(action).some(k => this.keys.has(k) && !this.prevKeys.has(k));
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown, true);
    window.removeEventListener('keyup', this.onKeyUp, true);
    window.removeEventListener('blur', this.onBlur);
    this.keys.clear();
  }
}
