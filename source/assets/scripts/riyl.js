let recordsRIYLData = []; // Store records

// Fetch Records
async function fetchRecords() {
    try {
        const response = await fetch('/ksdt-catalog/records.json');
        const data = await response.json();
        recordsRIYLData = data.map(record => ({
            format: record["Format"],  
            title: record["Title"],     
            artist: record["Artist"],   
            releaseYear: parseInt(record["Release Year"]),   
            genres: record["Genre(s)"]?.split(", ") || [],   
            country: record["Country"],   
            riyl: record["RIYL"]?.split(", ") || [],   
            location: record["Location (Shelf)"],  
            albumCoverUrl: record["Album Cover URL"]  
        }));
        displayRecords(recordsRIYLData);
    } catch (error) {
        console.error("Error fetching records:", error);
    }
}

// Display Records
function displayRecords(records) {
    const grid = document.getElementById("recordsGrid");
    if (!grid) return; // Prevent errors if grid is not found

    grid.innerHTML = ""; // Clear previous
    records.forEach((record, index) => {
        const albumDiv = document.createElement("div");
        albumDiv.classList.add("album");
        albumDiv.dataset.index = index; // Store index for retrieval

        const img = document.createElement("img");
        img.src = record.albumCoverUrl || "https://iili.io/HlHy9Yx.png";
        img.alt = `${record.title} - ${record.artist}`;
        img.onerror = () => (img.src = "https://iili.io/HlHy9Yx.png");

        const text = document.createElement("p");
        text.textContent = `${record.title} - ${record.artist} (${record.releaseYear || "unknown"})`;

        albumDiv.appendChild(img);
        albumDiv.appendChild(text);
        albumDiv.addEventListener("click", () => openAlbumDetails(records, index));

        grid.appendChild(albumDiv);

    });
}

// Open Album Details Page
function openAlbumDetails(datas, index) {
    localStorage.setItem("selectedAlbum", JSON.stringify(datas[index]));
    window.location.href = "album-details.html";
}

// Apply Filters
function applyFilters() {
    let filtered = [...recordsRIYLData];

    const sortBy = document.getElementById("sort")?.value;
    const riylSearch = document.getElementById("search-riyl")?.value.toLowerCase(); // for RIYL page


    if (riylSearch) {     
        filtered = filtered.filter(record =>
            record.riyl.join(",").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(riylSearch)

        );
    }


    // Apply Sorting
    filtered.sort((a, b) => {
        if (sortBy === "artist") return a.artist.localeCompare(b.artist);
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "releaseYearAsc") return a.releaseYear - b.releaseYear;
        if (sortBy === "releaseYearDesc") return b.releaseYear - a.releaseYear;
        return 0;
    });
    
    displayRecords(filtered);
}


// Add Event Listeners After DOM Loads
document.addEventListener("DOMContentLoaded", () => {
    fetchRecords();
    document.getElementById("sort")?.addEventListener("change", applyFilters);
    document.getElementById("search-riyl")?.addEventListener("input", applyFilters);
});


let searchRIYLTimeout;
document.getElementById("search-riyl")?.addEventListener("input", () => {
    clearTimeout(searchRIYLTimeout);
    searchRIYLTimeout = setTimeout(applyFilters, 300); // Delay execution by 300ms
});