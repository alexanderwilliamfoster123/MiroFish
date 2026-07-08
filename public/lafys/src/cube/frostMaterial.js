// frostMaterial.js — 1:1 port of the minified `WL extends Ys` class
// (Ys = THREE.MeshPhysicalMaterial) from the lafys.inc production bundle
// (App3D-f554a111.js, three r165). GLSL preserved VERBATIM.
//
// GLSL chunks (from the bundle):
//   ${Uc}  -> getNoise(...)                      imported verbatim from ./chunks.js
//   ${Ht}  -> efit/fit/fit01/fit10/fit11 (float+vec3 overloads)  (bundle const Ht, inlined — not in chunks.js)
//   ${h_}  -> parabola/pcurve                    (bundle const h_, inlined — not in chunks.js)
// Identifier map: Ys=MeshPhysicalMaterial, Z=Color, H=Vector2, b=Vector3.
import * as THREE from 'three';
import { le } from './loaders.js';
import { Uc } from './chunks.js';

const Z = THREE.Color;
const H = THREE.Vector2;

export class FrostMaterial extends THREE.MeshPhysicalMaterial {
    constructor(awesomeSamples = 3) {
        super();
        this.defines.AWESOME_SAMPLES = awesomeSamples;
        this.uniforms = {
            tTriangles: { value: le.load("lafys/triangles_tiling.ktx2", "srgb-repeat") },
            tBlue: { value: le.load("noises/blue-8-128-rgb.ktx2", "colordata-repeat") },
            uBlueOffset: { value: new H },
            tMouseFrost: { value: null },
            uColorFrost: { value: new Z("#cfcfcf") },
            uPatternScale: { value: 17.0 },   // подобрано юзером
            uFrostStrength: { value: 0.45 },  // подобрано юзером
            uChromaticAberration: { value: .31 },   // подобрано юзером
            uTransmission: { value: 1 },
            uThickness: { value: 2 },
            uAttenuationDistance: { value: 0 },
            uAttenuationColor: { value: new Z("#ffffff") },
            uTransmissionSamplerSize: { value: new H },
            tTransmissionSamplerMap: { value: null },
            uResolution: { value: new H(1, 1) }
        };
        this.onBeforeCompile = t => {
            t.uniforms = { ...t.uniforms, ...this.uniforms };
            t.fragmentShader = `
                uniform float uChromaticAberration;
                uniform sampler2D tBlue;
                uniform vec2 uBlueOffset;
                uniform vec2 uResolution;

                uniform float uTransmission;
                uniform float uThickness;
                uniform float uAttenuationDistance;
                uniform vec3 uAttenuationColor;

                ${Uc}
                ${t.fragmentShader}
            `;
            t.fragmentShader = t.fragmentShader.replace("#include <transmission_pars_fragment>", `

                    uniform vec2 uTransmissionSamplerSize;
                    uniform sampler2D tTransmissionSamplerMap;

                    uniform mat4 modelMatrix;
                    uniform mat4 projectionMatrix;

                    varying vec3 vWorldPosition;

                    // Mipped Bicubic Texture Filtering by N8
                    // https://www.shadertoy.com/view/Dl2SDW

                    float w0( float a ) {

                        return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );

                    }

                    float w1( float a ) {

                        return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );

                    }

                    float w2( float a ){

                        return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );

                    }

                    float w3( float a ) {

                        return ( 1.0 / 6.0 ) * ( a * a * a );

                    }

                    // g0 and g1 are the two amplitude functions
                    float g0( float a ) {

                        return w0( a ) + w1( a );

                    }

                    float g1( float a ) {

                        return w2( a ) + w3( a );

                    }

                    // h0 and h1 are the two offset functions
                    float h0( float a ) {

                        return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );

                    }

                    float h1( float a ) {

                        return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );

                    }

                    vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {

                        uv = uv * texelSize.zw + 0.5;

                        vec2 iuv = floor( uv );
                        vec2 fuv = fract( uv );

                        float g0x = g0( fuv.x );
                        float g1x = g1( fuv.x );
                        float h0x = h0( fuv.x );
                        float h1x = h1( fuv.x );
                        float h0y = h0( fuv.y );
                        float h1y = h1( fuv.y );

                        vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
                        vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
                        vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
                        vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;

                        return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
                            g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );

                    }

                    vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
                        vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
                        vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
                        vec2 fLodSizeInv = 1.0 / fLodSize;
                        vec2 cLodSizeInv = 1.0 / cLodSize;
                        vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
                        vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
                        return mix( fSample, cSample, fract( lod ) );

                    }

                    vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {

                        // Direction of refracted light.
                        vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );

                        // Compute rotation-independant scaling of the model matrix.
                        vec3 modelScale;
                        modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
                        modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
                        modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );

                        // The thickness is specified in local space.
                        return normalize( refractionVector ) * thickness * modelScale;

                    }

                    float applyIorToRoughness( const in float roughness, const in float ior ) {

                        // Scale roughness with IOR so that an IOR of 1.0 results in no microfacet refraction and
                        // an IOR of 1.5 results in the default amount of microfacet refraction.
                        return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );

                    }

                    vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {

                        float lod = log2( uTransmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
                        return textureBicubic( tTransmissionSamplerMap, fragCoord.xy, lod );

                    }

                    vec4 getTransmissionSampleCheap( const in vec2 fragCoord, const in float roughness, const in float ior ) {
                        float lod = log2( uTransmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
                        return textureLod( tTransmissionSamplerMap, fragCoord.xy, lod );
                    }

                    vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {

                        return vec3( 1.0 ); // fix

                        /*
                        if ( isinf( attenuationDistance ) ) {

                            // Attenuation distance is +∞, i.e. the transmitted color is not attenuated at all.
                            return vec3( 1.0 );

                        } else {

                            // Compute light attenuation using Beer's law.
                            vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
                            vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance ); // Beer's law
                            return transmittance;

                        }
                        */
                    }

                vec4 getIBLVolumeRefraction2( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor, const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix, const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness, const in vec3 attenuationColor, const in float attenuationDistance ) {
                    vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
                    vec3 refractedRayExit = position + transmissionRay;
                    vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
                    vec2 refractionCoords = ndcPos.xy / ndcPos.w;
                    refractionCoords += 1.0;
                    refractionCoords /= 2.0;

                    vec4 transmittedLight = getTransmissionSampleCheap( refractionCoords, roughness, ior );
                    vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
                    vec3 attenuatedColor = transmittance * transmittedLight.rgb;
                    vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
                    float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
                    return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
                }
            `);
            t.fragmentShader = t.fragmentShader.replace("#include <transmission_fragment>", `

                    /*
                    material.transmission = transmission;
                    material.transmissionAlpha = 1.0;
                    material.thickness = thickness;
                    material.attenuationDistance = attenuationDistance;
                    material.attenuationColor = attenuationColor;
                    */

                    vec3 pos = vWorldPosition;
                    vec3 v = normalize( cameraPosition - pos );
                    vec3 n = inverseTransformDirection( normal, viewMatrix );

                    vec4 transmitted = vec4(0.0);

                    // custom chromatic aberration / threejs default refraction

                    if (uChromaticAberration > 0.0) {

                        float transmissionR, transmissionB, transmissionG;
                        float thickness_smear = uThickness * pow(roughnessFactor, 0.33);
                        vec4 noise = getNoise(tBlue, gl_FragCoord.xy, uBlueOffset);
                        vec4 noise2 = getNoise(tBlue, gl_FragCoord.xy + vec2(8.4, 9.6), uBlueOffset * + vec2(1.34, 34.32));

                        vec3 distortionNormal = roughnessFactor * roughnessFactor * 2.0 * normalize(noise2.xyz) + mousefrost * 0.025;
                        vec3 sampleNorm = normalize(n + distortionNormal);
                        float totalSamples = ${awesomeSamples}.0;

                        for (float i = 0.0; i < ${awesomeSamples}.0; i ++) {
                            transmissionR = getIBLVolumeRefraction2(
                                sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
                                pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, uThickness + thickness_smear * (i + noise.g) / totalSamples,
                                uAttenuationColor, uAttenuationDistance
                            ).r;
                            transmissionG = getIBLVolumeRefraction2(
                                sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
                                pos, modelMatrix, viewMatrix, projectionMatrix, material.ior  * (1.0 + uChromaticAberration * (i + noise.r) / totalSamples), uThickness + thickness_smear * (i + noise.r) / totalSamples,
                                uAttenuationColor, uAttenuationDistance
                            ).g;
                            transmissionB = getIBLVolumeRefraction2(
                                sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
                                pos, modelMatrix, viewMatrix, projectionMatrix, material.ior * (1.0 + 2.0 * uChromaticAberration * (i + noise.b) / totalSamples), uThickness + thickness_smear * (i + noise.b) / totalSamples,
                                uAttenuationColor, uAttenuationDistance
                            ).b;

                            transmitted.r += transmissionR;
                            transmitted.g += transmissionG;
                            transmitted.b += transmissionB;
                        }

                        transmitted /= ${awesomeSamples}.0;
                        transmitted.a = 1.0;
                    } else {

                        // three's default
                        transmitted = getIBLVolumeRefraction2(
                            n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
                            pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, uThickness,
                            uAttenuationColor, uAttenuationDistance
                        );
                    }

                    // material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
                    // totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
                    totalDiffuse = transmitted.rgb; // fix
                    totalDiffuse = clamp(totalDiffuse, vec3(0.0), vec3(1.0)); // fix
            `);
            t.vertexShader = t.vertexShader.replace("#include <uv_pars_vertex>", `attribute vec2 uv1;
 varying vec2 vUv1;
 varying vec3 vWorldPosition;
 #include <uv_pars_vertex>`);
            t.vertexShader = t.vertexShader.replace("#include <uv_vertex>", `vUv1 = uv1;
#include <uv_vertex>`);
            t.vertexShader = t.vertexShader.replace("#include <fog_vertex>", `#include <fog_vertex>
 vWorldPosition = worldPosition.xyz;`);
            t.fragmentShader = t.fragmentShader.replace("#include <uv_pars_fragment>", `
                float efit(float x,float a1,float a2,float b1,float b2){return b1+((x-a1)*(b2-b1))/(a2-a1);}float fit(float x,float a1,float a2,float b1,float b2){return clamp(efit(x,a1,a2,b1,b2),min(b1,b2),max(b1,b2));}float fit01(float x,float a1,float a2){return fit(x,0.0,1.0,a1,a2);}float fit10(float x,float a1,float a2){return fit(x,1.0,0.0,a1,a2);}float fit11(float x,float a1,float a2){return fit(x,-1.0,1.0,a1,a2);}vec3 efit(vec3 x,vec3 a1,vec3 a2,vec3 b1,vec3 b2){return b1+((x-a1)*(b2-b1))/(a2-a1);}vec3 fit(vec3 x,vec3 a1,vec3 a2,vec3 b1,vec3 b2){return clamp(efit(x,a1,a2,b1,b2),min(b1,b2),max(b1,b2));}vec3 fit01(vec3 x,vec3 a1,vec3 a2){return fit(x,vec3(0.0),vec3(1.0),a1,a2);}vec3 fit10(vec3 x,vec3 a1,vec3 a2){return fit(x,vec3(1.0),vec3(0.0),a1,a2);}vec3 fit11(vec3 x,vec3 a1,vec3 a2){return fit(x,vec3(-1.0),vec3(1.0),a1,a2);}
                float parabola(float x,float k){return pow(4.0*x*(1.0-x),k);}float pcurve(float x,float a,float b){float k=pow(a+b,a+b)/(pow(a,a)*pow(b,b));return k*pow(x,a)*pow(1.0-x,b);}
                varying vec2 vUv1;
                uniform sampler2D tMouseFrost;
                uniform sampler2D tTriangles;
                uniform vec3 uColorFrost;
                uniform float uPatternScale;
                uniform float uFrostStrength;
                #include <uv_pars_fragment>
            `);
            t.fragmentShader = t.fragmentShader.replace("#include <clipping_planes_fragment>", `
                vec2 mousefrostdata = texture2D(tMouseFrost, vUv1).rg;
                float mousefrost = mousefrostdata.r;
                float mousefrostrim = mousefrostdata.g;
                #include <clipping_planes_fragment>
            `);
            t.fragmentShader = t.fragmentShader.replace("#include <roughnessmap_fragment>", `
                float roughnessFactor = roughness;
                roughnessFactor *= 1.0 - mousefrost; // new line

                #ifdef USE_ROUGHNESSMAP
                    vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
                    roughnessFactor *= texelRoughness.g;
                #endif
            `);
            t.fragmentShader = t.fragmentShader.replace("#include <normal_fragment_maps>", `
                #ifdef USE_NORMALMAP_OBJECTSPACE
                    normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals
                    #ifdef FLIP_SIDED
                        normal = - normal;
                    #endif
                    #ifdef DOUBLE_SIDED
                        normal = normal * faceDirection;
                    #endif

                    normal = normalize( normalMatrix * normal );
                #elif defined( USE_NORMALMAP_TANGENTSPACE )
                    vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
                    mapN.xy *= normalScale;
                    mapN.xy *= 1.0 - mousefrost; // new line
                    normal = normalize( tbn * mapN );
                #elif defined( USE_BUMPMAP )
                    normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
                #endif
            `);
            t.fragmentShader = t.fragmentShader.replace("vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;", `
                // усилено для видимости на тёмном камне lafys (иней ярче + базовое свечение мороза)
                // uFrostStrength — общий множитель силы/видимости инея (1.0 = как было; редактируется в панели)
                totalEmissiveRadiance += mousefrostrim * uColorFrost * 2.5 * uFrostStrength;
                float triangles = texture2D(tTriangles, vNormalMapUv * (uPatternScale * min(1.0, uResolution.y / 1300.0))).r;
                totalEmissiveRadiance += triangles * mousefrostrim * 22.0 * uFrostStrength;
                totalEmissiveRadiance += triangles * pow(mousefrost, 2.0) * 3.0 * uFrostStrength;
                totalEmissiveRadiance += mousefrost * uColorFrost * 0.8 * uFrostStrength;
                vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
                outgoingLight = clamp(outgoingLight, vec3(0.0), vec3(1.5));
            `);
        };
    }
}
