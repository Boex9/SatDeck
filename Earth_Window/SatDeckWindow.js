import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js";
import { RenderEarth } from "./Modules/RenderEarth.js";
import { Orbit } from "./Modules/OrbitingModule.js";

export const scene = new THREE.Scene();
const earhtwindow = document.getElementById("3D_Visualizer");

// ✅ Correct width & height
const width = earhtwindow.clientWidth;
const height = earhtwindow.clientHeight;

export const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(width, height);
earhtwindow.appendChild(renderer.domElement);

// ✅ Pull back camera
camera.position.z = 5;

// Add Earth
RenderEarth(scene, renderer);



function getSunDirectionECI(date = new Date()) {
    // Convert to Julian date
    const JD = (date / 86400000.0) + 2440587.5;

    // Days from J2000
    const n = JD - 2451545.0;

    // Mean longitude, mean anomaly
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = (357.528 + 0.9856003 * n) * (Math.PI/180);

    // Ecliptic longitude
    const lambda = (L + 1.915*Math.sin(g) + 0.020*Math.sin(2*g)) * (Math.PI/180);

    // Obliquity (tilt)
    const epsilon = 23.439 * (Math.PI/180);

    // Sun vector in ECI (no negation!)
    const x = Math.cos(lambda);
    const y = Math.cos(epsilon) * Math.sin(lambda);
    const z = Math.sin(epsilon) * Math.sin(lambda);

    return new THREE.Vector3(x, y, z).normalize(); // FIXED
}


function updateSun() {
    const date = new Date();

    // 1. Get real sun direction in ECI
    const sunDir = getSunDirectionECI(date);

    // 2. Apply Earth's axial tilt (23.439°) around X-axis
    const axialTilt = THREE.MathUtils.degToRad(23.439);
    sunDir.applyAxisAngle(new THREE.Vector3(1, 0, 0), axialTilt);

    // 3. Apply Earth rotation (GMST) around Y-axis
    const gmst = satellite.gstime(date);
    sunDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), -gmst);

    // 4. Move sun light to correct direction
    sunLight.position.copy(sunDir.normalize().multiplyScalar(100));
}


// Controls
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
