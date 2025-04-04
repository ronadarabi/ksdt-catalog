let recordsData = []; // Store records

// Fetch Records
async function fetchRecords() {
    try {
        const response = await fetch('/records.json');
        const data = await response.json();
        recordsData = data.map(record => ({
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
        populateFilters();
        displayRecords(recordsData);
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
        albumDiv.addEventListener("click", () => openAlbumDetails(records,index));

        grid.appendChild(albumDiv);
    });
}

// Open Album Details Page
function openAlbumDetails(datas,index) {
    localStorage.setItem("selectedAlbum", JSON.stringify(datas[index]));
    window.location.href = "album-details.html";
}

function sortAlphabetically(s) {
    const arr = [...s];
    arr.sort();
    return arr;
}

// Populate Filters
function populateFilters() {
    const formatSet = new Set(), genreSet = new Set(), decadeSet = new Set(), countrySet = new Set(), locationSet = new Set();
    recordsData.forEach(record => {
        record.genres.forEach(genre => genreSet.add(genre));
        decadeSet.add(Math.floor(record.releaseYear / 10) * 10);
        countrySet.add(record.country);
        locationSet.add(record.location);
        formatSet.add(record.format);
    });

    // Clean up sets
    decadeSet.delete(NaN);

    // Populate
    populateDropdown("genre", genreSet);
    populateDropdown("decade", sortAlphabetically(decadeSet), "s");
    populateDropdown("country", sortAlphabetically(countrySet));
    populateDropdown("location", sortAlphabetically(locationSet));
    populateDropdown("format",formatSet);
}

// Populate Dropdown Helper
function populateDropdown(id, values, suffix = "") {
    const select = document.getElementById(id);
    if (!select) return; // Prevent errors if element not found
    values.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = suffix ? `${value}${suffix}` : value;
        select.appendChild(option);
    });
}

// Apply Filters
function applyFilters() {
    let filtered = [...recordsData];

    const searchQuery = document.getElementById("search")?.value.toLowerCase();
    const genre = document.getElementById("genre")?.value;
    const decade = document.getElementById("decade")?.value;
    const country = document.getElementById("country")?.value;
    const location = document.getElementById("location")?.value;
    const format = document.getElementById("format")?.value;
    const sortBy = document.getElementById("sort")?.value;

    // Apply Search Filter (checks if searchQuery exists in title OR artist)
    if (searchQuery) {
        filtered = filtered.filter(record => 
            record.title.toLowerCase().includes(searchQuery) || 
            record.artist.toLowerCase().includes(searchQuery)
        );
    }

    // Apply Other Filters
    if (genre) filtered = filtered.filter(record => record.genres.includes(genre));
    if (decade) filtered = filtered.filter(record => Math.floor(record.releaseYear / 10) * 10 == decade);
    if (country) filtered = filtered.filter(record => record.country === country);
    if (location) filtered = filtered.filter(record => record.location === location);
    if (format) filtered = filtered.filter(record => record.format === format);

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
    document.getElementById("genre")?.addEventListener("change", applyFilters);
    document.getElementById("decade")?.addEventListener("change", applyFilters);
    document.getElementById("country")?.addEventListener("change", applyFilters);
    document.getElementById("location")?.addEventListener("change", applyFilters);
    document.getElementById("format")?.addEventListener("change",applyFilters);
    document.getElementById("search")?.addEventListener("input", applyFilters);
});

let searchTimeout;
document.getElementById("search")?.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 300); // Delay execution by 300ms
});