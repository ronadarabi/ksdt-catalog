// Google Sheets API Key & Spreadsheet Info
const sheetId = "15VjSorWmHU6y-fqLAmzEuog5aUUzXDk6a0rHsu9Mm50"; // Your Google Sheet ID
const apiKey = "AIzaSyDOC1F4Wl_OjU4WTRtHEQHe0_QfIZbaiJc"; // Replace with your API Key
const sheetName = "Media!A:I"; // Name of the tab

// Google Sheets API URL
const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

let recordsData = []; // Store records

// Fetch Records
async function randomRecord() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const records = data.values.slice(1); 

        const randomIdx = Math.floor(Math.random() * (records.length));
        const album = records[randomIdx];

        document.getElementById("albumCover").src = album[8] || "https://iili.io/HlHy9Yx.png";
        document.getElementById("title").innerText = `${album[1]} - ${album[2]} (${album[3]})`;
        document.getElementById("genres").textContent = album[4];
        document.getElementById("country").textContent = album[5] || "N/A";
        document.getElementById("RIYL").innerText = album[6] || "N/A";
        document.getElementById("location").textContent = album[7] || "This record is not in our collection but is recommended by staff!";

    } catch (error) {
        console.error("Error fetching records:", error);
    }
}

randomRecord();