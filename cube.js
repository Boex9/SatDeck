import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js";

const container = document.getElementById("3D_Visualizer");
container.innerHTML = ""; // remove ghost canvases

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z = 2;

const width = container.clientWidth;
const height = container.clientHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
// Force canvas inside padded box
renderer.domElement.style.position = "absolute";
renderer.domElement.style.inset = "30px"; // must match padding

// Cube
const geo = new THREE.BoxGeometry();
const mat = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geo, mat);
scene.add(cube);

function resize() {
  const style = getComputedStyle(container);
  const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

  const w = container.clientWidth - padX;
  const h = container.clientHeight - padY;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

resize();
new ResizeObserver(resize).observe(container);
window.addEventListener("resize", resize);

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
