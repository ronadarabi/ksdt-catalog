document.addEventListener("DOMContentLoaded", () => {
    const album = JSON.parse(localStorage.getItem("selectedAlbum"));
    console.log(album);

    if (!album) {
        document.body.innerHTML = "<h2>Album not found.</h2>";
        return;
    }

    document.getElementById("albumCover").src = album.albumCoverUrl || "https://iili.io/HlHy9Yx.png";
    document.getElementById("title").innerText = `${album.title} - ${album.artist} (${album.releaseYear || "unknown"})`;
    document.getElementById("genres").textContent = album.genres.join(", ");
    document.getElementById("country").textContent = album.country || "N/A";
    document.getElementById("RIYL").innerText = album.riyl || "N/A";
    document.getElementById("location").textContent = album.location || "This record is not in our collection but is recommended by staff!";
});
