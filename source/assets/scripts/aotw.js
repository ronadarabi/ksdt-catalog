async function fetchAlbumOfTheWeek() {
    const sheetId = "15VjSorWmHU6y-fqLAmzEuog5aUUzXDk6a0rHsu9Mm50"; 
    const apiKey = "AIzaSyDOC1F4Wl_OjU4WTRtHEQHe0_QfIZbaiJc"; 
    const range = "Album of the Week!A:J";  
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("Google Sheets API Response:", data);

        if (!data.values || data.values.length < 2) {
            throw new Error("No data found in the sheet or incorrect range.");
        }
        const rows = data.values;
        

        // Extract headers & records
        const headers = rows[0];  
        const records = rows.slice(1);  

        // Get today's date & find the most recent past Sunday
        const today = new Date();
        let bestMatch = null;

        records.forEach(row => {
            let sheetDate = new Date(row[0]);  
            if (sheetDate <= today) {
                bestMatch = row;  // Keep the most recent past date
            }
        });

        if (!bestMatch) {
            document.getElementById("title").innerText = "No album selected for this week.";
            return;
        }

        // Extract values safely
        const [sundayDate, title, artist, releaseYear, genres, country, RIYL, notableTracks, location, albumCoverUrl] = bestMatch;
        const saturdayDate = new Date(new Date(sundayDate).getTime() + 6 * 86400000).toISOString().split("T")[0];
        // Update HTML
        document.getElementById("week").innerText = `${sundayDate} - ${new Date(new Date(sundayDate).getTime() + 6 * 86400000).toISOString().split("T")[0]}`;
        document.getElementById("title").innerText = `${title} - ${artist} (${releaseYear})`;
        document.getElementById("genres").innerText = genres;
        document.getElementById("country").innerText = country;
        document.getElementById("RIYL").innerText = RIYL || "N/A";
        document.getElementById("notableTracks").innerText = notableTracks || "N/A";
        document.getElementById("location").innerText = location;
        document.getElementById("albumCover").src = albumCoverUrl || "https://via.placeholder.com/300";

    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("title").innerText = "Error loading album data.";
    }
}

fetchAlbumOfTheWeek();