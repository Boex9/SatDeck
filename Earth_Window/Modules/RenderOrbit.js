import { LatLonAltToXYZ } from "./DeploySatellite.js";
import { satellites_map_array } from "../../satellitecalculator.js";

export async function calculateOrbitPath(
    noradId,
    durationMinutes = 200,
    stepSeconds = 30,
    mode = "both"   // "forward", "backward", "both"
) {
    const tledata = satellites_map_array.find(sat => sat.noradId === noradId);
    if (!tledata) throw new Error(`No TLE found for NORAD ID: ${noradId}`);

    const satrec = satellite.twoline2satrec(tledata.line1, tledata.line2);
    const segments = [];
    let segment = [];
    const now = new Date();

    // Determine time range based on mode
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
        if (!pv.position) continue;

        const gmst = satellite.gstime(futureTime);
        const geo = satellite.eciToGeodetic(pv.position, gmst);
        const lat = satellite.degreesLat(geo.latitude);
        const lon = satellite.degreesLong(geo.longitude);
        const alt = geo.height;

        segment.push(LatLonAltToXYZ(lat, lon, alt));
    }

    segments.push(segment);
    return segments; // array of arrays of Vector3
}
