import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class GameRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer;
  private dirLight: THREE.DirectionalLight;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    
    // Shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.scene = new THREE.Scene();
    
    // Desert Sunset Background
    const skyColor = new THREE.Color(0xff7744); // Warm sunset orange
    this.scene.background = skyColor;
    this.scene.fog = new THREE.FogExp2(skyColor, 0.006);

    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 4, 10);
    this.camera.lookAt(0, 0, -20);

    // Warm ambient light
    const ambientLight = new THREE.AmbientLight(0xaa7766, 1.0);
    this.scene.add(ambientLight);

    // Sunset light from the side
    this.dirLight = new THREE.DirectionalLight(0xffeedd, 2.5);
    // Positioned far to the right, low on the horizon
    this.dirLight.position.set(150, 40, -50);
    this.dirLight.castShadow = true;
    
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 300;
    
    const d = 60;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.001;

    this.scene.add(this.dirLight);

    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Soft bloom for sun glare and headlights
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      0.8, 
      0.5, 
      0.85
    );
    this.composer.addPass(bloomPass);
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public setCameraZ(z: number, shakeX: number = 0): void {
    this.camera.position.z = z + 10;
    this.camera.position.x = shakeX;
    
    // Move light with camera
    this.dirLight.position.z = z - 50;
    this.dirLight.target.position.set(0, 0, z - 20);
    this.dirLight.target.updateMatrixWorld();
  }

  public setTimeOfDay(time: 'DAY' | 'EVENING' | 'NIGHT'): void {
    if (time === 'DAY') {
      this.scene.background = new THREE.Color(0x88bbff);
      this.scene.fog = new THREE.Fog(0x88bbff, 50, 400);
      this.dirLight.color.setHex(0xffffff);
      this.dirLight.intensity = 3.0;
      this.dirLight.position.set(50, 150, -50);
    } else if (time === 'EVENING') {
      this.scene.background = new THREE.Color(0xff7744);
      this.scene.fog = new THREE.Fog(0xff7744, 20, 300);
      this.dirLight.color.setHex(0xffeedd);
      this.dirLight.intensity = 2.5;
      this.dirLight.position.set(150, 40, -50);
    } else if (time === 'NIGHT') {
      this.scene.background = new THREE.Color(0x050511);
      this.scene.fog = new THREE.Fog(0x050511, 20, 250);
      this.dirLight.color.setHex(0x5566aa);
      this.dirLight.intensity = 0.5;
      this.dirLight.position.set(50, 100, -50);
    }
  }

  public handleResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.composer.setSize(width, height);
  }

  public render(): void {
    this.composer.render();
  }

  public dispose(): void {
    this.renderer.dispose();
  }
}

