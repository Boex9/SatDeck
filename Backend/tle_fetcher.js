export var Satellites_array;
export var satelites_date;
// Function to fetch TLE DATA
async function fetchtle() {
    const res = await fetch("./Backend/tledata.txt");

    if (!res.ok) {
        console.error("Failed to load local TLE file:", res.status);
        return;
    }

    return await res.text();
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

        if (!line1 || !line2) continue; // Skip incomplete entries

        // Extract NORAD ID from line1 (characters 2-7)
        const noradId = line1.slice(2, 7).trim();

        satellites.push({ name, noradId, line1, line2 });
    }

    console.log("Parsed data successfully.");
    return satellites;
}

async function getSatellites() {
    console.time("fetchtle");            // start timing fetch
    const rawData = await fetchtle();    // Measuring how much time it took to fetch more useful when we are taking tles from the cloud
    console.timeEnd("fetchtle");         // end timing fetch

    return parseTLE(rawData);
}


Satellites_array = getSatellites();