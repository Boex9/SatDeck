import  { Satellites_array} from "./tle_fetcher.js";

var satdata = null;
export var satlistready;

window.currentSatelliteId = "25544";

export function initSatelliteSearch(satellites) {
    const Satellite_Container = document.getElementById("sat_container");
    const Search_Input_Field = document.getElementById("Search_input");
    const Search_Button = document.getElementById("Search_button");

    let renderedCount = 0;
    const batchSize = 50; // adjust as needed
    let currentArray = satellites;

    // Renders next batch of satellites as buttons
    function renderBatch() {
        const end = Math.min(renderedCount + batchSize, currentArray.length);

        for (let i = renderedCount; i < end; i++) {
            const s = currentArray[i];
            const btn = document.createElement("button");
            btn.className =
                "w-full h-[2rem] bg-SatDeck_List_dark flex-shrink-0 font-[notosans] text-white flex flex-row text-md px-2 items-center hover:bg-SatDeck_Accents cursor-pointer active:text-SatDeck_Primary_Dark truncate overflow-ellipsies white-space:nowrap";
            btn.innerHTML = `
               <span class="flex-1/3 text-gray-400">${s.noradId}</span>
               <span class="flex-2/3  pl-2">${s.name}</span>
            `;

            btn.addEventListener("click", () => {
                 window.currentSatelliteId = s.noradId;
            });

            Satellite_Container.appendChild(btn);
        }
        renderedCount = end;
    }

    function resetAndRender(newArray) {
        currentArray = newArray;
        renderedCount = 0;
        Satellite_Container.innerHTML = "";
        renderBatch();
    }

    // Initial render
    resetAndRender(satellites);
    satlistready =true;

    let isLoading = false;
    Satellite_Container.addEventListener("scroll", () => {
        const atBottom =
            Satellite_Container.scrollTop + Satellite_Container.clientHeight >=
            (Satellite_Container.scrollHeight/1.7) - 10;

        if (atBottom && !isLoading && renderedCount < currentArray.length) {
            isLoading = true;
            setTimeout(() => {
                renderBatch();
                isLoading = false;
            }, 200);
        }
    });

    function performSearch() {
        const query = Search_Input_Field.value.trim().toLowerCase();
        const filtered = query
            ? satellites.filter(
                (s) =>
                    s.name.toLowerCase().includes(query) ||
                    s.noradId.includes(query)
            )
            : satellites;
        resetAndRender(filtered);
    }

    // 🔹 Live search as you type
    Search_Input_Field.addEventListener("input", () => performSearch());

    // 🔹 Disable the button (kept for compatibility, but does nothing)
    Search_Button.disabled = true;
}



window.addEventListener("DOMContentLoaded", () => {

    (async () =>
        {
            try
            {   
                satdata = await Satellites_array;// The array holding the satellite objects
                console.log("Data Loaded");
                initSatelliteSearch(satdata); // this will set issatloaded = true internally
            }
            catch (err)
            {
                console.error("Error fetching/parsing TLEs:", err);
            }
            }
        )();
    }
);
