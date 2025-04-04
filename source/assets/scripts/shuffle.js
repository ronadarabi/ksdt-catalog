let recordsData = []; // Store records

async function randomRecord() {
    try {
        const response = await fetch('/records.json');
        const records = await response.json();

        const randomIdx = Math.floor(Math.random() * (records.length));
        const album = records[randomIdx];

        document.getElementById("albumCover").src = album["Album Cover URL"] || "https://iili.io/HlHy9Yx.png";
        document.getElementById("title").innerText = `${album["Title"]} - ${album["Artist"]} (${album["Release Year"]})`;
        document.getElementById("genres").textContent = album["Genre(s)"];
        document.getElementById("country").textContent = album["Country"] || "N/A";
        document.getElementById("RIYL").innerText = album["RIYL"] || "N/A";
        document.getElementById("location").textContent = album["Location (Shelf)"] || "This record is not in our collection but is recommended by staff!";

    } catch (error) {
        console.error("Error fetching records:", error);
    }
}

randomRecord();
