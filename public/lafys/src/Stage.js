import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { ReflectiveFloor } from "./env/ReflectiveFloor.js";
import { EnvDome } from "./env/EnvDome.js";
import { ProceduralTexture } from "./env/ProceduralTexture.js";
import { skyFrag, wavesFrag } from "./env/glsl.js";
import { CameraController } from "./CameraController.js";

// The real home scene: a carousel of project panels, each a 35×23×7 slab of
// rounded-box instances, lit by a strong spotlight + colored ambient, in fog.
// Ported from bundle.js class p1 (workScene) / GA (BlockPanel).
export class Stage {
  constructor(renderer, perlinTexture, floorNormal, count = 6, manager = undefined) {
    this.renderer = renderer;
    this.manager = manager;
    this.heroMaterials = [];
    this.panels = [];
    this.count = count;
    this.theta = (Math.PI * 2) / count; // radians between panels
    this.itemWidth = 6.5;
    this.radius = Math.max(6, Math.round(this.itemWidth / 2 / Math.tan(Math.PI / count)));

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#1a1a1a");

    // camera (bundle FOV 55), placed outside the ring looking at the front panel
    this.camDist = 5.0;
    this.baseCamZ = this.radius + this.camDist;
    this.camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 2000);
    this.camera.position.set(0, 0, this.baseCamZ);
    this.camera.lookAt(0, 0, this.radius);
    // cinematic rig: parallax + banking roll (bundle class IT)
    this.cameraController = new CameraController(this.camera, new THREE.Vector3(0, 0, this.radius));

    // fog (bundle p1: grey 0..100; colour is tweened per palette for mood)
    this.fog = new THREE.Fog("#a294ff", this.radius - 2, this.radius + 16);
    this.scene.fog = this.fog;

    // environment map for PBR reflections (bundle used a cubemap we don't have)
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = this.envRT.texture;
    this.scene.environmentIntensity = 0.4;

    this.setLights();

    // procedural sky (B1) → tSky, and wave field (F1) → block displacement
    this.skyTex = new ProceduralTexture(renderer, skyFrag, {
      uShader1Alpha: { value: 0.5 },
      uShader1Speed: { value: 0.5 },
      uShader1Scale: { value: 5.5 },
      uShader2Speed: { value: 0 },
      uShader2Scale: { value: 0 },
      uShader1Mix3: { value: 1 },
      uShaderMix: { value: 1.5 },
    }, 512, 512);
    this.wavesTex = new ProceduralTexture(renderer, wavesFrag, { uRatio: { value: innerWidth / innerHeight } }, 160, 160);

    // environment: env dome (samples tSky) + reflective floor
    this.envDome = new EnvDome(this.skyTex.texture, "#464646", this.radius);
    this.scene.add(this.envDome);
    this.floor = new ReflectiveFloor(floorNormal, this.radius);
    this.scene.add(this.floor);

    // ЦЕНТРАЛЬНЫЙ ЛОГОТИП УБРАН (по просьбе) — его место (0,0.35,radius) займёт камень cube3.
    // позицию логотипа сохраняем, чтобы туда встал камень.
    this.logoSlot = { x: 0, y: 0.35, z: this.radius, scale: 0.68 };

    this.activeIndex = 0;
  }

  setLights() {
    // ambient (bundle: secondary colour, intensity 1)
    this.ambientLight = new THREE.AmbientLight("#464646", 1.0);
    this.scene.add(this.ambientLight);

    // spotlight key (bundle: white, intensity 220, angle π/4, penumbra .95)
    this.keyLight = new THREE.SpotLight(0xffffff, 220, 0, Math.PI / 4, 0.95, 1.2);
    this.keyLight.position.set(0, 0, this.radius + 3.7);
    this.keyLight.target.position.set(0, 0, this.radius);
    this.scene.add(this.keyLight);
    this.scene.add(this.keyLight.target);

    // two directional fills (bundle: white 1.5 / 1.0) — reused as accents
    this.accentA = new THREE.DirectionalLight(0xffffff, 1.5);
    this.accentA.position.set(10.5, 10, this.radius + 1);
    this.scene.add(this.accentA);
    this.accentB = new THREE.DirectionalLight(0xffffff, 1.0);
    this.accentB.position.set(-10.5, 5, this.radius - 1);
    this.scene.add(this.accentB);
  }

  // reveal the blocks (uReveal/uRevealSides 0→1) with a slight stagger
  revealIn() {
    // the particle logo assembles itself from a scattered shell — no reveal rig
  }

  // navigation = colour change + a camera dolly push-pull (+ a logo spin kick)
  goTo(index) {
    this.activeIndex = index;
    const cc = this.cameraController;
    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
    tl.to(cc.origin, { z: this.baseCamZ + 1.6, duration: 0.7, ease: "power2.out" }, 0);
    tl.to(cc.origin, { z: this.baseCamZ, duration: 1.3, ease: "power3.inOut" }, 0.7);
  }

  setFluidTexture(tex) {
    this.fluidTex = tex;
  }

  update(time, dt) {
    // procedural sky + wave field
    this.skyTex.render(time);
    this.wavesTex.render(time);
    this.envDome.update(time);

    // cinematic camera rig (parallax + banking roll)
    this.cameraController.update(dt);
    this.keyLight.position.x = this.camera.position.x * 0.175;
    this.keyLight.position.y = this.camera.position.y * 0.175;
  }

  resize(w, h) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.wavesTex.material.uniforms.uRatio.value = w / h;
    this.floor.resize(w, h);
  }
}
