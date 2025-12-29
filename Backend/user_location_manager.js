export const observer = {
    latitude:  null,   // radians
    longitude: null,   // radians
    height:    0.02    // km (≈20 m above sea level)
};

export let observerReady = false;
export let observerError = null;
export let observerMode  = "home";

const DEG2RAD = Math.PI / 180;

export function setCustomObserver(latDeg, lonDeg){
    observer.latitude  = latDeg * DEG2RAD;
    observer.longitude = lonDeg * DEG2RAD;
    observerMode  = "custom";
    observerReady = true;
}

export function requestHomeObserver(){

    observerReady = false;
    observerError = null;
    observerMode  = "home";

    if (!("geolocation" in navigator)) {
        observerError = "Geolocation not supported";
        observerMode = "custom";
        observerReady = true;
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            observer.latitude  = pos.coords.latitude  * DEG2RAD;
            observer.longitude = pos.coords.longitude * DEG2RAD;
            observerReady = true;
        },
        err => {
            observerError = err.message;

            // 🔁 FALLBACK TO CUSTOM
            observerMode  = "custom";
            observerReady = true;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}


// Boot in home mode

const latInput = document.getElementById("lat_entry");
const lonInput = document.getElementById("long_entry");
const locationRadios = document.querySelectorAll('input[name="Location"]');

function clamp(v,min,max){ return Math.min(Math.max(v,min),max); }

function applyCustomObserver(){

    if(document.querySelector('input[name="Location"]:checked').value !== "custom") return;

    let lat = parseFloat(latInput.value);
    let lon = parseFloat(lonInput.value);

    if(isNaN(lat) || isNaN(lon)) return;

    lat = clamp(lat,-90,90);
    lon = clamp(lon,-180,180);

    latInput.value = lat.toFixed(5);
    lonInput.value = lon.toFixed(5);

    setCustomObserver(lat, lon);
}

// Fire when radio selected
locationRadios.forEach(radio=>{
    radio.addEventListener("change", e=>{
        if(e.target.value === "home") requestHomeObserver();
        if(e.target.value === "custom") applyCustomObserver();
    });
});

// Fire when input loses focus
latInput.addEventListener("blur", applyCustomObserver);
lonInput.addEventListener("blur", applyCustomObserver);
