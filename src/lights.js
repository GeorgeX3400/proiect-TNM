import * as THREE from 'three';

// Road light (follows camera above the road)
export const roadLight = new THREE.PointLight(0xffcc66, 2, 15);

// Ambient light
export const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);

export function updateLights(camera, sunGroupPosition, noiseUniforms) {
  // Road light: point light above camera on the road
  roadLight.position.set(camera.position.x, camera.position.y + 3, camera.position.z);
  noiseUniforms.uRoadLightPos.value.set(
    roadLight.position.x, roadLight.position.y, roadLight.position.z, 1.0
  );

  // Sun directional light: direction TOWARD the sun (w=0 means directional)
  const sunLightDir = new THREE.Vector3().subVectors(sunGroupPosition, camera.position);
  sunLightDir.y += 20;
  sunLightDir.normalize();
  noiseUniforms.uSunLightPos.value.set(sunLightDir.x, sunLightDir.y, sunLightDir.z, 0.0);
}
