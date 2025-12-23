
const BASE_URL = "https://satdeck-worker.navaneetrahut0xyz.workers.dev"


export var Satellites_array;
// Function to fetch TLE DATA
async function fetchtle() {

    const tles  = await fetch(`${BASE_URL}/fetchtle`, {method: "POST", });
    console.log("Trying to fetch data from Cloudflare.");

    if (!tles.ok)
    {
        console.error("Network error, status:", tles.status);
        return;
    }
    
    return tles.json();
}

// Function to fetch Last Update Date
async function fecthdate() {

    const last_update = await fetch(`${BASE_URL}/fetchdate`,{ method: "POST" });

    if (!last_update.ok)
    {
        console.error("Network error, status:", last_update.status);
        return;
    }
    else {
        console.log("Fetched date successfully from Cloudflare.");
    }

    const date = await last_update.text();
    return date;
}


// Final function that provides the website with an array of satellite object
function parseTLE(rawData) {
    console.log("starting to parse data");
    const lines = rawData.split("\n").map(l => l.trim()).filter(l => l !== "");
    const satellites = [];

    for (let i = 0; i < lines.length; i += 3) {

        // Extracting details from the lines
        const name = lines[i];
        const line1 = lines[i + 1];
        const line2 = lines[i + 2];

        if (!line1 || !line2) continue; // skip incomplete entries

        // Extract NORAD ID from line1 (characters 2-7)
        const noradId = line1.slice(2, 7).trim();

        satellites.push({ name, noradId, line1, line2 });
    }

    console.log("Parsed data successfully.");
    return satellites;
}

async function getSatellites() {
    console.time("fetchtle");            // start timing fetch
    const rawData = await fetchtle();
    console.timeEnd("fetchtle");         // end timing fetch

    console.log("Fetched data successfully from Cloudflare.");
    return parseTLE(rawData);
}


Satellites_array = getSatellites()