import * as THREE from 'three';
import { noiseUniforms, terrainGroup, terrainMaterial } from './terrain.js';
import { sunGroup, updateSunPosition } from './sun.js';
import { bgScene, bgCamera } from './background.js';
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

  renderer.autoClear = false;
  renderer.clear();
  renderer.render(bgScene, bgCamera);
  renderer.render(scene, camera);
});

document.addEventListener('click', () => startAudio(), { once: true })
