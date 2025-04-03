// Google Sheets API Key & Spreadsheet Info
const sheetId = "15VjSorWmHU6y-fqLAmzEuog5aUUzXDk6a0rHsu9Mm50"; // Your Google Sheet ID
const apiKey = "AIzaSyDOC1F4Wl_OjU4WTRtHEQHe0_QfIZbaiJc"; // Replace with your API Key
const sheetName = "Media!A:I"; // Name of the tab

// Google Sheets API URL
const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

let recordsData = []; // Store records

// Fetch Records
async function fetchRecords() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const records = data.values.slice(1); // Skip header row
        recordsData = records.map(record => ({
            format: record[0],
            title: record[1],
            artist: record[2],
            releaseYear: parseInt(record[3]),
            genres: record[4]?.split(", ").map(genre => genre.trim()) || [],
            country: record[5],
            riyl: record[6]?.split(", ").map(genre => genre.trim()) || [],
            location: record[7],
            albumCoverUrl: record[8]
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
    const formatSet = new Set(), genreSet = new Set(), decadeSet = new Set(), countrySet = new Set(), locationSet = new Set(), similarSet = new Set();
    recordsData.forEach(record => {
        record.genres.forEach(genre => genreSet.add(genre));
        decadeSet.add(Math.floor(record.releaseYear / 10) * 10);
        countrySet.add(record.country);
        locationSet.add(record.location);
        formatSet.add(record.format);
        record.riyl.forEach(similar => similarSet.add(similar));
    });

    // Clean up sets
    decadeSet.delete(NaN);

    // Populate
    populateDropdown("genre", genreSet);
    populateDropdown("decade", sortAlphabetically(decadeSet), "s");
    populateDropdown("country", countrySet);
    populateDropdown("location", locationSet);
    populateDropdown("format",formatSet);
    populateDropdown("similar",sortAlphabetically(similarSet));
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
    const similar = document.getElementById("similar")?.value;
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
    if (similar) filtered = filtered.filter(record => record.riyl.includes(similar));

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
    document.getElementById("similar")?.addEventListener("change",applyFilters);
    document.getElementById("search")?.addEventListener("input", applyFilters);
});

let searchTimeout;
document.getElementById("search")?.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 300); // Delay execution by 300ms
});