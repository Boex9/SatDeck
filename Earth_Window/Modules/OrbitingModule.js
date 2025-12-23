import { OrbitControls } from '../External_Dependencies/OrbitControls.js';

export function Orbit(camera,Renderer){
    const orbitcontrols = new OrbitControls(camera,Renderer.domElement);
    orbitcontrols.maxDistance=10.5;
    orbitcontrols.minDistance=1.3;
    orbitcontrols.enableDamping=true;
    orbitcontrols.enablePan=false;
    orbitcontrols.zoomSpeed =0.8;
    return orbitcontrols;
}