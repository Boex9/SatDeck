export let orbitDurationMinutes = 10; // Variable that stores the pathduration in minutes

// Called ONLY when clamped, final safe value is ready
export function updateOrbitDuration(value, unit) {
    if (unit === "minutes") {
        orbitDurationMinutes = value;
    } 
    else if (unit === "hours") {
        orbitDurationMinutes = value * 60;
    } 
    else if (unit === "days") {
        orbitDurationMinutes = value * 1440;
    }

    console.log("Updated orbit duration:", orbitDurationMinutes, "minutes");
}
