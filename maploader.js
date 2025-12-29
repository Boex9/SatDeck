import { calculateGroundTrack , getSunLatLon} from './satellitecalculator.js';
import { orbitDurationMinutes } from './Backend/OrbitInputManager.js';
import { observer, observerReady } from "./user_location_manager.js";


// ---- NO IDEA HOW ANY OF THIS WORKS USED CHATGPT FOR HELP-------
const map = L.map('map', { 
    center: [20, 77], 
    zoom: 3, 
    minZoom: 1, 
    maxZoom: 13 ,
    maxBounds: [[-90, -180], [90, 180]], // limit to the real world cordinates
    maxBoundsViscosity: 1.0 // bounce back when trying to drag out
});

// Base layer 
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', { 
    attribution: '© OSM' 
}).addTo(map);




// Globals for orbit + marker
let satOrbit = null;
let satMarker = null;

// Drwaing the satellite marker for the map
function drawSatelliteDot(lat, lon) {
    if (satMarker) {
        map.removeLayer(satMarker);
    }

    satMarker = L.circleMarker([lat, lon], {
        radius: 5,
        color: 'blue',   // border color
        fillColor: 'cyan',  // inside color
        fillOpacity: 0.9
    }).addTo(map);
}

// Listening for updatess in path duraton 
window.addEventListener('satelliteUpdated', async (e) => {
    const sat = e.detail;

    if (satOrbit) map.removeLayer(satOrbit);

    // Wrap orbit
    const mode = document.querySelector('input[name="Path_duration"]:checked').value;

    const groundTrack = await calculateGroundTrack(orbitDurationMinutes,30,mode);
    
    const wrappedTrack = groundTrack.map(segment =>
        segment.map(([lat, lon]) => {
            const wrapped = map.wrapLatLng([lat, lon]);
            return [wrapped.lat, wrapped.lng];
        })
    );

    satOrbit = L.layerGroup(
        wrappedTrack.map(segment =>
            L.polyline(segment, { color: "gray", weight: 2 })
        )
    ).addTo(map);

    
    const wrappedSat = map.wrapLatLng([sat.latitude, sat.longitude]);
    drawSatelliteDot(wrappedSat.lat, wrappedSat.lng);
});



const sunIcon = L.icon({
    iconUrl: "./Icons/sun.png",
    iconSize: [10, 10]
});

let sunMarker = L.marker([0, 0], { icon: sunIcon }).addTo(map);

function updateSun() {
    const { lat, lon } = getSunLatLon();
    sunMarker.setLatLng([lat, lon]);
}


let terminator = L.terminator({
    resolution: 2,        // points per degree (higher → smoother curve)
    longitudeRange: 360,  // how far horizontally to draw
    fillColor: 'black',   // polygon fill
    fillOpacity: 0.2,     // darkness for night
    color: null           // border color (none)
}).addTo(map);

let userMarker = null;




function updateUserMarker(){

    if(!observerReady || observer.latitude === null) return;

    const lat = observer.latitude * 180 / Math.PI;
    const lon = observer.longitude * 180 / Math.PI;

    if(!userMarker){
        userMarker = L.circleMarker([lat, lon], {
            radius: 1,
            color: "red",
            fillOpacity: 0.9
        }).addTo(map);
    }
    else{
        userMarker.setLatLng([lat, lon]);
    }
}

setInterval(updateUserMarker,1000);


terminator.setTime();        // sets to current time
terminator.setTime(new Date()); // or pass a specific Date

setInterval(() => terminator.setTime(), 60000);




// Update every minute
updateSun();
setInterval(updateSun, 60000);
