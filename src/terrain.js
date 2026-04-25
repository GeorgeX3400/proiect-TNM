import * as THREE from 'three';
import { terrainVertexShader, terrainFragmentShader, edgeFragmentShader } from './shaders.js';

// Terrain config
const PATCHES = 6;
const PATCH_SIZE = 6;
const PATCH_SEGMENTS = 36;

function getHeight(x, z) {
  return 0;
}

function createPatch(px, pz) {
  const geo = new THREE.PlaneGeometry(PATCH_SIZE, PATCH_SIZE, PATCH_SEGMENTS, PATCH_SEGMENTS);
  geo.rotateX(-Math.PI / 2);

  const offsetX = (px - PATCHES / 2 + 0.5) * PATCH_SIZE;
  const offsetZ = (pz - PATCHES / 2 + 0.5) * PATCH_SIZE;

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const wx = pos.getX(i) + offsetX;
    const wz = pos.getZ(i) + offsetZ;
    pos.setY(i, getHeight(wx, wz));
    pos.setX(i, wx);
    pos.setZ(i, wz);
  }
  geo.computeVertexNormals();
  return geo;
}

// Noise uniforms (tweak these to shape the terrain)
export const noiseUniforms = {
  usingNoise:       { value: 1 },
  usingBiomes:      { value: 1 },
  uMaxHeight:       { value: 2.0 },
  uNoiseScale:      { value: 0.15 },
  uOctaves:         { value: 6 },
  uFrequency:       { value: 1.0 },
  uAmplitude:       { value: 1.5 },
  uNoiseOffsetX:    { value: 0.0 },
  uLacunarity:      { value: 2.0 },
  uGain:            { value: 0.5 },
  uBiomeOctaves:    { value: 4 },
  uBiomeFrequency:  { value: 0.5 },
  uBiomeAmplitude:  { value: 1.0 },
  uBiomeLacunarity: { value: 2.0 },
  uBiomeGain:       { value: 0.5 },
  // Terrain color
  uTerrainColor:    { value: new THREE.Vector3(0.29, 0.45, 0.35) },
  // Road params
  uCameraPos:       { value: new THREE.Vector3() },
  uRoadHalfWidth:   { value: 1.5 },
  uRoadDivisor:     { value: 3.0 },
  // Material
  uMatEmission:     { value: new THREE.Vector3(0.0, 0.0, 0.0) },
  uMatAmbient:      { value: new THREE.Vector3(0.4, 0.4, 0.4) },
  uMatDiffuse:      { value: new THREE.Vector3(0.8, 0.8, 0.8) },
  uMatSpecular:     { value: new THREE.Vector3(0.02, 0.02, 0.02) },
  uMatShininess:    { value: 32.0 },
  // Sun light (directional, w=0)
  uSunLightPos:       { value: new THREE.Vector4(0, 14, 0, 0) },
  uSunLightAmbient:   { value: new THREE.Vector3(0.4, 0.6, 0.5) },
  uSunLightDiffuse:   { value: new THREE.Vector3(1.7, 2.3, 0.4) },
  uSunLightSpecular:  { value: new THREE.Vector3(1.0, 0.85, 0.5) },
  uSunLightAttenuation: { value: new THREE.Vector3(0.5, 0.0, 0.0) },
  // Road light (point, w=1)
  uRoadLightPos:       { value: new THREE.Vector4(0, 5, 0, 1) },
  uRoadLightAmbient:   { value: new THREE.Vector3(0.15, 0.14, 0.12) },
  uRoadLightDiffuse:   { value: new THREE.Vector3(1.0, 0.8, 0.7) },
  uRoadLightSpecular:  { value: new THREE.Vector3(0.5, 0.4, 0.6) },
  uRoadLightAttenuation: { value: new THREE.Vector3(0.1, 0.04, 0.01) },
  // View position
  uViewPos:           { value: new THREE.Vector3() },
  // Fog
  uUseFog:            { value: 1 },
  uFogStart:          { value: 10.0 },
  uFogEnd:            { value: 35.0 },
  uFogColor:          { value: new THREE.Vector3(0.6, 0.35, 0.2) },
};

// Terrain material
export const terrainMaterial = new THREE.ShaderMaterial({
  wireframe: false,
  uniforms: noiseUniforms,
  vertexShader: terrainVertexShader,
  fragmentShader: terrainFragmentShader,
});

// Wireframe edge overlay material
export const edgeMaterial = new THREE.ShaderMaterial({
  wireframe: true,
  uniforms: noiseUniforms,
  vertexShader: terrainVertexShader,
  fragmentShader: edgeFragmentShader,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -1,
  polygonOffsetUnits: -1,
});

// Build terrain patches
export const terrainGroup = new THREE.Group();

for (let px = 0; px < PATCHES; px++) {
  for (let pz = 0; pz < PATCHES; pz++) {
    const patchGeo = createPatch(px, pz);
    const mesh = new THREE.Mesh(patchGeo, terrainMaterial);
    const wireMesh = new THREE.Mesh(patchGeo, edgeMaterial);
    terrainGroup.add(mesh);
    terrainGroup.add(wireMesh);
  }
}
