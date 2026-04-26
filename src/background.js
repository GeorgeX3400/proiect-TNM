import * as THREE from 'three';

// Sky-dome vertex shader
const skyVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Sky-dome fragment shader
const skyFragmentShader = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    // Map sphere Y from [-1,1] to [0,1] for the gradient
    float y = normalize(vWorldPosition).y * 0.5 + 0.5;

    vec3 topColor     = vec3(0.05, 0.05, 0.2);
    vec3 midColor     = vec3(0.6, 0.2, 0.3);
    vec3 horizonColor = vec3(1.0, 0.55, 0.15);
    vec3 lowColor     = vec3(1.0, 0.8, 0.3);

    vec3 color;
    if (y > 0.5) {
      color = mix(midColor, topColor, (y - 0.5) * 2.0);
    } else if (y > 0.3) {
      color = mix(horizonColor, midColor, (y - 0.3) / 0.2);
    } else {
      color = mix(lowColor, horizonColor, y / 0.3);
    }
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Exports

const skyGeo = new THREE.SphereGeometry(500, 32, 32);
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  uniforms: {},
  vertexShader: skyVertexShader,
  fragmentShader: skyFragmentShader,
});

export const skyDome = new THREE.Mesh(skyGeo, skyMat);
skyDome.renderOrder = -1;   

// Legacy exports 
export const bgScene = new THREE.Scene();
export const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
