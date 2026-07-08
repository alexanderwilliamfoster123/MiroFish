// chunks.js — shared GLSL chunks copied VERBATIM from the lafys bundle.
// In the bundle these are interpolated into shaders as `${ae}`, `${Nt}`, `${Uc}`.
// Prepend the matching chunk wherever the original shader had that interpolation.

// `ae` (bundle line 4169) — the "Global" UBO block declaration + globals.
// Referenced by every shader that uses `resolution`/`aspect`/`time` and
// `uniformsGroups:[he.UBO]`.
export const ae = `uniform Global{vec2 resolution;vec2 resolutionUI;float aspect;float time;float dtRatio;};`;

// `Nt` (bundle line 5921) — matrix / billboard helpers (billboardModelMatrix()).
export const Nt = `vec3 getMatrixTranslation(mat4 mat){return vec3(mat[3]);}void setMatrixTranslation(inout mat4 mat,vec3 translation){mat[3].xyz=translation;}vec3 getMatrixScale(mat4 mat){vec3 scale=vec3(length(mat[0].xyz),length(mat[1].xyz),length(mat[2].xyz));return determinant(mat)<0.0 ? vec3(-scale.x,scale.yz): scale;}void setMatrixScale(inout mat4 mat,vec3 scale){vec3 invScale=1.0/getMatrixScale(mat);mat[0]*=invScale.x*scale.x;mat[1]*=invScale.y*scale.y;mat[2]*=invScale.z*scale.z;}mat4 getMatrixRotation(mat4 mat){mat4 m=mat4(1.0);vec3 scale=getMatrixScale(mat);m[0]=mat[0]/scale.x;m[1]=mat[1]/scale.y;m[2]=mat[2]/scale.z;return m;}void setMatrixRotation(inout mat4 mat,vec3 rotation){vec3 scale=getMatrixScale(mat);float x=rotation.x,y=rotation.y,z=rotation.z;float a=cos(x),b=sin(x);float c=cos(y),d=sin(y);float e=cos(z),f=sin(z);float ae=a*e,af=a*f,be=b*e,bf=b*f;mat[0].xyz=vec3(c*e,-c*f,d)*scale.x;mat[1].xyz=vec3(af+be*d,ae-bf*d,-b*c)*scale.y;mat[2].xyz=vec3(bf-ae*d,be+af*d,a*c)*scale.z;}void matrixCompose(inout mat4 mat,vec3 translation,vec4 quaternion,vec3 scale){float x=quaternion.x;float y=quaternion.y;float z=quaternion.z;float w=quaternion.w;float x2=x+x;float y2=y+y;float z2=z+z;float xx=x*x2;float xy=x*y2;float xz=x*z2;float yy=y*y2;float yz=y*z2;float zz=z*z2;float wx=w*x2;float wy=w*y2;float wz=w*z2;float sx=scale.x;float sy=scale.y;float sz=scale.z;mat[0]=vec4((1.0-(yy+zz))*sx,(xy+wz)*sx,(xz-wy)*sx,0.0);mat[1]=vec4((xy-wz)*sy,(1.0-(xx+zz))*sy,(yz+wx)*sy,0.0);mat[2]=vec4((xz+wy)*sz,(yz-wx)*sz,(1.0-(xx+yy))*sz,0.0);mat[3]=vec4(translation.xyz,1.0);}vec3 getViewRight(){return vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]);}vec3 getViewLeft(){return-getViewRight();}vec3 getViewUp(){return vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);}vec3 getViewDown(){return-getViewUp();}vec3 getViewBack(){return vec3(viewMatrix[0][2],viewMatrix[1][2],viewMatrix[2][2]);}vec3 getViewForward(){return-getViewBack();}mat4 billBoardMatrix(mat4 mat){mat4 m=mat4(1.0);vec3 scale=getMatrixScale(mat);m[0].xyz=getViewRight()*scale.x;m[1].xyz=getViewUp()*scale.y;m[2].xyz=getViewBack()*scale.z;m[3].xyz=getMatrixTranslation(mat);return m;}mat4 billboardModelMatrix(vec3 offset){mat4 m=billBoardMatrix(modelMatrix);setMatrixTranslation(m,offset);return m;}mat4 billboardModelMatrix(){return billBoardMatrix(modelMatrix);}`;

// `Uc` (bundle line 4771) — mip-aware noise fetch used by the frost material.
export const Uc = `vec4 getNoise(sampler2D tex,vec2 uv,vec2 offset){float invSize=1.0/float(textureSize(tex,0).x);return texture(tex,uv*invSize+offset);}`;

// `Ht` (bundle line 4747) — fit()/efit() remap helper family (float + vec3).
// The frost splat material prepends `${ae}${Ht}` into its fragment shader.
export const Ht = `float efit(float x,float a1,float a2,float b1,float b2){return b1+((x-a1)*(b2-b1))/(a2-a1);}float fit(float x,float a1,float a2,float b1,float b2){return clamp(efit(x,a1,a2,b1,b2),min(b1,b2),max(b1,b2));}float fit01(float x,float a1,float a2){return fit(x,0.0,1.0,a1,a2);}float fit10(float x,float a1,float a2){return fit(x,1.0,0.0,a1,a2);}float fit11(float x,float a1,float a2){return fit(x,-1.0,1.0,a1,a2);}vec3 efit(vec3 x,vec3 a1,vec3 a2,vec3 b1,vec3 b2){return b1+((x-a1)*(b2-b1))/(a2-a1);}vec3 fit(vec3 x,vec3 a1,vec3 a2,vec3 b1,vec3 b2){return clamp(efit(x,a1,a2,b1,b2),min(b1,b2),max(b1,b2));}vec3 fit01(vec3 x,vec3 a1,vec3 a2){return fit(x,vec3(0.0),vec3(1.0),a1,a2);}vec3 fit10(vec3 x,vec3 a1,vec3 a2){return fit(x,vec3(1.0),vec3(0.0),a1,a2);}vec3 fit11(vec3 x,vec3 a1,vec3 a2){return fit(x,vec3(-1.0),vec3(1.0),a1,a2);}`;

// The bundle renders through a deferred MRT G-buffer: custom GLSL3 shaders declare
// a secondary output `layout(location = 1) out highp vec4 gInfo;` (a glow/info
// attachment). This standalone port renders single-target, so we strip that
// secondary output (declaration + writes). Documented deviation — gInfo only fed
// the original engine's separate glow buffer and never affects the cube's color.
export function stripMRT(glsl) {
  return glsl
    .replace(/layout\s*\(\s*location\s*=\s*1\s*\)\s*out\s+[^;]*gInfo\s*;/g, '')
    .replace(/gInfo\s*=[^;]*;/g, '');
}
