import * as THREE from 'three';
import { auraVertexShader, auraFragmentShader } from './shaders.js';

const SUN_DISTANCE = 80;

export const sunGroup = new THREE.Group();

// Core sphere — metallic style
const sunGeo = new THREE.SphereGeometry(12, 64, 64);
const sunMat = new THREE.MeshStandardMaterial({
  color: 0xffcc22,
  metalness: 0.9,
  roughness: 0.25,
  emissive: 0xffaa00,
  emissiveIntensity: 0.6,
});
const sun = new THREE.Mesh(sunGeo, sunMat);
sunGroup.add(sun);

// Aura glow (additive-blended translucent sphere)
const auraGeo = new THREE.SphereGeometry(19.5, 48, 48);
const auraMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {},
  vertexShader: auraVertexShader,
  fragmentShader: auraFragmentShader,
});
const aura = new THREE.Mesh(auraGeo, auraMat);
sunGroup.add(aura);

export function updateSunPosition(camera) {
  const sunDir = new THREE.Vector3();
  camera.getWorldDirection(sunDir);
  sunGroup.position.copy(camera.position)
    .addScaledVector(sunDir, SUN_DISTANCE);
  sunGroup.position.y += 8;
}
