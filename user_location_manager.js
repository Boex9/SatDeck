export const observer = {
  latitude:  null, // radians
  longitude: null, // radians
  height:    0     // km (sea level)
};

export let observerReady = false;
export let observerError = null;

const DEG2RAD = Math.PI / 180;

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      observer.latitude  = pos.coords.latitude * DEG2RAD;
      observer.longitude = pos.coords.longitude * DEG2RAD;

      // height intentionally fixed at 0 km
      observerReady = true;

    },
    err => {
      observerError = err.message;
      console.warn("[Observer] Location failed:", err.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
} else {
  observerError = "Geolocation not supported";
}
