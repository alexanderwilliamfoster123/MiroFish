import * as THREE from "three";
import gsap from "gsap";

// Mirrors the bundle's color setters (setAmbientColor / setBlocksColor /
// setAmbientIntensity / setSaturation / setDarken / setSpotLightIntensity),
// which GSAP-tween each value with `expo.out` over ~1.6s when navigating
// between projects. Colors are tweened component-wise (r,g,b) exactly as the
// original does (`oe.to(light.color, { r, g, b, ease:"expo.out", duration })`).

const DUR = 1.6;
const EASE = "expo.out";
const _c = new THREE.Color();

function tweenColor(target, hex, duration = DUR) {
  _c.set(hex);
  gsap.to(target, { r: _c.r, g: _c.g, b: _c.b, ease: EASE, duration, overwrite: true });
}

export class ColorController {
  constructor(refs) {
    this.refs = refs;
  }

  apply(p, instant = false) {
    const { ambientLight, keyLight, accentA, accentB, heroMaterials, fog, scene, envDome, composite } = this.refs;
    const d = instant ? 0 : DUR;
    // env dome "darken" colour = the ambient colour (bundle setAmbientColor)
    const darken = envDome ? envDome.material.customUniforms.uDarkenColor.value : null;

    if (instant) {
      ambientLight.color.set(p.ambient);
      ambientLight.intensity = p.ambientInt;
      keyLight.color.set(p.key);
      keyLight.intensity = p.keyInt;
      accentA.color.set(p.accentA);
      accentB.color.set(p.accentB);
      accentA.intensity = accentB.intensity = p.accInt;
      heroMaterials.forEach((m) => m.emissive.set(p.emissive));
      if (fog) fog.color.set(p.fog);
      scene.background.set(p.ambient);
      if (darken) darken.set(p.ambient);
      composite.uDarken.value = p.darken;
      composite.uSaturation.value = p.saturation;
      return;
    }
    if (darken) tweenColor(darken, p.ambient);

    // ambient light colour (also conceptually the env "darken" colour)
    tweenColor(ambientLight.color, p.ambient);
    gsap.to(ambientLight, { intensity: p.ambientInt, ease: EASE, duration: d, overwrite: true });

    // key + accent lights
    tweenColor(keyLight.color, p.key);
    gsap.to(keyLight, { intensity: p.keyInt, ease: EASE, duration: d, overwrite: true });
    tweenColor(accentA.color, p.accentA);
    tweenColor(accentB.color, p.accentB);
    gsap.to(accentA, { intensity: p.accInt, ease: EASE, duration: d, overwrite: true });
    gsap.to(accentB, { intensity: p.accInt, ease: EASE, duration: d, overwrite: true });

    // hero emissive (setBlocksColor)
    this.refs.heroMaterials.forEach((m) => tweenColor(m.emissive, p.emissive));

    // fog + background
    if (fog) tweenColor(fog.color, p.fog);
    tweenColor(scene.background, p.ambient);

    // composite darken (ease "none" in the original) + saturation (expo.out)
    gsap.to(composite.uDarken, { value: p.darken, ease: "none", duration: 0.5, overwrite: true });
    gsap.to(composite.uSaturation, { value: p.saturation, ease: EASE, duration: d, overwrite: true });
  }
}
