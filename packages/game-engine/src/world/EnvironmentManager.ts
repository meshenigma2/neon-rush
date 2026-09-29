import * as THREE from 'three';
import { GameRenderer } from '../renderer/Renderer';

interface Rock {
  mesh: THREE.Mesh;
  zPos: number;
}

export class EnvironmentManager {
  private scene: THREE.Scene;
  private ground: THREE.Mesh;
  private rocks: Rock[] = [];
  
  private rockCount = 80;
  private recycleZ = 50;

  constructor(renderer: GameRenderer) {
    this.scene = renderer.getScene();

    // Desert Sand Floor
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0xdd9955, 
      roughness: 1.0, 
      metalness: 0.0 
    });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -0.1;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Desert Rocks/Mesas
    const rockGeo = new THREE.DodecahedronGeometry(1, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0xaa5533,
      roughness: 0.9,
      metalness: 0.1
    });

    for (let i = 0; i < this.rockCount; i++) {
      const mesh = new THREE.Mesh(rockGeo, rockMat);
      
      const width = 2 + Math.random() * 8;
      const height = 2 + Math.random() * 15;
      const depth = 2 + Math.random() * 8;
      mesh.scale.set(width, height, depth);
      
      const isLeft = i % 2 === 0;
      const xOffset = isLeft ? -(15 + Math.random() * 60) : (15 + Math.random() * 60);
      const zPos = -Math.random() * 400;
      
      mesh.position.set(xOffset, height / 2, zPos);
      
      // Random rotation
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.rotation.z = (Math.random() - 0.5) * 0.2;
      
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      this.scene.add(mesh);
      this.rocks.push({ mesh, zPos });
    }
  }

  public update(playerZ: number): void {
    // Keep ground moving with player
    this.ground.position.z = playerZ - 200;

    for (const rock of this.rocks) {
      if (rock.mesh.position.z > playerZ + this.recycleZ) {
        rock.mesh.position.z -= 450;
        
        const width = 2 + Math.random() * 8;
        const height = 2 + Math.random() * 15;
        const depth = 2 + Math.random() * 8;
        rock.mesh.scale.set(width, height, depth);
        rock.mesh.position.y = height / 2;
      }
    }
  }

  public dispose(): void {
    this.scene.remove(this.ground);
    for (const r of this.rocks) {
      this.scene.remove(r.mesh);
    }
  }
}
