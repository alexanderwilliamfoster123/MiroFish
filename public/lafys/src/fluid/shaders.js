// ───────────────────────────────────────────────────────────────────────────
// Navier–Stokes GPU fluid — GLSL ported 1:1 from lafys.com (bundle.js).
// Original const names kept in comments for traceability. RawShaderMaterial +
// GLSL3: vertex shaders declare `in vec3 position; in vec2 uv;`, fragments use
// `out vec4 FragColor`. #define GLSLIFY 1 is preserved verbatim.
// ───────────────────────────────────────────────────────────────────────────

// Co — common "face" vertex (shrinks the quad by the boundary `bounds`)
export const faceVert = `precision mediump float;
#define GLSLIFY 1
in vec3 position;in vec2 uv;uniform vec2 px;uniform vec2 bounds;out vec2 vUv;void main(){vec3 pos=position;vec2 scale=1.0-bounds*2.0;pos.xy=pos.xy*scale;vUv=vec2(0.5)+(pos.xy)*0.5;gl_Position=vec4(pos,1.0);}`;

// VT — boundary line vertex (pushes the 1px border inward by `px`)
export const boundaryVert = `precision mediump float;
#define GLSLIFY 1
in vec3 position;in vec2 uv;uniform vec2 px;out vec2 vUv;void main(){vec3 pos=position;vUv=0.5+pos.xy*0.5;vec2 n=sign(pos.xy);pos.xy=abs(pos.xy)-px*1.0;pos.xy*=n;gl_Position=vec4(pos,1.0);}`;

// XT — mouse-force splat vertex (places a small quad at `center`, size `scale`)
export const mouseVert = `precision mediump float;
#define GLSLIFY 1
in vec3 position;in vec2 uv;uniform vec2 center;uniform vec2 scale;uniform vec2 px;out vec2 vUv;void main(){vec2 pos=position.xy*scale*2.0*px+center;vUv=uv;gl_Position=vec4(pos,0.0,1.0);}`;

// Sf — advection (BFECC / MacCormack back-and-forth error compensation)
export const advectionFrag = `precision mediump float;
#define GLSLIFY 1
uniform sampler2D velocity;uniform float dt;uniform vec2 fboSize;in vec2 vUv;out vec4 FragColor;void main(){vec2 ratio=max(fboSize.x,fboSize.y)/fboSize;vec2 spot_new=vUv;vec2 vel_old=texture(velocity,vUv).xy;vec2 spot_old=spot_new-vel_old*dt*ratio;vec2 vel_new1=texture(velocity,spot_old).xy;vec2 spot_new2=spot_old+vel_new1*dt*ratio;vec2 error=spot_new2-spot_new;vec2 spot_new3=spot_new-error/2.0;vec2 vel_2=texture(velocity,spot_new3).xy;vec2 spot_old2=spot_new3-vel_2*dt*ratio;vec2 newVel2=texture(velocity,spot_old2).xy;FragColor=vec4(newVel2,0.0,0.0);}`;

// WT — divergence
export const divergenceFrag = `precision mediump float;
#define GLSLIFY 1
uniform sampler2D velocity;uniform float dt;uniform vec2 px;in vec2 vUv;out vec4 FragColor;void main(){float x0=texture(velocity,vUv-vec2(px.x,0)).x;float x1=texture(velocity,vUv+vec2(px.x,0)).x;float y0=texture(velocity,vUv-vec2(0,px.y)).y;float y1=texture(velocity,vUv+vec2(0,px.y)).y;float divergence=(x1-x0+y1-y0)/2.0;FragColor=vec4(divergence/dt);}`;

// $T — mouse-force splat fragment (radial falloff, additive blend)
export const mouseFrag = `precision mediump float;
#define GLSLIFY 1
uniform vec2 force;uniform vec2 center;uniform vec2 scale;uniform vec2 px;in vec2 vUv;out vec4 FragColor;void main(){vec2 circle=(vUv-0.5)*2.0;float d=1.0-min(length(circle),1.0);d*=d;FragColor=vec4(force*d,0,1);}`;

// YT — pressure Jacobi iteration (poisson solve)
export const poissonFrag = `precision mediump float;
#define GLSLIFY 1
uniform sampler2D pressure;uniform sampler2D divergence;uniform vec2 px;in vec2 vUv;out vec4 FragColor;void main(){float p0=texture(pressure,vUv+vec2(px.x*2.0,0)).r;float p1=texture(pressure,vUv-vec2(px.x*2.0,0)).r;float p2=texture(pressure,vUv+vec2(0,px.y*2.0)).r;float p3=texture(pressure,vUv-vec2(0,px.y*2.0)).r;float div=texture(divergence,vUv).r;float newP=(p0+p1+p2+p3)/4.0-div;FragColor=vec4(newP);}`;

// ZT — pressure gradient subtract
export const pressureFrag = `precision mediump float;
#define GLSLIFY 1
uniform sampler2D pressure;uniform sampler2D velocity;uniform float dt;uniform vec2 px;in vec2 vUv;out vec4 FragColor;void main(){float step=1.0;float p0=texture(pressure,vUv+vec2(px.x*step,0)).r;float p1=texture(pressure,vUv-vec2(px.x*step,0)).r;float p2=texture(pressure,vUv+vec2(0,px.y*step)).r;float p3=texture(pressure,vUv-vec2(0,px.y*step)).r;vec2 v=texture(velocity,vUv).xy;vec2 gradP=vec2(p0-p1,p2-p3)*0.5;v=v-dt*gradP;FragColor=vec4(v,0.0,1.0);}`;

// QT — viscosity (disabled by default in the original; kept verbatim, incl. the
// original's `gl_FragColor` write — only compiled if viscosity is enabled).
export const viscosityFrag = `precision mediump float;
#define GLSLIFY 1
uniform sampler2D velocity;uniform sampler2D velocity_new;uniform float v;uniform vec2 px;uniform float dt;in vec2 vUv;out vec4 FragColor;void main(){vec2 old=texture(velocity,vUv).xy;vec2 new0=texture(velocity_new,vUv+vec2(px.x*2.0,0)).xy;vec2 new1=texture(velocity_new,vUv-vec2(px.x*2.0,0)).xy;vec2 new2=texture(velocity_new,vUv+vec2(0,px.y*2.0)).xy;vec2 new3=texture(velocity_new,vUv-vec2(0,px.y*2.0)).xy;vec2 new=4.0*old+v*dt*(new0+new1+new2+new3);new/=4.0*(1.0+v*dt);FragColor=vec4(new,0.0,0.0);}`;
