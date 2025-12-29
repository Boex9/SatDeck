import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js";
import { RenderEarth } from "./Modules/RenderEarth.js";
import { Orbit } from "./Modules/OrbitingModule.js";

export const scene = new THREE.Scene();
const earhtwindow = document.getElementById("3D_Visualizer");


const width = earhtwindow.clientWidth;
const height = earhtwindow.clientHeight;

export const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(width, height);
earhtwindow.appendChild(renderer.domElement);

// Initial camera position
camera.position.z = 5;

// Add Earth
RenderEarth(scene, renderer);


// Orbiting Controls
const orbitcontrols = Orbit(camera, renderer);

// Animate
function animate() {
  requestAnimationFrame(animate);

  updateEarthHUD();
  orbitcontrols.update();
  renderer.render(scene, camera);
}

animate();


function onWindowResize() {
  const width = earhtwindow.clientWidth;
  const height = earhtwindow.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

camera.position.z = 2;

// Listen for window resizes
window.addEventListener("resize", onWindowResize);

// Optional: also listen for container resizes (if 3D_Visualizer isn’t full window)
const resizeObserver = new ResizeObserver(() => onWindowResize());
resizeObserver.observe(earhtwindow);

const earthPanel = document.getElementById("earth-panel");
            const maxBtn = document.getElementById("earth-max-btn");

            let earthMax = false;

            function toggleEarthMax() {
            earthMax = !earthMax;

            earthPanel.classList.toggle("earth-maximized", earthMax);
            document.body.classList.toggle("earth-focus", earthMax);
            
            onWindowResize(); // your existing resize function
            }

            maxBtn.addEventListener("click", toggleEarthMax);

            document.addEventListener("keydown", e => {
            if (e.key === "Escape" && earthMax) toggleEarthMax();
            });
