import * as THREE from 'three';
import { backgroundVertexShader, backgroundFragmentShader } from './shaders.js';

export const bgScene = new THREE.Scene();
export const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const bgMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: {},
    vertexShader: backgroundVertexShader,
    fragmentShader: backgroundFragmentShader,
  })
);
bgScene.add(bgMesh);
