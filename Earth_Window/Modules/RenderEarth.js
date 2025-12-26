import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js";

export function RenderEarth(scene,render)
{

    const loader = new THREE.TextureLoader();

const cubeMaps = {
  px: loader.load("./Earth_Window/Faces/px.png"),
  nx: loader.load("./Earth_Window/Faces/nx.png"),
  py: loader.load("./Earth_Window/Faces/py.png"),
  ny: loader.load("./Earth_Window/Faces/ny.png"),
  pz: loader.load("./Earth_Window/Faces/pz.png"),
  nz: loader.load("./Earth_Window/Faces/nz.png"),
};

Object.values(cubeMaps).forEach(t => t.colorSpace = THREE.SRGBColorSpace);

    loader.load("./Earth_Window/Earth_Textures/Skybox.jpg", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping; 
    scene.background = texture;
        texture.colorSpace = THREE.SRGBColorSpace;

    }   );


    const Earth_Geometry = new THREE.SphereGeometry(1,70,70);
    const texture = new THREE.TextureLoader().load("./Earth_Window/Earth_Textures/earthmap4k.jpg");

    
    texture.colorSpace = THREE.SRGBColorSpace;
    const Earth_Material = new THREE.ShaderMaterial({
  uniforms: {
    px: { value: cubeMaps.px },
    nx: { value: cubeMaps.nx },
    py: { value: cubeMaps.py },
    ny: { value: cubeMaps.ny },
    pz: { value: cubeMaps.pz },
    nz: { value: cubeMaps.nz },
  },

  vertexShader: `
    varying vec3 vDir;
    void main() {
      vDir = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D px;
    uniform sampler2D nx;
    uniform sampler2D py;
    uniform sampler2D ny;
    uniform sampler2D pz;
    uniform sampler2D nz;

    varying vec3 vDir;

    vec4 sampleCube(vec3 d) {
      vec3 a = abs(d);
      vec2 uv;

      if(a.x >= a.y && a.x >= a.z) {
        if(d.x > 0.0) { uv = d.zy / a.x; return texture2D(px, uv*0.5+0.5); }
        else         { uv = d.zy / a.x; return texture2D(nx, uv*0.5+0.5); }
      }
      else if(a.y >= a.z) {
        if(d.y > 0.0) { uv = d.xz / a.y; return texture2D(py, uv*0.5+0.5); }
        else         { uv = d.xz / a.y; return texture2D(ny, uv*0.5+0.5); }
      }
      else {
        if(d.z > 0.0) { uv = d.xy / a.z; return texture2D(pz, uv*0.5+0.5); }
        else         { uv = d.xy / a.z; return texture2D(nz, uv*0.5+0.5); }
      }
    }

    void main() {
      gl_FragColor = sampleCube(vDir);
    }
  `
});

    

    const Earth_Mesh = new THREE.Mesh(Earth_Geometry,Earth_Material);
    scene.add(Earth_Mesh);
}


