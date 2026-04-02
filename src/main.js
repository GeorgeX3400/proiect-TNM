import * as THREE from 'three';
import { noiseUniforms, terrainGroup, terrainMaterial } from './terrain.js';
import { sunGroup, updateSunPosition } from './sun.js';
import { bgScene, bgCamera } from './background.js';
import { roadLight, ambientLight, updateLights } from './lights.js';

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, -25);
camera.lookAt(0, 2, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add objects to scene
scene.add(terrainGroup);
scene.add(sunGroup);
scene.add(roadLight);
scene.add(ambientLight);

// Auto forward movement
const MOVE_SPEED = 8.0;
let lastTime = performance.now();

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'p') {
    terrainMaterial.wireframe = !terrainMaterial.wireframe;
  }
});

function updateMovement() {
  const now = performance.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  camera.position.addScaledVector(forward, MOVE_SPEED * dt);
}

// Render loop
renderer.setAnimationLoop(() => {
  updateMovement();

  // Update road center to follow camera
  noiseUniforms.uCameraPos.value.copy(camera.position);

  // Center terrain under camera
  terrainGroup.position.x = camera.position.x;
  terrainGroup.position.y = camera.position.y - 2;
  terrainGroup.position.z = camera.position.z + 3;

  // View position for specular
  noiseUniforms.uViewPos.value.copy(camera.position);

  // Update sun and lights
  updateSunPosition(camera);
  updateLights(camera, sunGroup.position, noiseUniforms);

  renderer.autoClear = false;
  renderer.clear();
  renderer.render(bgScene, bgCamera);
  renderer.render(scene, camera);
});
