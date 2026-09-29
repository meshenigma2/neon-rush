import * as THREE from 'three';
import { GameRenderer } from '../renderer/Renderer';

interface EnvironmentProp {
  mesh: THREE.Group;
  zPos: number;
}

export class EnvironmentManager {
  private scene: THREE.Scene;
  private ground: THREE.Mesh;
  private props: EnvironmentProp[] = [];
  
  private propCount = 100;
  private recycleZ = 50;
  
  // Billboard textures
  private billboardMats: THREE.MeshStandardMaterial[] = [];

  constructor(renderer: GameRenderer) {
    this.scene = renderer.getScene();

    // Ground
    const groundGeo = new THREE.PlaneGeometry(2000, 2000);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x223311, // Dark grassy green
      roughness: 1.0, 
      metalness: 0.0 
    });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -0.1;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    this.createBillboardTextures();

    // Create environment props (Trees and Billboards)
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 4, 8);
    const leavesGeo = new THREE.DodecahedronGeometry(2.5, 1);
    
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x442211, roughness: 0.9 });
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x114422, roughness: 0.8 });

    for (let i = 0; i < this.propCount; i++) {
      const group = new THREE.Group();
      let zPos = -Math.random() * 800;
      
      const isLeft = i % 2 === 0;
      
      // 10% chance to be a billboard, 90% chance to be a tree
      if (Math.random() > 0.9) {
        // Billboard
        this.buildBillboard(group);
        const xOffset = isLeft ? -25 : 25;
        group.position.set(xOffset, 0, zPos);
        group.rotation.y = isLeft ? Math.PI / 8 : -Math.PI / 8;
      } else {
        // Tree
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);
        
        // 2 to 3 leaf clumps
        const clumps = 2 + Math.floor(Math.random() * 2);
        for(let c = 0; c < clumps; c++) {
          const leaf = new THREE.Mesh(leavesGeo, leavesMat);
          leaf.position.set(
            (Math.random() - 0.5) * 2,
            3 + c * 2.5 + Math.random(),
            (Math.random() - 0.5) * 2
          );
          leaf.scale.setScalar(1 + Math.random() * 0.5);
          leaf.castShadow = true;
          leaf.receiveShadow = true;
          group.add(leaf);
        }
        
        const scale = 0.8 + Math.random() * 1.5;
        group.scale.setScalar(scale);
        
        // Rotate randomly for variety
        group.rotation.y = Math.random() * Math.PI;
        
        const xOffset = isLeft ? -(15 + Math.random() * 80) : (15 + Math.random() * 80);
        group.position.set(xOffset, 0, zPos);
      }
      
      this.scene.add(group);
      this.props.push({ mesh: group, zPos });
    }
  }

  private createBillboardTextures() {
    const messages = ['PLAY NEON RUSH', 'DRIVE FAST', 'RETRO ARCADE', 'HIGH SCORE'];
    
    messages.forEach((msg, idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      
      const grad = ctx.createLinearGradient(0, 0, 1024, 512);
      grad.addColorStop(0, idx % 2 === 0 ? '#111133' : '#331111');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);
      
      ctx.font = 'bold 80px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const neonColor = idx % 2 === 0 ? '#00ffff' : '#ff00ff';
      ctx.shadowColor = neonColor;
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#ffffff';
      
      ctx.fillText(msg, 512, 256);
      ctx.shadowBlur = 40;
      ctx.fillText(msg, 512, 256);
      
      const tex = new THREE.CanvasTexture(canvas);
      this.billboardMats.push(new THREE.MeshStandardMaterial({
        map: tex,
        emissiveMap: tex,
        emissive: 0xffffff,
        emissiveIntensity: 1.5,
        roughness: 0.2
      }));
    });
  }

  private buildBillboard(group: THREE.Group) {
    const poleGeo = new THREE.CylinderGeometry(0.3, 0.5, 15);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
    
    const poleL = new THREE.Mesh(poleGeo, poleMat);
    poleL.position.set(-4, 7.5, -0.5);
    poleL.castShadow = true;
    
    const poleR = new THREE.Mesh(poleGeo, poleMat);
    poleR.position.set(4, 7.5, -0.5);
    poleR.castShadow = true;
    
    group.add(poleL, poleR);
    
    const boardGeo = new THREE.PlaneGeometry(16, 8);
    const mat = this.billboardMats[Math.floor(Math.random() * this.billboardMats.length)];
    
    const board = new THREE.Mesh(boardGeo, mat);
    board.position.set(0, 12, 0); 
    group.add(board);
    
    const backMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const backBoard = new THREE.Mesh(boardGeo, backMat);
    backBoard.position.set(0, 12, -0.2);
    backBoard.rotation.y = Math.PI;
    group.add(backBoard);
  }

  public update(playerZ: number): void {
    this.ground.position.z = playerZ - 200;

    for (const prop of this.props) {
      if (prop.mesh.position.z > playerZ + this.recycleZ) {
        prop.mesh.position.z -= 850;
      }
    }
  }

  public dispose(): void {
    this.scene.remove(this.ground);
    for (const p of this.props) {
      this.scene.remove(p.mesh);
    }
  }
}
