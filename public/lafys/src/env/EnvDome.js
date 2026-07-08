import * as THREE from "three";
import { envVert, envFrag } from "./glsl.js";

// Env dome material (bundle class u1): a MeshStandardMaterial whose body is
// replaced (onBeforeCompile) with the env shaders — samples the procedural sky
// (tSky), lays gradient bands over it, applies PBR lighting and a final darken
// blend toward uDarkenColor (tweened per palette). Verbatim shaders.
export class EnvDomeMaterial extends THREE.MeshStandardMaterial {
  constructor(skyTexture, darkenColor = "#464646") {
    super({ side: THREE.BackSide, fog: false });
    this.dithering = true;
    this.envMapIntensity = 0; // no neutral IBL on the dome → it takes the ambient/darken colour
    this.roughness = 1;
    this.metalness = 0;

    this.customUniforms = {
      uTime: { value: 0 },
      uMultiplier: { value: 2 },
      uDarken: { value: 1 },
      tSky: { value: skyTexture },
      uDarkenColor: { value: new THREE.Color(darkenColor) },
      uShader1Alpha: { value: 0.5 },
      uShader1Speed: { value: 0.5 },
      uShader1Scale: { value: 5.5 },
      uShader2Alpha: { value: 0 },
      uShader2Scale: { value: 13 },
      uShader3Alpha: { value: 0 },
      uShader3Speed: { value: 0 },
      uShader3Scale: { value: 0 },
      uShader1Mix3: { value: 1.5 },
    };

    this.onBeforeCompile = (shader) => {
      const u = this.customUniforms;
      for (const k of Object.keys(u)) shader.uniforms[k] = u[k];
      shader.vertexShader = envVert;
      shader.fragmentShader = envFrag;
    };
  }

  update(time) {
    this.customUniforms.uTime.value = time;
  }
}

export class EnvDome extends THREE.Mesh {
  constructor(skyTexture, darkenColor, atZ = 0) {
    const geo = new THREE.IcosahedronGeometry(300, 10);
    super(geo, new EnvDomeMaterial(skyTexture, darkenColor));
    this.position.set(0, -12.65, atZ);
    this.renderOrder = -1;
  }

  update(time) {
    this.material.update(time);
  }
}
