// ─── Background ───

export const backgroundVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const backgroundFragmentShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    // Sunset gradient: dark blue (top) -> orange/pink (middle) -> warm yellow (horizon)
    vec3 topColor    = vec3(0.05, 0.05, 0.2);    // deep navy
    vec3 midColor    = vec3(0.6, 0.2, 0.3);      // dusky pink
    vec3 horizonColor = vec3(1.0, 0.55, 0.15);   // warm orange
    vec3 lowColor    = vec3(1.0, 0.8, 0.3);      // golden yellow

    float y = vUv.y;
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

// ─── Terrain ───

export const terrainVertexShader = /* glsl */ `
  uniform int   usingNoise;
  uniform int   usingBiomes;
  uniform float uMaxHeight;
  uniform float uNoiseScale;
  uniform int   uOctaves;
  uniform float uFrequency;
  uniform float uAmplitude;
  uniform float uLacunarity;
  uniform float uGain;
  uniform int   uBiomeOctaves;
  uniform float uBiomeFrequency;
  uniform float uBiomeAmplitude;
  uniform float uBiomeLacunarity;
  uniform float uBiomeGain;

  uniform vec3  uTerrainColor;
  uniform vec3  uCameraPos;
  uniform float uRoadHalfWidth;
  uniform float uRoadDivisor;

  varying vec3 vColor;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  /* ---------- Noise ---------- */

  vec2 hash(vec2 p) {
    p = vec2(
      dot(p, vec2(127.1, 311.7)),
      dot(p, vec2(269.5, 183.3))
    );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  float perlinNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = fade(f);

    float a = dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
    float b = dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float c = dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float d = dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));

    return mix(
      mix(a, b, u.x),
      mix(c, d, u.x),
      u.y
    );
  }

  float perlinFBM(vec2 p, int octaves, float frequency, float amplitude, float lacunarity, float gain) {
    float value = 0.0;
    float freq  = frequency;
    float amp   = amplitude;

    for (int i = 0; i < 16; i++) {
      if (i >= octaves) break;
      value += amp * perlinNoise(p * freq);
      freq *= lacunarity;
      amp  *= gain;
    }
    return value;
  }

  /* ---------- Main ---------- */

  void main() {
    vec3 pos = position;

    if (usingNoise == 1) {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vec2 uv = worldPos.xz * uNoiseScale;

      float noise = perlinFBM(uv, uOctaves, uFrequency, uAmplitude, uLacunarity, uGain);
      float bnoise = perlinFBM(uv, uBiomeOctaves, uBiomeFrequency, uBiomeAmplitude, uBiomeLacunarity, uBiomeGain);

      bnoise = bnoise * 0.75;
      noise  = noise * 0.5 + 0.5;

      if (usingBiomes == 1) {
        noise = mix(noise, bnoise, bnoise);
      }

      // Road: flatten noise in a strip centered on camera X
      float distFromRoad = abs(worldPos.x - uCameraPos.x);
      float roadBlend = smoothstep(uRoadHalfWidth - 0.7, uRoadHalfWidth + 0.7, distFromRoad);
      noise = max(mix(noise / uRoadDivisor, noise, roadBlend), 0.15);

      // Displace on Y (up) instead of Z
      // Raise sides: height increases with distance from camera X (quadratic for smooth bowl)
      float sideRise = distFromRoad * distFromRoad * 0.01;
      pos.y = noise * uMaxHeight + sideRise;

      // Compute normal from neighboring noise samples
      float eps = 0.1;
      float nL = perlinFBM((uv + vec2(-eps, 0.0)), uOctaves, uFrequency, uAmplitude, uLacunarity, uGain) * 0.5 + 0.5;
      float nR = perlinFBM((uv + vec2( eps, 0.0)), uOctaves, uFrequency, uAmplitude, uLacunarity, uGain) * 0.5 + 0.5;
      float nD = perlinFBM((uv + vec2(0.0, -eps)), uOctaves, uFrequency, uAmplitude, uLacunarity, uGain) * 0.5 + 0.5;
      float nU = perlinFBM((uv + vec2(0.0,  eps)), uOctaves, uFrequency, uAmplitude, uLacunarity, uGain) * 0.5 + 0.5;
      vec3 localNormal = normalize(vec3((nL - nR) * uMaxHeight, 2.0 * eps / uNoiseScale, (nD - nU) * uMaxHeight));
      vNormal = normalize(mat3(modelMatrix) * localNormal);

      // Color based on noise value and terrain color
      vColor = uTerrainColor * noise;
    } else {
      vColor = uTerrainColor;
      vNormal = normalize(mat3(modelMatrix) * vec3(0.0, 1.0, 0.0));
    }

    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const terrainFragmentShader = /* glsl */ `
  // Material
  uniform vec3  uMatEmission;
  uniform vec3  uMatAmbient;
  uniform vec3  uMatDiffuse;
  uniform vec3  uMatSpecular;
  uniform float uMatShininess;

  // Sun light
  uniform vec4  uSunLightPos;
  uniform vec3  uSunLightAmbient;
  uniform vec3  uSunLightDiffuse;
  uniform vec3  uSunLightSpecular;
  uniform vec3  uSunLightAttenuation;

  // Road light
  uniform vec4  uRoadLightPos;
  uniform vec3  uRoadLightAmbient;
  uniform vec3  uRoadLightDiffuse;
  uniform vec3  uRoadLightSpecular;
  uniform vec3  uRoadLightAttenuation;

  // View
  uniform vec3  uViewPos;

  // Fog
  uniform int   uUseFog;
  uniform float uFogStart;
  uniform float uFogEnd;
  uniform vec3  uFogColor;

  varying vec3 vColor;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  vec3 calcLight(vec4 lightPos, vec3 lAmbient, vec3 lDiffuse, vec3 lSpecular, vec3 lAttenuation, vec3 norm, vec3 fragPos, vec3 matColor) {
    vec3 lightSrc = vec3(lightPos);
    float distSV = distance(lightSrc, fragPos);

    // Direction: directional (w=0) vs point (w=1)
    vec3 lightDir;
    if (lightPos.w == 0.0)
      lightDir = normalize(lightSrc);
    else
      lightDir = normalize(lightSrc - fragPos);

    // Ambient
    vec3 ambient = lAmbient * matColor;

    // Diffuse (Lambertian)
    float diffCoeff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diffCoeff * lDiffuse * matColor;

    // Specular (Blinn-Phong)
    vec3 viewDir = normalize(uViewPos - fragPos);
    vec3 halfDir = normalize(lightDir + viewDir);
    float specCoeff = pow(max(dot(norm, halfDir), 0.0), uMatShininess);
    vec3 specular = specCoeff * lSpecular * uMatSpecular;

    // Attenuation
    float atten;
    if (lightPos.w != 0.0)
      atten = 1.0 / (lAttenuation.x + lAttenuation.y * distSV + lAttenuation.z * distSV * distSV);
    else
      atten = 1.0;

    return atten * (ambient + diffuse + specular);
  }

  void main() {
    vec3 norm = normalize(vNormal);
    vec3 matColor = vColor;

    // Global ambient
    vec3 globalAmbient = vec3(0.15, 0.1, 0.08) * matColor;

    // Emission
    vec3 emission = uMatEmission;

    // Accumulate lights
    vec3 sunLight = calcLight(uSunLightPos, uSunLightAmbient, uSunLightDiffuse, uSunLightSpecular, uSunLightAttenuation, norm, vWorldPos, matColor);
    vec3 roadLight = calcLight(uRoadLightPos, uRoadLightAmbient, uRoadLightDiffuse, uRoadLightSpecular, uRoadLightAttenuation, norm, vWorldPos, matColor);

    vec3 phong = emission + globalAmbient + sunLight + roadLight;
    vec3 result = clamp(phong, 0.0, 1.0);

    // Fog
    float dist = length(uViewPos - vWorldPos);
    float fogFactor = clamp((uFogEnd - dist) / (uFogEnd - uFogStart), 0.0, 1.0);

    if (uUseFog == 1) {
      result = mix(uFogColor, result, fogFactor);
    }

    gl_FragColor = vec4(result, 1.0);
  }
`;

// ─── Edge wireframe overlay ───

export const edgeFragmentShader = /* glsl */ `
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor + 0.06, 1.0);
  }
`;

// ─── Sun aura ───

export const auraVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const auraFragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float rim = 1.0 - dot(vNormal, vViewDir);
    rim = pow(rim, 2.0);
    vec3 orange = vec3(1.0, 0.55, 0.1);
    gl_FragColor = vec4(orange, rim * 0.7);
  }
`;
