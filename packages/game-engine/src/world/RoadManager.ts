import * as THREE from 'three';
import { GameRenderer } from '../renderer/Renderer';
import { GAME_CONFIG, LANES } from '../config/constants';

interface RoadSegment {
  mesh: THREE.Group;
  zStart: number;
}

export class RoadManager {
  private scene: THREE.Scene;
  private segments: RoadSegment[] = [];
  
  private segmentLength = 100;
  private roadWidth: number;
  private activeSegments = 4;

  constructor(renderer: GameRenderer) {
    this.scene = renderer.getScene();
    
    this.roadWidth = GAME_CONFIG.world.laneCount * GAME_CONFIG.world.laneWidth + 2; 

    for (let i = 0; i < this.activeSegments; i++) {
      this.createSegment(-i * this.segmentLength);
    }
  }

  private createSegment(zStart: number): void {
    const group = new THREE.Group();

    // Asphalt Road
    const roadGeo = new THREE.PlaneGeometry(this.roadWidth, this.segmentLength);
    const roadMat = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.9,
      metalness: 0.1 
    });
    
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, -this.segmentLength / 2);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // Concrete shoulders/barriers
    const barrierGeo = new THREE.BoxGeometry(0.5, 0.4, this.segmentLength);
    const barrierMat = new THREE.MeshStandardMaterial({ 
      color: 0xaaaaaa, 
      roughness: 0.9 
    });

    const leftBarrier = new THREE.Mesh(barrierGeo, barrierMat);
    leftBarrier.position.set(-this.roadWidth / 2 - 0.25, 0.2, -this.segmentLength / 2);
    leftBarrier.castShadow = true;
    leftBarrier.receiveShadow = true;
    group.add(leftBarrier);

    const rightBarrier = new THREE.Mesh(barrierGeo, barrierMat);
    rightBarrier.position.set(this.roadWidth / 2 + 0.25, 0.2, -this.segmentLength / 2);
    rightBarrier.castShadow = true;
    rightBarrier.receiveShadow = true;
    group.add(rightBarrier);

    // White Lane Dividers
    const lineMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      roughness: 0.5 
    });
    
    for (let i = 0; i < GAME_CONFIG.world.laneCount - 1; i++) {
      const lineX = LANES[i].worldX + (GAME_CONFIG.world.laneWidth / 2);
      for (let z = 0; z < this.segmentLength; z += 4) {
        const lineGeo = new THREE.PlaneGeometry(0.15, 2);
        const lineMesh = new THREE.Mesh(lineGeo, lineMat);
        lineMesh.rotation.x = -Math.PI / 2;
        lineMesh.position.set(lineX, 0.01, -z - 1); 
        group.add(lineMesh);
      }
    }

    group.position.set(0, 0, zStart);
    this.scene.add(group);
    
    this.segments.push({
      mesh: group,
      zStart
    });
  }

  public update(playerZ: number): void {
    const firstSegment = this.segments[0];
    
    if (playerZ < firstSegment.zStart - this.segmentLength) {
      const lastSegment = this.segments[this.segments.length - 1];
      const newZStart = lastSegment.zStart - this.segmentLength;
      
      const recycled = this.segments.shift()!;
      recycled.zStart = newZStart;
      recycled.mesh.position.z = newZStart;
      
      this.segments.push(recycled);
    }
  }

  public dispose(): void {
    for (const seg of this.segments) {
      this.scene.remove(seg.mesh);
    }
  }
}
