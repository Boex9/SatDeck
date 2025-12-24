import{azimuthToCompass,Sat_Data,satellites_map_array} from '../satellitecalculator.js'
import { updateOrbitDuration } from './OrbitInputManager.js';
import { observer } from '../user_location_manager.js';


// IT TAKES THE DATA FROM OTHER SCRIPTS AND THEN ASSIGNS THOSE DATA VALUES TO THE RESPECTIVE DOM ELEMENTS

// --- POSITION AND MOTION ---
const speedspan = document.getElementById("SI_Speed");
// --- VELOCITY VECTOR ---
const velocityXSpan = document.getElementById("SI_VV_X_xaxis");
const velocityYSpan = document.getElementById("SI_VV_Y_xaxis");
const velocityZSpan = document.getElementById("SI_VV_Z_xaxis");

// --- ECI COORDINATES ---
const eciXSpan = document.getElementById("SI_ECI_X_xaxis");
const eciYSpan = document.getElementById("SI_ECI_Y_xaxis");
const eciZSpan = document.getElementById("SI_ECI_Z_xaxis");

// --- ECEF COORDINATES ---
const ecefXSpan = document.getElementById("SI_ECEF_X_xaxis");
const ecefYSpan = document.getElementById("SI_ECEF_Y_xaxis");
const ecefZSpan = document.getElementById("SI_ECEF_Z_xaxis");

// --- GEODETIC POSITION ---
const latitudeSpan = document.getElementById("SI_Latitude");
const longitudeSpan = document.getElementById("Longitude");
const altitudeSpan = document.getElementById("SI_Altitude");

// --- ORBITAL GEOMETRY ---
const orbitalRegimeSpan = document.getElementById("SI_Orbital_Regim");
const semiMajorAxisSpan = document.getElementById("SI_Semi_Major_Axis");
const apogeeAltitudeSpan = document.getElementById("SI_Apogee_altitude");
const perigeeAltitudeSpan = document.getElementById("SI_Preigee_altitude");
const orbitalPeriodSpan = document.getElementById("SI_Orbital_Period");
const eccentricitySpan = document.getElementById("SI_Eccentricity");
const inclinationSpan = document.getElementById("SI_Inclination");
const meanAnomalySpan = document.getElementById("SI_Mean_Anomaly");
const raanSpan = document.getElementById("SI_RAAN");
const user_position_span = document.getElementById("user_location");


const noradIDSpan = document.getElementById("Norad_ID");
const line1Span = document.getElementById("tle_line1");
const line2Span = document.getElementById("tle_line2");
const Satnamediv = document.getElementById("Sat_Name");

const satllitecountspan = document.getElementById("satellite_count");

const Azimuthspan = document.getElementById("SI_Azimuth");
const Elevationspan = document.getElementById("SI_Elevation");
const Range = document.getElementById("SI_Range");
const RangeRate = document.getElementById("SI_Range_Rate");

setInterval(()=>{
if(window.satlistready === true)
{
    speedspan.textContent = Number(Sat_Data.speed).toFixed(3);
    latitudeSpan.textContent = JSON.stringify(Number(Sat_Data.latitude.toFixed(3)));
    longitudeSpan.textContent = JSON.stringify(Number(Sat_Data.longitude.toFixed(3)));
    altitudeSpan.textContent = JSON.stringify(Number(Sat_Data.altitude.toFixed(3)));


    line1Span.textContent = Sat_Data.line1;
    line2Span.textContent = Sat_Data.line2;

    const v = Sat_Data.velocityVector;
    velocityXSpan.textContent = `${v.x.toFixed(3)}`;
    velocityYSpan.textContent = `${v.y.toFixed(3)}`;
    velocityZSpan.textContent = `${v.z.toFixed(3)}`;

    const ecicord = Sat_Data.eci;
    eciXSpan.textContent =`${ecicord.x.toFixed(5)}`;
    eciYSpan.textContent =`${ecicord.y.toFixed(5)}`;
    eciZSpan.textContent =`${ecicord.z.toFixed(5)}`;

    const ecefcord = Sat_Data.ecef;
    ecefXSpan.textContent =`${ecefcord.x.toFixed(5)}`;
    ecefYSpan.textContent =`${ecefcord.y.toFixed(5)}`;
    ecefZSpan.textContent =`${ecefcord.z.toFixed(5)}`;

    orbitalRegimeSpan.textContent=Sat_Data.orbitalRegime;
    semiMajorAxisSpan.textContent = Number(Sat_Data.semiMajorAxis).toFixed(3);
    apogeeAltitudeSpan.textContent = Number(Sat_Data.apogeeAltitude).toFixed(3);
    perigeeAltitudeSpan.textContent = Number(Sat_Data.perigeeAltitude).toFixed(3);
    orbitalPeriodSpan.textContent = Number(Sat_Data.orbitalPeriod).toFixed(5);
    eccentricitySpan.textContent = Number(Sat_Data.eccentricity).toFixed(6);
    inclinationSpan.textContent = Number(Sat_Data.inclination).toFixed(5);
    meanAnomalySpan.textContent = Number(Sat_Data.meanAnomaly).toFixed(5);
    raanSpan.textContent = Number(Sat_Data.raan).toFixed(5);

    noradIDSpan.textContent = Sat_Data.norad_ID;
    Satnamediv.textContent =  Sat_Data.name;
    const az = Sat_Data.topocentric.azimuth;
    const compass = azimuthToCompass(az);

    Azimuthspan.innerText = `${az.toFixed(1)}° (${compass})`;
    Elevationspan.textContent = Number(Sat_Data.topocentric.elevation).toFixed(5);
        
    Range.textContent = Sat_Data.topocentric.rangeKm;
    RangeRate.textContent=Sat_Data.topocentric.rangeRate;
    const rr = Sat_Data.topocentric.rangeRate;

    SI_Range_Rate.innerText =
    `${rr.toFixed(3)} km/s ${rr < 0 ? "(Approaching)" : "(Receding)"}`;
    const RAD2DEG = 180 / Math.PI;

    user_position_span.textContent =
    `Your Location :- Lat: ${(observer.latitude * RAD2DEG).toFixed(5)}°  Lon: ${(observer.longitude * RAD2DEG).toFixed(5)}°`;



    // enforce min/max dynamically


    satllitecountspan.textContent = "Total " +satellites_map_array.length +" satellites available";
}

},100);




const LIMITS = {
    minutes: { min: 10, max: Infinity },
    hours:   { min: 1, max: Infinity },
    days:    { min: 1, max: Infinity}
};

const durationInput = document.getElementById("durationInput");
const durationUnit = document.getElementById("durationUnit");

// clamp when done typing
durationInput.addEventListener("blur", applyClamp);

// clamp when unit changes
durationUnit.addEventListener("change", applyClamp);

function applyClamp() {
    let val = parseInt(durationInput.value);

    if (isNaN(val)) val = 1;

    const unit = durationUnit.value;
    const { min, max } = LIMITS[unit];

    val = Math.max(min, Math.min(max, val));

    durationInput.value = val;

    updateOrbitDuration(val, unit);
}




