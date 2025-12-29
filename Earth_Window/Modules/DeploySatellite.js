import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js";
import { scene } from "../SatDeckWindow.js";
import {Sat_Data} from "../../satellitecalculator.js"
import { calculateOrbitPath } from "./RenderOrbit.js";
import { camera } from "../SatDeckWindow.js";
import { orbitDurationMinutes } from "../../Backend/OrbitInputManager.js";

export function CreateSatelliteMarker() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, 'green');
    gradient.addColorStop(1, 'cyan');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(size/2, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(size, size);
    ctx.closePath();
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true,sizeAttenuation: true });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.03, 0.03, 1);
    scene.add(sprite);

    return sprite; // return it so we can move it later
}


export function LatLonAltToXYZ(latitude, longitude, altitude) {
    const polarAngle = THREE.MathUtils.degToRad(90 - latitude);
    const azimuthalAngle = THREE.MathUtils.degToRad(-longitude);
    const radius = 1 + (altitude / 6378); // normalize to Earth radius

    const x = radius * Math.sin(polarAngle) * Math.cos(azimuthalAngle);
    const y = radius * Math.cos(polarAngle);
    const z = radius * Math.sin(polarAngle) * Math.sin(azimuthalAngle);

    return new THREE.Vector3(x, y, z);
}

let orbitLines = [];

// assume sprite is the object returned from CreateSatelliteMarker()
function UpdateSatellitePosition(sprite, latitude, longitude, altitude) {
    const pos = LatLonAltToXYZ(latitude, longitude, altitude);
    sprite.position.copy(pos);
}
export const mySatellite = await CreateSatelliteMarker();

setInterval(() => {
    
    UpdateSatellitePosition(mySatellite, Sat_Data.latitude, Sat_Data.longitude, Sat_Data.altitude);
}, 2000);


function UpdateSatelliteMarkerScale(sprite, camera, minSize = 0.02, maxSize = 0.5, extra = 0.01) {
    const distance = camera.position.distanceTo(sprite.position);
    // scale based on distance
    let scale = THREE.MathUtils.clamp(distance / 50, minSize, maxSize);
    // add extra to make it a bit bigger
    scale += extra;
    // clamp again so it doesn't exceed maxSize
    scale = Math.min(scale, maxSize);
    sprite.scale.set(scale, scale, 1);
}

// in your interval / animation loop
setInterval(() => {
    UpdateSatelliteMarkerScale(mySatellite, camera);
}, 100);

async function renderOrbitPath(scene, noradId) {
    // remove old orbit lines
    orbitLines.forEach(line => scene.remove(line));
    orbitLines = [];

    const mode = document.querySelector('input[name="Path_duration"]:checked').value;
    const segments = await calculateOrbitPath(noradId,orbitDurationMinutes,30,mode);
    const material = new THREE.LineBasicMaterial({ color: 0x00ffff });

    segments.forEach(segment => {
        if (segment.length > 1) {
            const geometry = new THREE.BufferGeometry().setFromPoints(segment);
            const line = new THREE.Line(geometry, material);
            scene.add(line);
            orbitLines.push(line);
        }
    });
}

// keep it updated every 2 seconds
setInterval(() => {
    renderOrbitPath(scene, window.currentSatelliteId);
}, 2000);
