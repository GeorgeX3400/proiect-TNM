import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { noiseUniforms, terrainGroup, terrainMaterial } from './terrain.js';
import { sunGroup, updateSunPosition } from './sun.js';
import { skyDome } from './background.js';
import { roadLight, ambientLight, updateLights } from './lights.js';
import { WebPdWorkletNode, registerWebPdWorkletNode } from '@webpd/runtime'

const PATCHES = ['music1', 'music2', 'music3', 'music4', 'music5']
let currentPatchIdx = 0

let METRO_MS = 0
let MOVE_SPEED = 4.0

// Audio
let audioContext = null
let currentNode = null
let analyser = null
const freqData = new Uint8Array(1024)
let lastLogTime = 0

let baseLeftHz = null
let baseRightHz = null
const audioStartTime = performance.now()

async function loadPatch(name) {
  const pdText = await (await fetch(`/${name}.pd`)).text()

  const oscs = [...pdText.matchAll(/\bosc~\s+([0-9.]+)/g)]
  baseLeftHz  = oscs[0] ? Number(oscs[0][1]) : 220
  baseRightHz = oscs[1] ? Number(oscs[1][1]) : 234
  const metro = pdText.match(/\bmetro\s+([0-9.]+)/)
  METRO_MS = metro ? Number(metro[1]) : 200
  console.log(`[${name}] left=${baseLeftHz}Hz right=${baseRightHz}Hz metro=${METRO_MS}ms`)

  if (currentNode) currentNode.disconnect()
  currentNode = new WebPdWorkletNode(audioContext)
  currentNode.connect(analyser)

  const response = await fetch(`/${name}.js`)
  if (!response.ok) { console.error(`failed to load ${name}.js:`, response.status); return }
  const jsCode = await response.text()
  currentNode.port.postMessage({ type: 'code:JS', payload: { jsCode } })
}

async function startAudio() {
  if (audioContext) return            
  console.log('starting audio...')
  audioContext = new AudioContext()
  await registerWebPdWorkletNode(audioContext)

  analyser = audioContext.createAnalyser()
  analyser.fftSize = 2048
  analyser.smoothingTimeConstant = 0.8
  analyser.connect(audioContext.destination)

  await loadPatch(PATCHES[currentPatchIdx])
}



// Scene
const scene = new THREE.Scene();

// Camera rig
const cameraRig = new THREE.Group();
scene.add(cameraRig);

const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, -25);
camera.lookAt(0, 2, 0);
cameraRig.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

const vrButton = VRButton.createButton(renderer, {
  optionalFeatures: ['local-floor', 'bounded-floor']
});
document.body.appendChild(vrButton);

// Saving camera state before entering VR so we can restore it on exit.
const savedCameraState = {
  position: new THREE.Vector3(),
  quaternion: new THREE.Quaternion(),
};

renderer.xr.addEventListener('sessionstart', () => {
  startAudio();

  camera.getWorldPosition(savedCameraState.position);
  camera.getWorldQuaternion(savedCameraState.quaternion);

  cameraRig.position.copy(savedCameraState.position);

  const camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);
  cameraRig.rotation.y = Math.atan2(camDir.x, camDir.z);

  camera.position.set(0, 0, 0);
  camera.rotation.set(0, 0, 0);
});

renderer.xr.addEventListener('sessionend', () => {
  const rigPos = cameraRig.position.clone();

  cameraRig.position.set(0, 0, 0);
  cameraRig.rotation.set(0, 0, 0);

  camera.position.copy(rigPos);
  camera.position.y = savedCameraState.position.y;

  camera.quaternion.copy(savedCameraState.quaternion);
});

// Exit VR with Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && renderer.xr.isPresenting) {
    renderer.xr.getSession().end();
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add objects to scene
scene.add(skyDome);
scene.add(terrainGroup);
scene.add(sunGroup);
scene.add(roadLight);
scene.add(ambientLight);

// Auto forward movement
let lastTime = performance.now();

window.addEventListener('keydown', async (e) => {
  if (e.key.startsWith('Arrow')) e.preventDefault()
  if (e.key === 'ArrowRight' && audioContext) {
    currentPatchIdx = (currentPatchIdx + 1) % PATCHES.length
    await loadPatch(PATCHES[currentPatchIdx])
  } else if (e.key === 'ArrowLeft' && audioContext) {
    currentPatchIdx = (currentPatchIdx - 1 + PATCHES.length) % PATCHES.length
    await loadPatch(PATCHES[currentPatchIdx])
  } else if (e.key.toLowerCase() === 'p') {
    terrainMaterial.wireframe = !terrainMaterial.wireframe
  }
});

function updateMovement() {
  const now = performance.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  const forward = new THREE.Vector3();

  if (renderer.xr.isPresenting) {
    cameraRig.getWorldDirection(forward);
  } else {
    camera.getWorldDirection(forward);
  }

  forward.y = 0;
  forward.normalize();

  if (renderer.xr.isPresenting) {
    cameraRig.position.addScaledVector(forward, MOVE_SPEED * dt);
  } else {
    camera.position.addScaledVector(forward, MOVE_SPEED * dt);
  }
}

function getEffectiveCameraPosition() {
  if (renderer.xr.isPresenting) {
    const worldPos = new THREE.Vector3();
    camera.getWorldPosition(worldPos);
    return worldPos;
  }
  return camera.position;
}

// Render loop
renderer.setAnimationLoop(() => {
  updateMovement();

  const camPos = getEffectiveCameraPosition();

  // Update road center to follow camera
  noiseUniforms.uCameraPos.value.copy(camPos);

  // Center terrain under camera
  terrainGroup.position.x = camPos.x;
  terrainGroup.position.y = camPos.y - 2;
  terrainGroup.position.z = camPos.z + 3;

  // View position for specular
  noiseUniforms.uViewPos.value.copy(camPos);

  // Keep sky dome centered on camera so it always surrounds the viewer
  skyDome.position.copy(camPos);

  // Update sun and lights
  const getSunDirection = (v) => {
    if (renderer.xr.isPresenting) {
      return cameraRig.getWorldDirection(v);
    }
    return camera.getWorldDirection(v);
  };
  updateSunPosition({ position: camPos, getWorldDirection: getSunDirection });
  updateLights({ position: camPos }, sunGroup.position, noiseUniforms);

  if (baseLeftHz && baseRightHz) {
    const bpm = 60000 / METRO_MS
    const bpmNorm = 1 / (bpm / 300 )// 1.0 at metro 200ms, lower for slower tempos

    const t = (performance.now() - audioStartTime) / 1000

    const l = (baseLeftHz  + Math.sin( t * bpm / 100) * bpm / 100) / baseLeftHz
    const r = (baseRightHz + Math.cos( t * bpm / 100) * bpm / 100) / baseRightHz

    // magnitude of targets scales with bpmNorm → more displacement at high BPM
    const targetAmp       = Math.min(Math.max(l * 1.5 * bpmNorm, 0.3), 2.0)
    const targetGain      = Math.min(Math.max(l * 0.5 * bpmNorm, 0.3), 1.0)
    const targetBiomeAmp  = Math.min(Math.max(r * bpmNorm,        0.3), 1.5)
    const targetBiomeGain = Math.min(Math.max(r * 0.5 * bpmNorm,  0.2), 0.5)

    // smoothing speed scales with bpmNorm → faster response at high BPM
    const smooth = bpm / 60000

    noiseUniforms.uNoiseOffsetX.value   += ((r - 1.0) * 128.0 * bpmNorm - noiseUniforms.uNoiseOffsetX.value) * smooth * 200
    noiseUniforms.uAmplitude.value      += (targetAmp       - noiseUniforms.uAmplitude.value)      * smooth 
    noiseUniforms.uGain.value           += (targetGain      - noiseUniforms.uGain.value)            * smooth 
    noiseUniforms.uBiomeAmplitude.value += (targetBiomeAmp  - noiseUniforms.uBiomeAmplitude.value)  * smooth
    noiseUniforms.uBiomeGain.value      += (targetBiomeGain - noiseUniforms.uBiomeGain.value)        * smooth

    const now = performance.now()
    if (now - lastLogTime > 5000) {
      lastLogTime = now
      console.log(`bpm=${bpm.toFixed(0)} norm=${bpmNorm.toFixed(2)} | l=${l.toFixed(3)} r=${r.toFixed(3)} | amp=${noiseUniforms.uAmplitude.value.toFixed(3)} gain=${noiseUniforms.uGain.value.toFixed(3)}`)
    }
  }

  // Read frequency data from Pd output
  if (analyser) {
    analyser.getByteFrequencyData(freqData)
  }

  renderer.render(scene, camera);
});

document.addEventListener('click', () => startAudio(), { once: true })
