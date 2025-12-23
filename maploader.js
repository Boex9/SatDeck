import { calculateGroundTrack , getSunLatLon} from './satellitecalculator.js';
import { orbitDurationMinutes } from './Backend/OrbitInputManager.js';
const map = L.map('map', { 
    center: [20, 77], 
    zoom: 3, 
    minZoom: 1, 
    maxZoom: 13 ,
    maxBounds: [[-90, -180], [90, 180]], // limit to the real world
    maxBoundsViscosity: 1.0 // bounce back when trying to drag out
});

// Base layer
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', { 
    attribution: '© OSM' 
}).addTo(map);




// Globals for orbit + marker
let satOrbit = null;
let satMarker = null;

// Draw satellite marker
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

// Listen for updatess
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

    // Wrap marker
    const wrappedSat = map.wrapLatLng([sat.latitude, sat.longitude]);
    drawSatelliteDot(wrappedSat.lat, wrappedSat.lng);
});


// Create a marker (could use a custom Sun icon)
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

function addUserMarker(lat, lon) {
    if(userMarker) map.removeLayer(userMarker); // remove previous marker if any

    userMarker = L.circleMarker([lat, lon], {
        radius: 1,          // tiny point
        color: 'red',    // border
        fillOpacity: 0.9
    }).addTo(map);

    // Optional: center map on user
    // map.setView([lat, lon], 5);
}



navigator.geolocation.getCurrentPosition(
    (position) => {
        const { latitude, longitude } = position.coords;
        addUserMarker(latitude, longitude);
    },
    (err) => {
        console.error("Could not get user location:", err);
    },
    { enableHighAccuracy: true },
);

navigator.geolocation.getCurrentPosition(
  (pos) => {
  },
  (err) => console.error(err),
  { enableHighAccuracy: true }
);


terminator.setTime();        // sets to current time
terminator.setTime(new Date()); // or pass a specific Date

setInterval(() => terminator.setTime(), 60000);




// Update every minute
updateSun();
setInterval(updateSun, 60000);
