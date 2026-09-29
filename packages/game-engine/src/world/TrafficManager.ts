import * as THREE from 'three';
import { GameRenderer } from '../renderer/Renderer';
import { GAME_CONFIG, LANES } from '../config/constants';

export interface TrafficCar {
  mesh: THREE.Group;
  laneIndex: number;
  speedKph: number;
  isActive: boolean;
}

export class TrafficManager {
  private scene: THREE.Scene;
  private pool: TrafficCar[] = [];
  private lastSpawnTimeMs: number = 0;

  constructor(renderer: GameRenderer) {
    this.scene = renderer.getScene();
    this.initPool();
  }

  private initPool(): void {
    const chassisGeo = new THREE.BoxGeometry(1.8, 0.6, 4.2);
    const cabinGeo = new THREE.BoxGeometry(1.6, 0.6, 2.2);
    const taillightGeo = new THREE.BoxGeometry(0.5, 0.2, 0.1);
    
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1 });
    const tailMat = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 2
    });

    const colors = [0x2266cc, 0x118833, 0xdd8800, 0x444444, 0x999999, 0x111111];

    for (let i = 0; i < GAME_CONFIG.traffic.poolSize; i++) {
      const group = new THREE.Group();
      
      const color = colors[i % colors.length];
      
      const bodyMat = new THREE.MeshStandardMaterial({ 
        color, 
        roughness: 0.3, 
        metalness: 0.5 
      });
      
      const chassis = new THREE.Mesh(chassisGeo, bodyMat);
      chassis.position.y = 0.4;
      chassis.castShadow = true;
      chassis.receiveShadow = true;
      group.add(chassis);
      
      const cabin = new THREE.Mesh(cabinGeo, glassMat);
      cabin.position.set(0, 1.0, 0);
      cabin.castShadow = true;
      cabin.receiveShadow = true;
      group.add(cabin);
      
      const tailL = new THREE.Mesh(taillightGeo, tailMat);
      tailL.position.set(-0.55, 0.5, 2.15);
      group.add(tailL);
      
      const tailR = new THREE.Mesh(taillightGeo, tailMat);
      tailR.position.set(0.55, 0.5, 2.15);
      group.add(tailR);

      group.visible = false;
      this.scene.add(group);
      
      this.pool.push({
        mesh: group,
        laneIndex: 0,
        speedKph: 0,
        isActive: false
      });
    }
  }

  public update(deltaSeconds: number, playerZ: number, timeMs: number, score: number): void {
    for (const car of this.pool) {
      if (car.isActive) {
        if (car.mesh.position.z > playerZ + GAME_CONFIG.traffic.despawnDistanceMeters) {
          car.isActive = false;
          car.mesh.visible = false;
        } else {
          const speedMps = car.speedKph / 3.6;
          car.mesh.position.z -= speedMps * deltaSeconds;
        }
      }
    }

    const difficultyLevel = Math.min(5, 1 + (score / 1000));
    const currentSpawnIntervalMs = (GAME_CONFIG.traffic.spawnIntervalSeconds / Math.sqrt(difficultyLevel)) * 1000;

    if (timeMs - this.lastSpawnTimeMs > currentSpawnIntervalMs) {
      this.spawnCar(playerZ, difficultyLevel);
      this.lastSpawnTimeMs = timeMs;
    }
  }

  private spawnCar(playerZ: number, difficultyLevel: number): void {
    const inactiveCar = this.pool.find(c => !c.isActive);
    if (!inactiveCar) return;

    inactiveCar.laneIndex = Math.floor(Math.random() * GAME_CONFIG.world.laneCount);
    
    const scaledMinSpeed = GAME_CONFIG.traffic.minSpeedKph * Math.sqrt(difficultyLevel);
    const scaledMaxSpeed = GAME_CONFIG.traffic.maxSpeedKph * (1 + (difficultyLevel * 0.2));

    inactiveCar.speedKph = scaledMinSpeed + Math.random() * (scaledMaxSpeed - scaledMinSpeed);
    
    inactiveCar.mesh.position.set(
      LANES[inactiveCar.laneIndex].worldX,
      0,
      playerZ - GAME_CONFIG.traffic.spawnDistanceMeters
    );
    
    inactiveCar.isActive = true;
    inactiveCar.mesh.visible = true;
  }

  public getActiveCars(): TrafficCar[] {
    return this.pool.filter(c => c.isActive);
  }

  public reset(): void {
    for (const car of this.pool) {
      car.isActive = false;
      car.mesh.visible = false;
    }
    this.lastSpawnTimeMs = 0;
  }

  public dispose(): void {
    for (const car of this.pool) {
      this.scene.remove(car.mesh);
    }
  }
}
