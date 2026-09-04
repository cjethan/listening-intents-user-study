export async function checkSongsAndExtractGenres(songs) {
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

    const songsWithGenres = data.filter((song) => song.genres && song.genres.length > 0);

    const genres = songsWithGenres.flatMap((song) => song.genres);

    const genreFrequency = genres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});
    const sortedGenres = Object.entries(genreFrequency).sort((a, b) => b[1] - a[1]);
    const mostFrequentGenres = sortedGenres.map(([genre]) => genre);

    const uniqueGenres = [...new Set(genres)];

    return { uniqueGenres, mostFrequentGenres };
  } catch (error) {
    console.error("Error checking songs and extracting genres:", error);
    throw error;
  }
}
