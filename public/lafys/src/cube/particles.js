// particles.js — lafys hero rising-particles, встроенные в ЕДИНУЮ сцену.
// GPGPU ping-pong FBO симуляция + инстанс-билборды. Шейдеры (sim + render) и данные —
// verbatim из snippets/lafys.co.in/hero-rising-particles (реальный движок lafys).
// Отличие только в обвязке: используем рендерер/камеру/группу переданной сцены, а не свой.
import * as THREE from 'three';

export async function initParticles({ renderer, camera, group, drawCount = 2200, fadeDistance, particleSize, opacity, bloomBoost } = {}) {
  const DATA = await fetch('https://qclay.design/lovable/lafys/data/particles-data.json').then(r => r.json());
  const b64f32 = (b64) => {
    const bin = atob(b64); const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return new Float32Array(u8.buffer);
  };
  const WIDTH = DATA.width, COUNT = DATA.count;
  const origData   = b64f32(DATA.originalTexture_b64);
  const aRandomArr = b64f32(DATA.aRandom_b64);
  const aScaleArr  = b64f32(DATA.aScale_b64);

  const U = {
    uParticleSize: 0.11,
    uScaleRange:   new THREE.Vector2(0.25, 1.8),
    uFadeDistance: new THREE.Vector2(5, 60),
    uOpacity:      0.6999999999999997,
    uCenterFade:   new THREE.Vector2(0.5, 1.0),
    uColor:        new THREE.Vector3(0.013702083043526807, 0.158960835050774, 0.6938717612856897),
    uBloomColor:   new THREE.Vector3(0.5499999999999999, 0.8500000000000028, 3.3200000000000016),
  };
  const SIM = { uMoveSpeed: 0.15, uDecay: 0.012, uLerpSpeed: 1.0, uMouseRadius: 0.25, uMouseRepelStrength: 1.0 };
  // подстройка под БЛИЗКУЮ камеру этой сцены (у lafys камера далеко) — не меняет шейдеры/эффект
  if (fadeDistance) U.uFadeDistance = new THREE.Vector2(fadeDistance[0], fadeDistance[1]);
  if (particleSize != null) U.uParticleSize = particleSize;
  if (opacity != null) U.uOpacity = opacity;
  if (bloomBoost != null) { U.uColor.multiplyScalar(bloomBoost); U.uBloomColor.multiplyScalar(bloomBoost); }

  const originalTexture = new THREE.DataTexture(origData, WIDTH, WIDTH, THREE.RGBAFormat, THREE.FloatType);
  originalTexture.needsUpdate = true;

  const rtType = renderer.capabilities.isWebGL2 ? THREE.FloatType : THREE.HalfFloatType;
  const makeRT = () => new THREE.WebGLRenderTarget(WIDTH, WIDTH, {
    minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat, type: rtType, depthBuffer: false, stencilBuffer: false });
  let readRT = makeRT(), writeRT = makeRT();

  const simVert = `varying vec2 vUv;varying vec3 vPosition;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform vec2 uTexelSize;void main(){vUv=uv;vL=vUv-vec2(uTexelSize.x,0.0);vR=vUv+vec2(uTexelSize.x,0.0);vT=vUv+vec2(0.0,uTexelSize.y);vB=vUv-vec2(0.0,uTexelSize.y);vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
  const simFrag = `
float map(float v,float a,float b,float c,float d){return c+(v-a)*(d-c)/(b-a);}
varying vec2 vUv;uniform sampler2D tOriginalTexture;uniform sampler2D tTexture;uniform float uTime;uniform float uNormalizedDelta;uniform float uDecay;uniform float uLerpSpeed;uniform float uMouseRadius;uniform float uMouseRepelStrength;uniform float uMoveSpeed;uniform mat4 uModelMatrix;uniform mat4 uViewMatrix;uniform mat4 uProjectionMatrix;uniform vec2 uMousePos;uniform float uSetup;float rand(vec2 co){return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);}vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}vec2 fade(vec2 t){return t*t*t*(t*(t*6.0-15.0)+10.0);}float cnoise(vec2 P){vec4 Pi=floor(P.xyxy)+vec4(0.0,0.0,1.0,1.0);vec4 Pf=fract(P.xyxy)-vec4(0.0,0.0,1.0,1.0);Pi=mod(Pi,289.0);vec4 ix=Pi.xzxz;vec4 iy=Pi.yyww;vec4 fx=Pf.xzxz;vec4 fy=Pf.yyww;vec4 i=permute(permute(ix)+iy);vec4 gx=2.0*fract(i*0.0243902439)-1.0;vec4 gy=abs(gx)-0.5;vec4 tx=floor(gx+0.5);gx=gx-tx;vec2 g00=vec2(gx.x,gy.x);vec2 g10=vec2(gx.y,gy.y);vec2 g01=vec2(gx.z,gy.z);vec2 g11=vec2(gx.w,gy.w);vec4 norm=1.79284291400159-0.85373472095314*vec4(dot(g00,g00),dot(g01,g01),dot(g10,g10),dot(g11,g11));g00*=norm.x;g01*=norm.y;g10*=norm.z;g11*=norm.w;float n00=dot(g00,vec2(fx.x,fy.x));float n10=dot(g10,vec2(fx.y,fy.y));float n01=dot(g01,vec2(fx.z,fy.z));float n11=dot(g11,vec2(fx.w,fy.w));vec2 fade_xy=fade(Pf.xy);vec2 n_x=mix(vec2(n00,n01),vec2(n10,n11),fade_xy.x);float n_xy=mix(n_x.x,n_x.y,fade_xy.y);return 2.3*n_xy;}void main(){vec2 uv=vUv;vec4 originalPosFetch=texture2D(tOriginalTexture,uv);vec3 offsets=originalPosFetch.xyz;float angle=originalPosFetch.w;float randomIndex=rand(vUv);float randomIndex2=rand(vUv+484854.);vec4 position=texture2D(tTexture,uv);vec3 currentPos=position.xyz;float life=position.w;if(uSetup>0.5){gl_FragColor=vec4(currentPos+vec3(0.,map(randomIndex,0.0,1.0,0.1,0.6),.0),cnoise(uv*50.+vec2(uv.x,2.0))*0.5+0.5);return;}if(life<0.0){gl_FragColor=vec4(offsets,1.0);return;}vec4 earlyViewPosition=uViewMatrix*uModelMatrix*vec4(currentPos,1.0);vec4 earlyProjection=uProjectionMatrix*earlyViewPosition;vec2 screenPos=earlyProjection.xy/earlyProjection.w*0.5+0.5;currentPos.y+=uMoveSpeed*uNormalizedDelta*uLerpSpeed*0.1*map(randomIndex,0.0,1.0,0.1,0.6);vec2 toMouse=screenPos-uMousePos;float distToMouse=length(toMouse);float mouseEffect=smoothstep(uMouseRadius,0.0,distToMouse);currentPos.x+=toMouse.x*mouseEffect*uNormalizedDelta*0.1*uMouseRepelStrength;currentPos.z+=toMouse.y*mouseEffect*uNormalizedDelta*0.1*uMouseRepelStrength;currentPos.y+=toMouse.y*mouseEffect*uNormalizedDelta*0.1*0.25*uMouseRepelStrength;life-=uDecay*uNormalizedDelta*0.1*(randomIndex2*0.5+0.5);gl_FragColor=vec4(currentPos,life);}`;

  const simUniforms = {
    tOriginalTexture: { value: originalTexture },
    tTexture:         { value: null },
    uTime:            { value: 0 },
    uNormalizedDelta: { value: 1 },
    uDecay:           { value: SIM.uDecay },
    uLerpSpeed:       { value: SIM.uLerpSpeed },
    uMouseRadius:     { value: SIM.uMouseRadius },
    uMouseRepelStrength: { value: SIM.uMouseRepelStrength },
    uMoveSpeed:       { value: SIM.uMoveSpeed },
    uModelMatrix:     { value: group.matrixWorld },
    uViewMatrix:      { value: camera.matrixWorldInverse },
    uProjectionMatrix:{ value: camera.projectionMatrix },
    uMousePos:        { value: new THREE.Vector2(0, 0) },
    uSetup:           { value: 1 },
    uTexelSize:       { value: new THREE.Vector2(1 / WIDTH, 1 / WIDTH) },
  };
  const simScene  = new THREE.Scene();
  const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: simVert, fragmentShader: simFrag, uniforms: simUniforms })));

  let cur = readRT, nxt = writeRT;
  function simStep() {
    simUniforms.tTexture.value = cur.texture;
    renderer.setRenderTarget(nxt);
    renderer.render(simScene, simCamera);
    renderer.setRenderTarget(null);
    const t = cur; cur = nxt; nxt = t;
  }

  const renderVert = `
attribute vec3 aRandom;attribute float aScale;attribute vec2 aFboUv;varying float vColorMix;varying vec2 vUv;varying vec2 vFboUv;uniform sampler2D tPosition;uniform float uTime;uniform float uParticleSize;uniform vec2 uScaleRange;varying mat3 vNormalMatrix;varying mat3 vNormalMatrixInverse;varying float vCenterFade;varying vec2 vScreenSpace;varying vec3 vViewPosition;varying vec3 vPosition;varying vec3 vNormal;varying vec4 vWorldPosition;varying vec3 vRandom;varying float vLife;uniform vec2 uCenterFade;
void main(){vUv=uv;vFboUv=aFboUv;vRandom=aRandom;vec4 particlePosition=texture2D(tPosition,aFboUv);vLife=particlePosition.w;vec4 transformedPosition=vec4(position,1.0);vec3 up=vec3(modelViewMatrix[0][1],modelViewMatrix[1][1],modelViewMatrix[2][1]);vec3 right=vec3(modelViewMatrix[0][0],modelViewMatrix[1][0],modelViewMatrix[2][0]);transformedPosition.xyz=right*transformedPosition.x+up*transformedPosition.y;
#ifdef USE_INSTANCING
transformedPosition=instanceMatrix*transformedPosition;
#endif
float scale=uParticleSize*aScale;scale*=mix(uScaleRange.x,uScaleRange.y,aRandom.x);scale*=mix(1.0,0.0,smoothstep(0.8,1.0,particlePosition.w));scale*=mix(0.0,1.0,smoothstep(0.0,0.40,particlePosition.w));transformedPosition.xyz*=scale;transformedPosition.xyz+=particlePosition.xyz;vPosition=transformedPosition.xyz;vec4 worldPosition=modelMatrix*transformedPosition;vWorldPosition=worldPosition;mat3 normalMatrixInverse=inverse(mat3(normalMatrix));vNormalMatrix=normalMatrix;vNormalMatrixInverse=normalMatrixInverse;vec3 transformedNormal=normal;
#ifdef USE_INSTANCING
mat3 m=mat3(instanceMatrix);transformedNormal/=vec3(dot(m[0],m[0]),dot(m[1],m[1]),dot(m[2],m[2]));transformedNormal=m*transformedNormal;
#endif
transformedNormal=normalMatrix*normal;vNormal=normalize(transformedNormal);vec4 mvPosition=modelViewMatrix*transformedPosition;gl_Position=projectionMatrix*mvPosition;vViewPosition=-mvPosition.xyz;vScreenSpace=gl_Position.xy/gl_Position.w*0.5+vec2(0.5);vCenterFade=smoothstep(uCenterFade.x,uCenterFade.y,length(vPosition.xyz));}`;
  const renderFrag = `
varying vec3 vRandom;varying vec2 vUv;varying float vLife;varying vec2 vFboUv;varying float vColorMix;varying float vCenterFade;varying mat3 vNormalMatrix;varying mat3 vNormalMatrixInverse;varying vec3 vViewPosition;varying vec3 vPosition;varying vec2 vScreenSpace;varying vec3 vNormal;varying vec4 vWorldPosition;uniform vec3 uColor;uniform vec3 uBloomColor;uniform vec2 uFadeDistance;uniform float uOpacity;
void main(){float alpha=1.0-step(0.9,2.0*length(vUv-0.5));if(alpha<0.5)discard;float fade=smoothstep(uFadeDistance.x,uFadeDistance.y,distance(vWorldPosition.xyz,cameraPosition.xyz));gl_FragColor=vec4(uColor+uBloomColor,vCenterFade*uOpacity*fade);}`;

  const renderMaterial = new THREE.ShaderMaterial({
    vertexShader: renderVert, fragmentShader: renderFrag,
    uniforms: {
      tPosition:     { value: null },
      uTime:         { value: 0 },
      uParticleSize: { value: U.uParticleSize },
      uScaleRange:   { value: U.uScaleRange },
      uFadeDistance: { value: U.uFadeDistance },
      uOpacity:      { value: U.uOpacity },
      uCenterFade:   { value: U.uCenterFade },
      uColor:        { value: U.uColor },
      uBloomColor:   { value: U.uBloomColor },
    },
    transparent: true, depthTest: true, depthWrite: false, blending: THREE.NormalBlending,
  });

  const N = Math.min(drawCount, COUNT);
  const stride = COUNT / N;
  const geometry = new THREE.PlaneGeometry(DATA.planeScale, DATA.planeScale);
  const aFboUv = new Float32Array(N * 2);
  const aRandomSub = new Float32Array(N * 3);
  const aScaleSub  = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const src = Math.min(COUNT - 1, Math.floor(i * stride));
    aFboUv[i * 2]     = ((src % WIDTH) + 0.5) / WIDTH;
    aFboUv[i * 2 + 1] = (Math.floor(src / WIDTH) + 0.5) / WIDTH;
    aRandomSub[i * 3]     = aRandomArr[src * 3];
    aRandomSub[i * 3 + 1] = aRandomArr[src * 3 + 1];
    aRandomSub[i * 3 + 2] = aRandomArr[src * 3 + 2];
    aScaleSub[i] = aScaleArr[src];
  }
  geometry.setAttribute('aFboUv',  new THREE.InstancedBufferAttribute(aFboUv, 2));
  geometry.setAttribute('aRandom', new THREE.InstancedBufferAttribute(aRandomSub, 3));
  geometry.setAttribute('aScale',  new THREE.InstancedBufferAttribute(aScaleSub, 1));

  const mesh = new THREE.InstancedMesh(geometry, renderMaterial, N);
  const I = new THREE.Matrix4();
  for (let i = 0; i < N; i++) mesh.setMatrixAt(i, I);
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  mesh.renderOrder = 2;
  group.add(mesh);

  // seed ping-pong с реальными spawn-позициями (иначе стартовый буфер пуст -> клубок в origin)
  const copyScene = new THREE.Scene();
  copyScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { tSrc: { value: originalTexture } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,
    fragmentShader: `varying vec2 vUv;uniform sampler2D tSrc;void main(){gl_FragColor=texture2D(tSrc,vUv);}`,
  })));
  renderer.setRenderTarget(cur);
  renderer.render(copyScene, simCamera);
  renderer.setRenderTarget(null);

  simUniforms.uSetup.value = 1; simStep(); simUniforms.uSetup.value = 0;

  // предпрогрев: жизненный цикл долгий -> прогоняем симуляцию, чтобы поле открылось уже сформированным
  camera.updateMatrixWorld(); group.updateMatrixWorld();
  simUniforms.uNormalizedDelta.value = 1;
  simUniforms.uModelMatrix.value.copy(group.matrixWorld);
  simUniforms.uViewMatrix.value.copy(camera.matrixWorldInverse);
  simUniforms.uProjectionMatrix.value.copy(camera.projectionMatrix);
  for (let i = 0; i < 1200; i++) simStep();

  const mouse = new THREE.Vector2(0, 0);
  addEventListener('pointermove', e => mouse.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight));

  return {
    mesh,
    step(delta) {
      const nd = delta * 60;
      camera.updateMatrixWorld(); group.updateMatrixWorld();
      simUniforms.uTime.value += delta;
      simUniforms.uNormalizedDelta.value = nd;
      simUniforms.uModelMatrix.value.copy(group.matrixWorld);
      simUniforms.uViewMatrix.value.copy(camera.matrixWorldInverse);
      simUniforms.uProjectionMatrix.value.copy(camera.projectionMatrix);
      simUniforms.uMousePos.value.copy(mouse);
      simStep();
      renderMaterial.uniforms.tPosition.value = cur.texture;
      renderMaterial.uniforms.uTime.value = simUniforms.uTime.value;
    },
  };
}
