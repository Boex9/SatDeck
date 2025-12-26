import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js";

export function RenderEarth(scene) {

    const bgLoader = new THREE.TextureLoader();
bgLoader.load("./Earth_Window/Earth_Textures/Skybox.png", texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  scene.background = texture;
});


  // -----------------------------
  // Load real GPU cubemap
  // -----------------------------
  const earthCube = new THREE.CubeTextureLoader().load([
    "./Earth_Window/Faces/px.png",
    "./Earth_Window/Faces/nx.png",
    "./Earth_Window/Faces/py.png",
    "./Earth_Window/Faces/ny.png",
    "./Earth_Window/Faces/pz.png",
    "./Earth_Window/Faces/nz.png",
  ]);


  earthCube.colorSpace = THREE.SRGBColorSpace;
  earthCube.generateMipmaps = false;
earthCube.minFilter = THREE.LinearFilter;

  // -----------------------------
  // Cubemap-sampled Earth material
  // -----------------------------
  const Earth_Material = new THREE.ShaderMaterial({
    uniforms: {
      cubeMap: { value: earthCube },
  earthRot: { value: new THREE.Matrix3() }
    },

    vertexShader: `
uniform mat3 earthRot;
varying vec3 vDir;

void main() {
  vec3 worldDir = (modelMatrix * vec4(position, 1.0)).xyz;
  vDir = normalize(earthRot * worldDir);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}



    `,

    fragmentShader: `
     uniform samplerCube cubeMap;
varying vec3 vDir;

vec3 toSRGB(vec3 color) {
  return pow(color, vec3(1.0/2.2));
}

void main() {
  vec3 col = textureCube(cubeMap, normalize(vDir)).rgb;
  gl_FragColor = vec4(toSRGB(col), 1.0);
}

    `
  });
const rot = new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(90));
Earth_Material.uniforms.earthRot.value.setFromMatrix4(rot);


  // -----------------------------
  // Earth mesh
  // -----------------------------
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    Earth_Material
  );

  scene.add(earth);
}
