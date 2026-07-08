// plexus.js — "plexus" network effect (orbiting points + dynamic connecting
// lines) ported 1:1 from the lafys bundle (three r165, App3D-f554a111.js).
//   ZL -> PlexusPoints  (POINTS mesh, custom ShaderMaterial)   physical L6977..7059
//   $L -> PlexusLines   (LINE SEGMENTS mesh, custom ShaderMaterial)  physical L7060
//   sF -> Plexus        (manager: 18 treadmill points + dynamic connections) L7060
//
// GLSL is copied VERBATIM. The `${ae}${Rc}…` shader-chunk includes are the exact
// shared GLSL snippets from the bundle, inlined below as string constants.
import * as THREE from 'three';
import gsap from 'gsap';
import { Fe, ie, he } from './engine.js';
// `ae` (the `uniform Global{...}` UBO block matching he.UBO) is the shared chunk.
import { ae } from './chunks.js';

// ---------------------------------------------------------------------------
// GLSL chunks used only by plexus (verbatim from the bundle: Rc, Zo, Cr, Ue,
// h_, _a). `ae` is imported from ./chunks.js above and interpolated as `${ae}`.
// ---------------------------------------------------------------------------
const Rc = `#ifndef PI
#define PI 3.141592653589793
#endif
#ifndef HALF_PI
#define HALF_PI 1.5707963267948966
#endif
float backIn(float t){return pow(t,3.)-t*sin(t*PI);}float backOut(float t){return 1.0-backIn(1.0-t);}float backInOut(float t){float f=t<0.5? 2.0*t: 1.0-(2.0*t-1.0);float g=backIn(f);return t<0.5? 0.5*g: 0.5*(1.0-g)+0.5;}float bounceOut(float t){const float a=4.0/11.0;const float b=8.0/11.0;const float c=9.0/10.0;const float ca=4356.0/361.0;const float cb=35442.0/1805.0;const float cc=16061.0/1805.0;float t2=t*t;return t<a? 7.5625*t2: t<b? 9.075*t2-9.9*t+3.4: t<c? ca*t2-cb*t+cc: 10.8*t*t-20.52*t+10.72;}float bounceIn(float t){return 1.0-bounceOut(1.0-t);}float bounceInOut(float t){return t<0.5? 0.5*(1.0-bounceOut(1.0-t*2.0)): 0.5*bounceOut(t*2.0-1.0)+0.5;}float circularIn(float t){return 1.0-sqrt(1.0-t*t);}float circularOut(float t){return sqrt((2.0-t)*t);}float circularInOut(float t){return t<0.5? 0.5*(1.0-sqrt(1.0-4.0*t*t)): 0.5*(sqrt((3.0-2.0*t)*(2.0*t-1.0))+1.0);}float cubicIn(float t){return t*t*t;}float cubicOut(float t){float f=t-1.0;return f*f*f+1.0;}float cubicInOut(float t){return t<0.5? 4.0*t*t*t: 0.5*-pow(2.0-2.0*t,3.0)+1.0;}float elasticIn(float t){return sin(13.0*t*HALF_PI)*pow(2.0,10.0*(t-1.0));}float elasticOut(float t){return sin(-13.0*(t+1.0)*HALF_PI)*pow(2.0,-10.0*t)+1.0;}float elasticInOut(float t){return t<0.5? 0.5*sin(+13.0*HALF_PI*2.0*t)*pow(2.0,10.0*(2.0*t-1.0)): 0.5*sin(-13.0*HALF_PI*((2.0*t-1.0)+1.0))*pow(2.0,-10.0*(2.0*t-1.0))+1.0;}float expoIn(float t){return t==0.0 ? t : pow(2.0,10.0*(t-1.0));}float expoOut(float t){return t==1.0 ? t : 1.0-pow(2.0,-10.0*t);}float expoInOut(float t){return t==0.0||t==1.0? t: t<0.5?+0.5*pow(2.0,(20.0*t)-10.0):-0.5*pow(2.0,10.0-(t*20.0))+1.0;}float linear(float t){return t;}float quadraticIn(float t){return t*t;}float quadraticOut(float t){return-t*(t-2.0);}float quadraticInOut(float t){float p=2.0*t*t;return t<0.5 ? p :-p+(4.0*t)-1.0;}float quarticIn(float t){return pow(t,4.0);}float quarticOut(float t){return pow(1.0-t,3.0)*(t-1.0)+1.0;}float quarticInOut(float t){return t<0.5?+8.0*pow(t,4.0):-8.0*pow(1.0-t,4.0)+1.0;}float quinticIn(float t){return pow(t,5.0);}float quinticOut(float t){return 1.0-pow(1.0-t,5.0);}float quinticInOut(float t){return t<0.5?+16.0*pow(t,5.0):-0.5*pow(2.0-2.0*t,5.0)+1.0;}float sineIn(float t){return sin((t-1.0)*HALF_PI)+1.0;}float sineOut(float t){return sin(t*HALF_PI);}float sineInOut(float t){return-0.5*(cos(PI*t)-1.0);}
#define power0(t) linear(t)
#define power1In(t) quadraticIn(t)
#define power1Out(t) quadraticOut(t)
#define power1InOut(t) quadraticInOut(t)
#define power2In(t) cubicIn(t)
#define power2Out(t) cubicOut(t)
#define power2InOut(t) cubicInOut(t)
#define power3In(t) quarticIn(t)
#define power3Out(t) quarticOut(t)
#define power3InOut(t) quarticInOut(t)
#define power4In(t) quinticIn(t)
#define power4Out(t) quinticOut(t)
#define power4InOut(t) quinticInOut(t)
`;

const Zo = `float aastep(float threshold,float value){float afwidth=length(vec2(dFdx(value),dFdy(value)))*0.70710678118654757;return smoothstep(threshold-afwidth,threshold+afwidth,value);}`;

const Cr = `vec2 rotateUV(vec2 uv,float rotation,vec2 mid){float c=cos(rotation);float s=sin(rotation);return vec2(c*(uv.x-mid.x)+s*(uv.y-mid.y)+mid.x,c*(uv.y-mid.y)-s*(uv.x-mid.x)+mid.y);}vec2 rotateUV(vec2 uv,float rotation,float mid){return rotateUV(uv,rotation,vec2(mid));}vec2 rotateUV(vec2 uv,float rotation){return rotateUV(uv,rotation,vec2(0.5));}vec2 scaleUV(vec2 uv,float scale,vec2 mid){uv-=mid;uv*=1.0/scale;uv+=mid;return uv;}vec2 scaleUV(vec2 uv,float scale,float mid){return scaleUV(uv,scale,vec2(mid));}vec2 scaleUV(vec2 uv,float scale){return scaleUV(uv,scale,vec2(0.5));}`;

const Ue = `float _linstep(float begin,float end,float t){return clamp((t-begin)/(end-begin),0.0,1.0);}float _pl(vec2 _input,vec2 start,vec2 end,float margin,float progress){vec2 v=end-start;float dist=length(v);vec2 dir=v/dist;return dot(dir,_input-start-dir*(dist+margin)*progress);}float _pl(vec3 _input,vec3 start,vec3 end,float margin,float progress){vec3 v=end-start;float dist=length(v);vec3 dir=v/dist;return dot(dir,_input-start-dir*(dist+margin)*progress);}float falloff(float _input,float start,float end,float margin,float progress){float m=margin*sign(end-start);float p=mix(start-m,end,progress);return _linstep(p+m,p,_input);}float falloffsmooth(float _input,float start,float end,float margin,float progress){float m=margin*sign(end-start);float p=mix(start-m,end,progress);return smoothstep(p+m,p,_input);}float falloff(vec2 _input,vec2 start,vec2 end,float margin,float progress){return _linstep(0.0,-margin,_pl(_input,start,end,margin,progress));}float falloffsmooth(vec2 _input,vec2 start,vec2 end,float margin,float progress){return smoothstep(0.0,-margin,_pl(_input,start,end,margin,progress));}float falloff(vec3 _input,vec3 start,vec3 end,float margin,float progress){return _linstep(0.0,-margin,_pl(_input,start,end,margin,progress));}float falloffsmooth(vec3 _input,vec3 start,vec3 end,float margin,float progress){return smoothstep(0.0,-margin,_pl(_input,start,end,margin,progress));}`;

const h_ = `float parabola(float x,float k){return pow(4.0*x*(1.0-x),k);}float pcurve(float x,float a,float b){float k=pow(a+b,a+b)/(pow(a,a)*pow(b,b));return k*pow(x,a)*pow(1.0-x,b);}`;

const _a = `#define sinlayer(frX, frY, frZ) val += sin(dot(p, vec3(frX, frY, frZ)));
float sinenoise1(vec3 p){float val=0.0;sinlayer(1.5,3.4598,1.234);sinlayer(3.12,-3.234,4.221);sinlayer(0.355,2.3,-1.375);sinlayer(-0.156,-3.34,-0.4566);sinlayer(-4.1235,-0.485,-1.45);sinlayer(2.54,-0.879,-2.123);return val/6.0;}`;

// ---------------------------------------------------------------------------
// Module-scoped temp vectors (bundle globals: Mp / Sl / Ml)
// ---------------------------------------------------------------------------
const Mp = new THREE.Vector3(); // ZL.update scratch
const Sl = new THREE.Vector3(); // $L.update scratch (line start)
const Ml = new THREE.Vector3(); // $L.update scratch (line end)

// ===========================================================================
// ZL — plexus POINTS mesh
// ===========================================================================
class PlexusPoints {
  constructor(e) {
    this.parent = e;
    this.scene = this.parent.scene;
    this.ready = new Promise(t => { this.isReady = t; });
    this.init();
  }

  init() {
    const e = new THREE.BufferGeometry();
    e.setAttribute("position", new THREE.BufferAttribute(new Float32Array(this.parent.maxPlexusPoints * 3), 3));
    e.setAttribute("progress", new THREE.BufferAttribute(new Float32Array(this.parent.maxPlexusPoints), 1));
    const t = new THREE.ShaderMaterial({
      uniformsGroups: [he.UBO],
      uniforms: {
        uColor: { value: new THREE.Color("#666666") },
        uSize: { value: 50 },
        uHover: { value: 0 },
      },
      vertexShader: `
            //- edit
            ${ae}
            ${Rc}

            attribute float progress;
            uniform float uSize;
            uniform float uHover;

            flat varying float vProgress;
            varying vec3 wPos;

            void main() {
                vProgress = progress;

                vec3 pos = position;
                wPos = pos;

                float size = uSize * progress * uHover;
                vec4 viewPos = modelViewMatrix * vec4(pos, 1.0);

                gl_Position = projectionMatrix * viewPos;
                gl_PointSize = size / length(viewPos.xyz) * (resolution.y / 1300.0);
            }
            `,
      fragmentShader: `
            //- edit
            ${ae}
            ${Zo}
            ${Cr}

            uniform vec3 uColor;

            flat varying float vProgress;
            varying vec3 wPos;

            void main() {
                if (vProgress < 0.001) discard;
                vec2 uv = rotateUV(gl_PointCoord.xy, mix(1.3, 0.0, vProgress));
                uv = uv * 2.0 - 1.0;

                const float size = 0.1;
                float shape = 1.0 - aastep(size, abs(uv.x)) * aastep(size, abs(uv.y));
                if (shape < 0.001) discard;

                vec3 col = mix(vec3(0.0), uColor, smoothstep(0.75, 1.5, length(wPos)));
                gl_FragColor = vec4(col, 1.0);
            }
            `,
      depthWrite: false,
      depthTest: true,
      transparent: false,
      blending: THREE.AdditiveBlending, // pt = 2
    });
    this.mesh = new THREE.Points(e, t);
    this.mesh.frustumCulled = false;
    this.mesh.name = "plexus points";
    this.mesh.renderOrder = 20;
    this.parent.group.add(this.mesh);
    this.hoverTimeline = gsap.timeline({ paused: true });
    this.hoverTimeline.fromTo(t.uniforms.uHover, { value: 1 }, { value: 0, duration: .35 });
    this.isReady();
  }

  update() {
    let e = 0;
    for (let t = 0; t < this.mesh.geometry.attributes.position.count; t++) {
      const s = this.parent.currentPoints[t];
      Mp.set(0, 0, 0);
      let n = 0;
      s && (Mp.copy(s.position), n = s._displayVar);
      this.mesh.geometry.attributes.position.set(Mp.toArray(), t * 3);
      this.mesh.geometry.attributes.progress.array[t] = n;
      e = Math.max(e, n);
    }
    e > 0 ? (this.mesh.visible = true, ["position", "progress"].forEach(t => {
      this.mesh.geometry.attributes[t].needsUpdate = true;
    })) : this.mesh.visible = false;
  }

  click() { this.hoverTimeline.play(0); }
  resetClick() { this.hoverTimeline.pause().progress(0); }
}

// ===========================================================================
// $L — plexus LINE SEGMENTS mesh (yr = THREE.LineSegments)
// ===========================================================================
class PlexusLines {
  constructor(e) {
    this.parent = e;
    this.scene = this.parent.scene;
    this.maxLines = this.parent.maxPlexusPoints * this.parent.maxConnectionsPerPoint;
    this.ready = new Promise(t => { this.isReady = t; });
    this.init();
  }

  init() {
    const e = new THREE.BufferGeometry();
    e.setAttribute("position", new THREE.BufferAttribute(new Float32Array(this.maxLines * 2 * 3), 3));
    const t = new THREE.ShaderMaterial({
      uniformsGroups: [he.UBO],
      uniforms: {
        uColor: { value: new THREE.Color("#7f7f7f") },
        uHoverAnimation: { value: false },
        uHoverMix: { value: 0 },
      },
      vertexShader: `
            varying vec3 wPos;

            void main() {
                vec3 pos = position;
                wPos = pos;
                vec4 worldPos = modelMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
            `,
      fragmentShader: `
            uniform vec3 uColor;
            uniform bool uHoverAnimation;
            uniform float uHoverMix;

            varying vec3 wPos;

            ${ae}
            ${Ue}
            ${h_}
            ${_a}

            void main() {
                vec3 col = mix(vec3(0.0), uColor, smoothstep(0.75, 1.5, length(wPos)));

                float n1 = sinenoise1(wPos * 10.1 + vec3(0.0, 0.0, 0.0)) * 0.5 + 0.5;

                if (uHoverAnimation) {
                    // hovermix goes from -1 to 0
                    col = mix(col, vec3(uHoverMix < 0.0 ? 0.0 : 0.3), abs(uHoverMix));
                }

                col = mix(vec3(0.0), col, smoothstep(0.4, 0.5, n1));

                gl_FragColor = vec4(col, 1.0);
            }
            `,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending, // pt = 2
    });
    this.mesh = new THREE.LineSegments(e, t);
    this.mesh.frustumCulled = false;
    this.mesh.name = "plexus lines";
    this.mesh.renderOrder = 20;
    this.parent.group.add(this.mesh);
    this.hoverTimeline = gsap.timeline({ paused: true });
    this.hoverTimeline.fromTo(t.uniforms.uHoverMix, { value: 0 }, { value: 1, duration: .075, ease: "none" });
    this.hoverTimeline.fromTo(t.uniforms.uHoverMix, { value: -1 }, { value: 1, duration: .075, ease: "none" });
    this.hoverTimeline.fromTo(t.uniforms.uHoverMix, { value: -1 }, { value: 1, duration: .075, ease: "none" });
    this.hoverTimeline.fromTo(t.uniforms.uHoverMix, { value: 1 }, { value: -1, duration: .25, ease: "power2.out" });
    this.isReady();
  }

  update() {
    let e = 0;
    for (let t = 0; t < this.maxLines; t++) {
      Sl.set(0, 0, 0);
      Ml.set(0, 0, 0);
      const s = this.parent.connections[t];
      s && (Sl.copy(s.pt1.position), Ml.lerpVectors(s.pt1.position, s.pt2.position, s.progress), e = Math.max(e, s.progress));
      this.mesh.geometry.attributes.position.setXYZ(t * 2, Sl.x, Sl.y, Sl.z);
      this.mesh.geometry.attributes.position.setXYZ(t * 2 + 1, Ml.x, Ml.y, Ml.z);
    }
    e > 0 ? (this.mesh.visible = true, this.mesh.geometry.attributes.position.needsUpdate = true) : this.mesh.visible = false;
  }

  click() {
    this.mesh.material.uniforms.uHoverAnimation.value = true;
    this.hoverTimeline.play(0);
  }
  resetClick() { this.mesh.material.uniforms.uHoverAnimation.value = false; }
}

// ---------------------------------------------------------------------------
// Helpers used by sF (verbatim): eF, tF (repeat/pingpong), iF (Fisher-Yates)
// ---------------------------------------------------------------------------
const eF = i => i - Math.floor(i);
const tF = (i, e) => eF((i + e) / (2 * e)) * 2 * e - e;
function iF(i) {
  for (let e = i.length - 1; e > 0; e--) {
    const t = Math.floor(Math.random() * (e + 1));
    [i[e], i[t]] = [i[t], i[e]];
  }
}

// ===========================================================================
// sF — plexus MANAGER (public class)
// ===========================================================================
export class Plexus {
  constructor(e) {
    this.parent = e;
    this.scene = this.parent.scene;
    this.ready = new Promise(t => { this.isReady = t; });
    this.group = new THREE.Group();
    this.group.name = "plexus";
    this.group.position.y = this.parent.position.y;
    this.scene.add(this.group);
    this.totalPlexusPoints = 18;
    this.maxPlexusPoints = this.totalPlexusPoints;
    this.maxConnectionsPerPoint = 3;
    this.radius = this.parent.mesh.geometry.boundingSphere.radius * .9;
    this.treadmillDist = 3;
    this.plexusPoints = [];
    this.currentPoints = [];
    this.connections = [];
    this.connectTime = .35;
    this.init();
  }

  async init() {
    for (let e = 0; e < this.totalPlexusPoints; e++) {
      const t = new THREE.Object3D();
      const s = Math.random() * ie.TWO_PI;
      const n = ie.fit(Math.random(), 0, 1, .8, 1) * this.radius;
      t.position.set(Math.cos(s) * n, Math.random() * this.treadmillDist, Math.sin(s) * n);
      t.originalAngle = s;
      t.originalRadius = n;
      t.originalPosition = t.position.clone();
      t._hasTreadmilled = false;
      t._pieceIndex = e;
      t.__rand = Math.random();
      t._displayVar = 0;
      t._shown = false;
      t._canConnect = false;
      t._connections = new Set();
      this.plexusPoints.push(t);
    }
    this.pointMesh = new PlexusPoints(this);
    this.linesMesh = new PlexusLines(this);
    await Promise.all([this.pointMesh.ready, this.linesMesh.ready]);
    this.isReady();
  }

  update(e, t, s) {
    // Keep the plexus centred ON the crystal. The constructor only copied the
    // parent's Y, so with the crystal moved to logoSlot (z = radius) the plexus
    // was left at world z=0 — 15 units BEHIND the stone. Track full position.
    this.group.position.copy(this.parent.position);
    const n = Math.abs(s) < 1.25;
    const r = this.treadmillDist * .5;
    const a = this.treadmillDist * .5 * .75;
    this.plexusPoints.forEach(o => {
      const l = o.originalAngle + (o.__rand - .5) * .5 * Fe.time;
      const c = o.position.y;
      o.position.set(
        Math.cos(l) * o.originalRadius + .1 * Math.sin(Fe.time * .5 + o.__rand * 2.324),
        tF(o.originalPosition.y + o.__rand * Fe.time * .25, r),
        Math.sin(l) * o.originalRadius + .1 * Math.sin(Fe.time * .5 + o.__rand * 9.564)
      );
      const h = Math.abs(c - o.position.y) > r;
      o._canConnect = n && Math.abs(o.position.y) < a && !h;
    });
    this.plexusPoints.forEach((o, l) => {
      !o._canConnect && o._connections.size > 0 && this.connections.filter(h => (h.pt1 === o || h.pt2 === o) && !h.removing).forEach(h => {
        h.removing = true;
        gsap.to(h, {
          progress: 0, overwrite: true, ease: "none", duration: this.connectTime, onComplete: () => {
            this.connections.splice(this.connections.indexOf(h), 1);
            h.pt1._connections.delete(h.pt2);
            h.pt2._connections.delete(h.pt1);
          }
        });
      });
    });
    this.currentPoints.forEach(o => {
      if (this.connections.filter(l => (l.pt1 === o || l.pt2 === o) && !l.removing).length > 0) {
        if (o._shown) return;
        o._shown = true;
        gsap.to(o, { _displayVar: 1, overwrite: true, ease: "none", duration: this.connectTime });
      } else {
        if (!o._shown) return;
        o._shown = false;
        gsap.to(o, {
          _displayVar: 0, ease: "none", duration: this.connectTime, overwrite: true, onComplete: () => {
            this.connections.filter(l => (l.pt1 === o || l.pt2 === o) && !l.removing).length === 0 && this.currentPoints.splice(this.currentPoints.indexOf(o), 1);
          }
        });
      }
    });
    for (let o = 0; o < this.plexusPoints.length; o++) {
      const l = this.plexusPoints[o];
      if (!l._canConnect || l._connections.size === this.maxConnectionsPerPoint) continue;
      const c = [];
      for (let h = 0; h < this.plexusPoints.length; h++) {
        const d = this.plexusPoints[h];
        if (d === l || !d._canConnect || d._connections.size === this.maxConnectionsPerPoint || l._connections.has(d)) continue;
        const u = l.position.distanceTo(d.position);
        u < this.treadmillDist && c.push({ distance: u, pt: d });
      }
      for (iF(c); c.length > 0 && l._connections.size < this.maxConnectionsPerPoint;) {
        const h = c.shift();
        const d = !this.currentPoints.includes(l);
        const u = !this.currentPoints.includes(h.pt);
        const f = (d ? 1 : 0) + (u ? 1 : 0);
        if (this.currentPoints.length + f > this.maxPlexusPoints) continue;
        d && this.currentPoints.push(l);
        u && this.currentPoints.push(h.pt);
        const p = { pt1: l, pt2: h.pt, progress: 0, removing: false };
        gsap.to(p, { progress: 1, ease: "none", duration: this.connectTime });
        this.connections.push(p);
        l._connections.add(h.pt);
        h.pt._connections.add(l);
      }
      if (this.currentPoints.length === this.maxPlexusPoints) break;
    }
    this.pointMesh.update();
    this.linesMesh.update();
    this.group.rotation.copy(this.parent.rotation);
  }

  click() {
    this.linesMesh.click();
    this.pointMesh.click();
  }
  resetClick() {
    this.linesMesh.resetClick();
    this.pointMesh.resetClick();
  }
}
