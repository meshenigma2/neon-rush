import * as THREE from 'three';
import { GAME_CONFIG, LANES } from '../config/constants';
import { GameRenderer } from '../renderer/Renderer';
import { InputManager } from '../core/InputManager';

export class PlayerController {
  private scene: THREE.Scene;
  private mesh: THREE.Group;
  
  private targetLaneIndex: number;
  private currentX: number;
  private isTransitioning: boolean = false;
  private speedKph: number;

  constructor(renderer: GameRenderer) {
    this.scene = renderer.getScene();
    
    this.speedKph = GAME_CONFIG.gameplay.defaultSpeedKph;
    
    this.targetLaneIndex = Math.floor(GAME_CONFIG.world.laneCount / 2);
    this.currentX = LANES[this.targetLaneIndex].worldX;

    this.mesh = new THREE.Group();
    
    // Vibrant sports car paint!
    const bodyMat = new THREE.MeshPhysicalMaterial({ 
      color: 0xcc2222, 
      roughness: 0.1, 
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    
    const glassMat = new THREE.MeshStandardMaterial({ 
      color: 0xcc2222, 
      roughness: 0.0, 
      metalness: 0.9 
    });
    
    const headlightMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 4 });
    const taillightMat = new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0xff00ff, emissiveIntensity: 4 });

    const createPart = (geo: THREE.BufferGeometry, mat: THREE.Material, y: number, cast: boolean = true) => {
      const p = new THREE.Mesh(geo, mat);
      p.position.y = y;
      p.castShadow = cast;
      p.receiveShadow = true;
      return p;
    };

    const chassis = createPart(new THREE.BoxGeometry(1.8, 0.5, 4.0), bodyMat, 0.35);
    this.mesh.add(chassis);

    const cabin = createPart(new THREE.BoxGeometry(1.4, 0.5, 2.0), glassMat, 0.85);
    cabin.position.z = 0.3;
    this.mesh.add(cabin);

    const mirrorGeo = new THREE.BoxGeometry(0.3, 0.2, 0.2);
    const mirrorL = createPart(mirrorGeo, bodyMat, 0.7);
    mirrorL.position.set(-0.95, 0.7, -0.4);
    this.mesh.add(mirrorL);
    
    const mirrorR = createPart(mirrorGeo, bodyMat, 0.7);
    mirrorR.position.set(0.95, 0.7, -0.4);
    this.mesh.add(mirrorR);

    const hlGeo = new THREE.BoxGeometry(0.5, 0.15, 0.1);
    const hlL = createPart(hlGeo, headlightMat, 0.45, false);
    hlL.position.set(-0.6, 0.45, -2.01);
    this.mesh.add(hlL);
    
    const hlR = createPart(hlGeo, headlightMat, 0.45, false);
    hlR.position.set(0.6, 0.45, -2.01);
    this.mesh.add(hlR);

    const tlGeo = new THREE.BoxGeometry(0.6, 0.15, 0.1);
    const tlL = createPart(tlGeo, taillightMat, 0.45, false);
    tlL.position.set(-0.55, 0.45, 2.01);
    this.mesh.add(tlL);
    
    const tlR = createPart(tlGeo, taillightMat, 0.45, false);
    tlR.position.set(0.55, 0.45, 2.01);
    this.mesh.add(tlR);

    const spoilerBase = createPart(new THREE.BoxGeometry(1.6, 0.05, 0.4), bodyMat, 0.9);
    spoilerBase.position.z = 1.8;
    this.mesh.add(spoilerBase);

    const spoilerStrutGeo = new THREE.BoxGeometry(0.1, 0.3, 0.2);
    const strutL = createPart(spoilerStrutGeo, bodyMat, 0.75);
    strutL.position.set(-0.6, 0.75, 1.8);
    this.mesh.add(strutL);
    
    const strutR = createPart(spoilerStrutGeo, bodyMat, 0.75);
    strutR.position.set(0.6, 0.75, 1.8);
    this.mesh.add(strutR);

    this.mesh.position.set(this.currentX, 0, 0);
    this.scene.add(this.mesh);
  }

  public update(deltaSeconds: number, input: InputManager, playerZ: number): number {
    if (input.isActionActive('accelerate')) {
      this.speedKph += GAME_CONFIG.gameplay.acceleration * deltaSeconds;
    } else if (input.isActionActive('brake')) {
      this.speedKph -= GAME_CONFIG.gameplay.deceleration * deltaSeconds;
    } else {
      this.speedKph -= GAME_CONFIG.gameplay.naturalDeceleration * deltaSeconds;
    }

    this.speedKph = Math.max(0, Math.min(this.speedKph, GAME_CONFIG.gameplay.maxSpeedKph));

    if (!this.isTransitioning) {
      if (input.isActionJustPressed('left') && this.targetLaneIndex > 0) {
        this.targetLaneIndex--;
        this.isTransitioning = true;
      } else if (input.isActionJustPressed('right') && this.targetLaneIndex < GAME_CONFIG.world.laneCount - 1) {
        this.targetLaneIndex++;
        this.isTransitioning = true;
      }
    }

    const targetX = LANES[this.targetLaneIndex].worldX;
    if (this.currentX !== targetX) {
      const moveDistance = GAME_CONFIG.gameplay.laneChangeSpeed * deltaSeconds;
      
      if (this.currentX < targetX) {
        this.currentX = Math.min(this.currentX + moveDistance, targetX);
      } else {
        this.currentX = Math.max(this.currentX - moveDistance, targetX);
      }
      
      const diff = targetX - this.currentX;
      this.mesh.rotation.z = diff * 0.1;
      this.mesh.rotation.y = diff * 0.05; 
    } else {
      this.isTransitioning = false;
      this.mesh.rotation.z = 0;
      this.mesh.rotation.y = 0;
    }

    this.mesh.position.x = this.currentX;
    this.mesh.position.z = playerZ;

    return this.speedKph;
  }

  public getSpeed(): number {
    return this.speedKph;
  }

  public getLaneIndex(): number {
    return this.targetLaneIndex;
  }
  
  public getPositionX(): number {
    return this.currentX;
  }
  
  public reset(): void {
    this.speedKph = GAME_CONFIG.gameplay.defaultSpeedKph;
    this.targetLaneIndex = Math.floor(GAME_CONFIG.world.laneCount / 2);
    this.currentX = LANES[this.targetLaneIndex].worldX;
    this.isTransitioning = false;
    this.mesh.position.set(this.currentX, 0, 0);
  }

  public dispose(): void {
    this.scene.remove(this.mesh);
  }
}





