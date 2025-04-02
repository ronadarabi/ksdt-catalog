// Google Sheets API Key & Spreadsheet Info
const sheetId = "15VjSorWmHU6y-fqLAmzEuog5aUUzXDk6a0rHsu9Mm50"; // Your Google Sheet ID
const apiKey = "AIzaSyDOC1F4Wl_OjU4WTRtHEQHe0_QfIZbaiJc"; // Replace with your API Key
const sheetName = "Records!A:H"; // Name of the tab

// Google Sheets API URL
const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

let recordsData = []; // Store records

async function fetchRecords() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const records = data.values.slice(1); // Skip header row
        recordsData = records.map(record => ({
            title: record[0],
            artist: record[1],
            releaseYear: parseInt(record[2]),
            genres: record[3]?.split(", ").map(genre => genre.trim()) || [],
            country: record[4],
            location: record[6],
            albumCoverUrl: record[7]
        }));
        populateFilters();
        displayRecords(recordsData);
    } catch (error) {
        console.error("Error fetching records:", error);
    }
}


// Populate Filters
function populateFilters() {
    const genreSet = new Set(), decadeSet = new Set(), countrySet = new Set(), locationSet = new Set();
    recordsData.forEach(record => {
        record.genres.forEach(genre => genreSet.add(genre));
        decadeSet.add(Math.floor(record.releaseYear / 10) * 10);
        countrySet.add(record.country);
        locationSet.add(record.location);
    });

    populateDropdown("genre", genreSet);
    populateDropdown("decade", decadeSet, "s");
    populateDropdown("country", countrySet);
    populateDropdown("location", locationSet);
}

// Populate Dropdown Helper
function populateDropdown(id, values, suffix = "") {
    const select = document.getElementById(id);
    values.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = suffix ? `${value}${suffix}` : value;
        select.appendChild(option);
    });
}

// Display Records
function displayRecords(records) {
    const grid = document.getElementById("recordsGrid");
    grid.innerHTML = ""; // Clear previous
    records.forEach(({ title, artist, releaseYear, albumCoverUrl }) => {
        const albumDiv = document.createElement("div");
        albumDiv.classList.add("album");

        const img = document.createElement("img");
        img.src = albumCoverUrl;
        img.alt = `${title} - ${artist}`;
        img.onerror = () => (img.src = "fallback.jpg");

        const text = document.createElement("p");
        text.textContent = `${title} - ${artist} (${releaseYear})`;

        albumDiv.appendChild(img);
        albumDiv.appendChild(text);
        grid.appendChild(albumDiv);
    });
}

// Sorting & Filtering
document.getElementById("sort").addEventListener("change", applyFilters);
document.getElementById("genre").addEventListener("change", applyFilters);
document.getElementById("decade").addEventListener("change", applyFilters);
document.getElementById("country").addEventListener("change", applyFilters);
document.getElementById("location").addEventListener("change", applyFilters);

function applyFilters() {
    let filtered = [...recordsData];

    const genre = document.getElementById("genre").value;
    const decade = document.getElementById("decade").value;
    const country = document.getElementById("country").value;
    const location = document.getElementById("location").value;
    const sortBy = document.getElementById("sort").value;

    // Filtering Logic
    if (genre) filtered = filtered.filter(record => record.genres.includes(genre));
    if (decade) filtered = filtered.filter(record => Math.floor(record.releaseYear / 10) * 10 == decade);
    if (country) filtered = filtered.filter(record => record.country === country);
    if (location) filtered = filtered.filter(record => record.location === location);

    // Sorting Logic
    filtered.sort((a, b) => {
        if (sortBy === "artist") return a.artist.localeCompare(b.artist);
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "releaseYearAsc") return a.releaseYear - b.releaseYear;  // Oldest to Newest
        if (sortBy === "releaseYearDesc") return b.releaseYear - a.releaseYear; // Newest to Oldest
        return 0;
    });

    displayRecords(filtered);
}


fetchRecords();
