export async function checkSongsAndExtractGenres(songs) {
  console.log("Starting to check songs in the database...");
  try {
    const response = await fetch("/api/check-user-genres", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ songs }),
    });

    if (!response.ok) {
      throw new Error(`Failed to check songs in the database: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Database response for song check:", data);

    const songsWithGenres = data.filter((song) => song.genres && song.genres.length > 0);
    console.log("Songs with genres:", songsWithGenres);

    const genres = songsWithGenres.flatMap((song) => song.genres);
    console.log("Extracted genres:", genres);

    // Calculate the most frequent genres
    const genreFrequency = genres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});
    const sortedGenres = Object.entries(genreFrequency).sort((a, b) => b[1] - a[1]);
    const mostFrequentGenres = sortedGenres.map(([genre]) => genre);
    console.log("Most frequent genres:", mostFrequentGenres);

    // Filter for unique genres
    const uniqueGenres = [...new Set(genres)];
    console.log("Unique genres:", uniqueGenres);

    return { uniqueGenres, mostFrequentGenres };
  } catch (error) {
    console.error("Error checking songs and extracting genres:", error);
    throw error;
  }
}
