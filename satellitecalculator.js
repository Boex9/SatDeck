import {Satellites_array} from './Backend/tle_fetcher.js';
import { observer, observerReady, observerError } from "./user_location_manager.js";


export let Sat_Data = {};
window.satlistready = null;
var noradIdStatus= null;


export const satellites_map_array = await Satellites_array;

export async function calculate_find_data()
{
    if(noradIdStatus !== window.currentSatelliteId)
    {
        window.satlistready = false;
        noradIdStatus = window.currentSatelliteId;
    }

        const tledata = satellites_map_array.find(sat=> sat.noradId === noradIdStatus);
        updateGPData(tledata.line1, tledata.line2,tledata);
        
        window.satlistready = true;
}

function calculateSpeedKmH(velocityEci) {
    // velocityEci = { x, y, z } in km/s
    const speedKms = Math.sqrt(
        velocityEci.x ** 2 +
        velocityEci.y ** 2 +
        velocityEci.z ** 2
    );
    return speedKms * 3600; // convert to km/h
}

function vecSub(a,b){
    return { x:a.x-b.x, y:a.y-b.y, z:a.z-b.z };
}

function vecDot(a,b){
    return a.x*b.x + a.y*b.y + a.z*b.z;
}

function vecMag(v){
    return Math.sqrt(vecDot(v,v));
}

// Earth rotation observer velocity (ECEF)
function observerVelocityECEF(obsEcf){
    const omega = 7.2921150e-5; // rad/s
    return {
        x: -omega * obsEcf.y,
        y:  omega * obsEcf.x,
        z:  0
    };
}



export function azimuthToCompass(deg){
      const dirs = [
        "N","NNE","NE","ENE","E","ESE","SE","SSE",
        "S","SSW","SW","WSW","W","WNW","NW","NNW","N"
    ];
    return dirs[Math.round(deg / 22.5)];
}

export function eciToEcfVelocity(vEci, rEcf){
    const omega = 7.2921150e-5; // rad/s

    return {
        x: vEci.x + omega * rEcf.y,
        y: vEci.y - omega * rEcf.x,
        z: vEci.z
    };
}


export function updateGPData(tle1, tle2 ,tledata) {
    const now = new Date();
    const satrec = satellite.twoline2satrec(tle1, tle2);
    const pv = satellite.propagate(satrec, now);
    const gmst = satellite.gstime(now);

    
    const positionEci = pv.position;
    const velocityEci = pv.velocity;
    const positionEcf = satellite.eciToEcf(positionEci, gmst);
    const velocityEcf = eciToEcfVelocity(velocityEci,positionEcf);
    const geodetic = satellite.eciToGeodetic(positionEci, gmst);


    const earthRadiusKm = 6378.137;
    const semiMajorAxisKm = satrec.a * earthRadiusKm;
    const meanAnomalyNow = satrec.mo;

    let lookAngles = null;
    let rangeRate = null;

    if (observerReady) {

    
    const obsEcf = satellite.geodeticToEcf(observer);
    const obsVel = observerVelocityECEF(obsEcf);

    const rho = {
        x: positionEcf.x - obsEcf.x,
        y: positionEcf.y - obsEcf.y,
        z: positionEcf.z - obsEcf.z
    };

    const rhoDot = {
        x: velocityEcf.x - obsVel.x,
        y: velocityEcf.y - obsVel.y,
        z: velocityEcf.z - obsVel.z
    };

    const range = Math.sqrt(rho.x**2 + rho.y**2 + rho.z**2);

    const rangeRate = 
        (rho.x*rhoDot.x + rho.y*rhoDot.y + rho.z*rhoDot.z) / range;

    const look = satellite.ecfToLookAngles(observer, positionEcf);
    

    lookAngles = {
        azimuth:   look.azimuth,
        elevation: look.elevation,
        rangeKm:   look.rangeSat,
        rangeRate: rangeRate
    };
}



    Sat_Data = {
        speed:calculateSpeedKmH(velocityEci),
        name: tledata.name,
        norad_ID:tledata.noradId,
        line1:tledata.line1,
        line2:tledata.line2,

        timestamp: now.toISOString(),

        
        velocityVector: velocityEci,
        eci: positionEci,
        ecef: positionEcf,
        latitude: satellite.degreesLat(geodetic.latitude),
        longitude: satellite.degreesLong(geodetic.longitude),
        altitude: geodetic.height, 
        meanAnomaly : meanAnomalyNow * (180/Math.PI),

        
        topocentric: lookAngles ? {
        azimuth:   lookAngles.azimuth * (180 / Math.PI),
        azimuth_direction : azimuthToCompass(lookAngles.azimuth),
        elevation: lookAngles.elevation * (180 / Math.PI),
        rangeKm:   lookAngles.rangeKm,
        rangeRate: lookAngles.rangeRate    
    } : null,

            
            
           

        // Orbital geometry (semi-static, but recomputed anyway)

            semiMajorAxis: semiMajorAxisKm,
            eccentricity: satrec.ecco,
            inclination: satrec.inclo * (180/Math.PI),
            raan: satrec.nodeo * (180/Math.PI), 
            apogeeAltitude: semiMajorAxisKm * (1 + satrec.ecco) - earthRadiusKm,
            perigeeAltitude: semiMajorAxisKm * (1 - satrec.ecco) - earthRadiusKm,
            orbitalPeriod: (2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxisKm, 3) / 398600.4418))/60,
    };
     
    
    Sat_Data.orbitalRegime = classifyOrbitalRegime(Sat_Data);
     const event = new CustomEvent('satelliteUpdated', { detail: Sat_Data });

    window.dispatchEvent(event);
}



function classifyOrbitalRegime(sat) {
    const altitudeKm = (sat.altitude);

    if (altitudeKm < 2000) {
        return "LEO"; // Low Earth Orbit
    } else if (altitudeKm < 35786) {
        return "MEO"; // Medium Earth Orbit
    } else if (Math.abs(altitudeKm - 35786) < 300 && sat.eccentricity < 0.01) {
        return "GEO"; // Geostationary Orbit
    } else {
        return "HEO"; // Highly Elliptical Orbit
    }
}



// Geting the location of the sun to render the sun in the map

export function getSunLatLon(date = new Date()) {
    // Convert to Julian Day
    const rad = Math.PI / 180;
    const d = (date / 86400000.0) + 2440587.5; // Julian day
    const n = d - 2451545.0;

    // Mean longitude of the Sun
    let L = (280.46 + 0.9856474 * n) % 360;
    if (L < 0) L += 360;

    // Mean anomaly
    const g = (357.528 + 0.9856003 * n) % 360;

    // Ecliptic longitude
    const lambda = L + 1.915 * Math.sin(g * rad) + 0.020 * Math.sin(2 * g * rad);

    // Obliquity of ecliptic
    const epsilon = 23.439 - 0.0000004 * n;

    // Right ascension
    const alpha = Math.atan2(Math.cos(epsilon * rad) * Math.sin(lambda * rad), Math.cos(lambda * rad)) / rad;

    // Declination
    const delta = Math.asin(Math.sin(epsilon * rad) * Math.sin(lambda * rad)) / rad;

    // Greenwich Mean Sidereal Time
    const GMST = (18.697374558 + 24.06570982441908 * n) % 24;
    const lon = ((alpha - GMST * 15) + 540) % 360 - 180; // [-180, 180]

    return {
        lat: delta,   // declination = subsolar latitude
        lon: lon      // longitude of the Sun
    };
}


export async function calculateGroundTrack(durationMinutes =200, stepSeconds = 30,mode="both") {
    
    const tledata = satellites_map_array.find(sat => sat.noradId === window.currentSatelliteId);
    const satrec = satellite.twoline2satrec(tledata.line1, tledata.line2);
    const segments = [];
    let segment = [];
    const now = new Date();

    let lastLon = null;

    let start, end;

        if (mode === "both") {
            start = -durationMinutes * 60;
            end   =  durationMinutes * 60;
        } else if (mode === "forward") {
            start = 0;
            end   = durationMinutes * 60;
        } else if (mode === "backward") {
            start = -durationMinutes * 60;
            end   = 0;
        }


    for (let t = start; t <= end; t += stepSeconds) {
        const futureTime = new Date(now.getTime() + t * 1000);
        const pv = satellite.propagate(satrec, futureTime);
        const gmst = satellite.gstime(futureTime);
        const geo = satellite.eciToGeodetic(pv.position, gmst);
        const lat = satellite.degreesLat(geo.latitude);
        let lon = satellite.degreesLong(geo.longitude);
        
         

        // Handle wrap-around at ±180°
        
        if (lastLon !== null && Math.abs(lon - lastLon) > 180) 
        {
            segments.push(segment); // finish current segment
            segment = [];
        }
            

        segment.push([lat, lon]);
        lastLon = lon;
    }

    segments.push(segment); // push last segment
    return segments; // array of segments
}

function update() {
  if (observerError) {
     LargestContentfulPaint
    return;
  }

  if (!observerReady) {
    requestAnimationFrame(update);
    return;
  }

  console.log("Observer ready:", {
    lat: observer.latitude * 180 / Math.PI,
    lon: observer.longitude * 180 / Math.PI
  });
}

update();

setInterval(calculate_find_data,1000);