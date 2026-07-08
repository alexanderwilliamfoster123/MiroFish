// mouseFrost.js — mouse-driven "frost splat" render-target effect.
// Ported 1:1 from the lafys three.js r165 bundle (App3D-f554a111.js):
//   JL extends fe  -> the frost SPLAT/accumulation ShaderMaterial (class FrostSplatMaterial below)
//   jL             -> the ping-pong RenderTarget manager (class MouseFrost below)
// GLSL is copied VERBATIM. Advection/velocity/decay math is copied VERBATIM.
//
// IDENTIFIER MAP (bundle -> here):
//   fe = THREE.ShaderMaterial   vt = THREE.WebGLRenderTarget   wg = FullScreenQuad
//   Mi = THREE.HalfFloatType    H  = THREE.Vector2             kt = THREE.PlaneGeometry
//   Ce = THREE.Mesh             le = loaders.le                Fe.time = elapsed seconds
//   ae/Ht = shared GLSL chunks (inlined verbatim below)

import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';   // = bundle's `wg`
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';
import { Fe, ie, he } from './engine.js';
import { le } from './loaders.js';
import { ae, Ht } from './chunks.js';   // verbatim shared GLSL chunks (ae = Global UBO block, Ht = fit() family)

// The cube sets geometry.boundsTree = new MeshBVH(...); make Mesh.raycast BVH-aware
// so `firstHitOnly` is honored (idempotent global patch).
THREE.Mesh.prototype.raycast = acceleratedRaycast;

// gsap "power4.out" easing (= Quint.easeOut, s => 1 - (1-s)**5). The bundle calls
// ie.ease(v, "power4.out"), but engine.js's ie.ease only takes a numeric exponent
// (in/out), so the string-named gsap ease is reproduced here EXACTLY (not simplified).
const power4Out = (s) => 1 - Math.pow(1 - s, 5);

// ============================================================================
// JL extends fe — frost SPLAT / accumulation shader material
// ============================================================================
class FrostSplatMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniformsGroups: [he.UBO],
            uniforms: {
                tBuffer: { value: null },
                tAdvect: { value: le.load("cubes/advect.png", "colordata-repeat") },
                uSplatCoords: { value: new THREE.Vector2 },
                uSplatPrevCoords: { value: new THREE.Vector2 },
                uSplatRadius: { value: 0 },
                // ↓ параметры РАСПРОСТРАНЕНИЯ следа (вынесены в uniform для панели; дефолты = как было)
                uWaveSpeed: { value: 1.0 },   // скорость расползания инея
                uDamping: { value: 0.985 },   // затухание/стойкость (выше -> держится дольше)
                uSplatSize: { value: 0.05 },  // радиус следа под курсором
                uAdvect: { value: 1.7 }       // снос узора шумом (подобрано юзером)
            },
            vertexShader: `
                ${ae}

                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                ${ae}
                ${Ht}

                const float aspectRatio = 1.0;
                float line(vec2 uv, vec2 point1, vec2 point2) {
                    vec2 pa = uv - point1, ba = point2 - point1;
                    pa.x *= aspectRatio;
                    ba.x *= aspectRatio;
                    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
                    return length(pa - ba * h);
                }

                float cubicIn(float t) { return t * t * t; }

                varying vec2 vUv;

                uniform sampler2D tBuffer;
                uniform sampler2D tAdvect;
                uniform vec2 uSplatCoords;
                uniform vec2 uSplatPrevCoords;
                uniform float uSplatRadius;
                uniform float uWaveSpeed;
                uniform float uDamping;
                uniform float uSplatSize;
                uniform float uAdvect;

                void main() {
                    vec2 uv = vUv;

                    float resolution = float(textureSize(tBuffer, 0));
                    vec2 invResolution = 1.0 / vec2(resolution);

                    // advect by noise
                    vec2 noiseUv = vUv;
                    vec2 advect = (texture2D(tAdvect, noiseUv * 3.0).xy * 2.0 - 1.0) * uAdvect;
                    uv += advect * invResolution;

                    // wave propagation
                    float wavespeed = uWaveSpeed;
                    vec2 offset = invResolution * wavespeed;
                    float l = texture2D(tBuffer, uv - vec2(offset.x, 0.0)).r;
                    float r = texture2D(tBuffer, uv + vec2(offset.x, 0.0)).r;
                    float t = texture2D(tBuffer, uv + vec2(0.0, offset.y)).r;
                    float b = texture2D(tBuffer, uv - vec2(0.0, offset.y)).r;
                    float nextVal = max(max(max(l, r), t), b);

                    // mouse line splat
                    float radius = uSplatSize * smoothstep(0.1, 1.0, uSplatRadius);
                    float splat = cubicIn(clamp(1.0 - line(vUv, uSplatPrevCoords.xy, uSplatCoords.xy) / radius, 0.0, 1.0));
                    nextVal += splat;

                    // damping and clamp
                    nextVal *= uDamping;
                    nextVal = min(nextVal, 1.0);

                    float rim = nextVal - texture2D(tBuffer, uv).r;

                    gl_FragColor = vec4(nextVal, rim, 0.0, 1.0);
                }
            `,
            depthTest: false
        });
    }
}

// ============================================================================
// jL — ping-pong RenderTarget manager
// ============================================================================
export class MouseFrost {
    constructor(parent, options = {}) {
        this.parent = parent;
        this.options = { width: 512, height: 512, ...options };

        const s = new THREE.WebGLRenderTarget(this.options.width, this.options.height, {
            type: THREE.HalfFloatType,
            depthBuffer: false
        });
        this.rts = [s, s.clone()];
        this.finalRT = s;
        this.fsQuad = new FullScreenQuad(new FrostSplatMaterial);
        this.renderer = he.renderer.webgl;

        // NOTE: Er interaction replaced by THREE.Raycaster+BVH (plumbing, values identical)
        // The bundle used `new Er({camera, meshes:[parent.mesh], onMove, onHover, onClick, ...})`;
        // enabled only when interior is on. We replicate the same gate + firstHitOnly raycast in update().
        this.interactionEnabled = !!this.parent.options.interior.enabled;

        this.splatPosition = new THREE.Vector2;
        this.splatLastPosition = new THREE.Vector2;
        this.splatLastMoveTime = 0;
        this.splatLastRenderTime = 0;
        this.splatTargetVelocity = 0;
        this.splatVelocity = 0;
        this.splatHovered = false;
        this.soundVelocity = 0;

        this.update();

        this.debug = false;
        if (this.debug && !parent.__debugAdded) {
            parent.__debugAdded = true;
            const r = new THREE.PlaneGeometry(2, 2);
            const a = new THREE.ShaderMaterial({
                uniforms: { tBuffer: { value: null } },
                vertexShader: `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    vec3 pos = position * 0.25 - 0.75;
                    gl_Position = vec4(pos, 1.0);
                }
            `,
                fragmentShader: `
                varying vec2 vUv;

                uniform sampler2D tBuffer;
                void main() {
                    vec3 color = texture2D(tBuffer, vUv).rgb;
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
                depthTest: false,
                transparent: true
            });
            this.debugMesh = new THREE.Mesh(r, a);
            this.debugMesh.renderOrder = 1e3;
            this.debugMesh.frustumCulled = false;
            this.parent.scene.add(this.debugMesh);
        }
    }

    // Bundle callbacks (fed by the Er interaction):
    //   onMouseMove(e){ const t=e.interactions[0]; if(!t)return; this.splatPosition.copy(t.uv1) }
    //   onMouseHover(e){ this.splatHovered = true }
    //   onMouseClick -> emits scene switch (app navigation, not part of the visual effect; omitted)
    // These are replicated inline in update() via a direct firstHitOnly raycast.

    update() {
        // NOTE: Er interaction replaced by THREE.Raycaster+BVH (plumbing, values identical).
        // Direct raycast against the cube; first hit's .uv feeds splatPosition (== bundle's uv1),
        // and a hit counts as a hover (== onMouseHover). Gated on interior.enabled like the bundle.
        if (this.interactionEnabled) {
            he.raycaster.firstHitOnly = true;
            he.raycaster.setFromCamera(he.pointer, he.camera);
            const hit = he.raycaster.intersectObject(this.parent.mesh)[0];
            if (hit) {
                if (hit.uv) this.splatPosition.copy(hit.uv);   // onMouseMove: splatPosition = uv1
                this.splatHovered = true;                      // onMouseHover
            }
        }

        if (Fe.time - this.splatLastRenderTime < .015) return;
        this.splatLastRenderTime = Fe.time;

        let e = this.splatPosition.distanceTo(this.splatLastPosition);
        const t = Fe.time - this.splatLastMoveTime;
        e > 0 && (this.splatLastMoveTime = Fe.time);
        // ФИКС: splatHovered ставится каждый кадр при наведении -> раньше обнуляло скорость каждый кадр (инея не было).
        // Сбрасываем трейл только на паузе (t>.15) или большом прыжке (e>.3), но НЕ на каждом кадре наведения.
        (t > .15 || e > .3) && (
            this.splatLastPosition.copy(this.splatPosition),
            this.splatTargetVelocity = 0,
            this.soundVelocity = 0,
            e = 0
        );
        this.splatHovered = false;

        this.splatTargetVelocity += e * 6;
        this.splatTargetVelocity *= .88;
        this.splatTargetVelocity = ie.clamp(this.splatTargetVelocity, 0, 1);
        this.splatVelocity = ie.lerp(this.splatVelocity, power4Out(this.splatTargetVelocity), .1);

        this.soundVelocity += e * 4;
        this.soundVelocity *= .98;
        this.soundVelocity = ie.clamp(this.soundVelocity, 0, 1);

        this.fsQuad.material.uniforms.uSplatCoords.value.copy(this.splatPosition);
        this.fsQuad.material.uniforms.uSplatPrevCoords.value.copy(this.splatLastPosition);
        this.fsQuad.material.uniforms.uSplatRadius.value = this.splatVelocity;
        this.splatLastPosition.copy(this.splatPosition);

        const s = this.renderer.getRenderTarget();
        this.fsQuad.material.uniforms.tBuffer.value = this.finalRT.texture;
        this.finalRT = this.finalRT === this.rts[0] ? this.rts[1] : this.rts[0];
        this.renderer.setRenderTarget(this.finalRT);
        this.fsQuad.render(this.renderer);
        this.renderer.setRenderTarget(s);
        this.debug && (this.debugMesh.material.uniforms.tBuffer.value = this.finalRT.texture);
    }
}
