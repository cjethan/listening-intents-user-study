/*
* Check if the user's songs (top songs, most recent songs) are already in the database, if not, add them.
*/
import { NextResponse } from "next/server";
import { sequelize } from "@/app/utils/database";

const NAME_ARTIST_SEPARATOR = "__@@__";
const normalize = (value = "") => (typeof value === "string" ? value.trim().toLowerCase() : "");
// Deterministic key for matching songs by name/artist regardless of casing/whitespace.
const buildNameArtistKey = (trackName = "", artistName = "") => {
  const normalizedTrackName = normalize(trackName);
  const normalizedArtistName = normalize(artistName);
  if (!normalizedTrackName || !normalizedArtistName) {
    return "";
  }
  return `${normalizedTrackName}${NAME_ARTIST_SEPARATOR}${normalizedArtistName}`;
};

// Preload existing songs in as few queries as possible to avoid per-song DB lookups.
async function preloadExistingSongs(songs) {
  const existingByTrackId = new Map();
  const existingByNameArtist = new Map();

  const trackIds = [...new Set(
    songs
      .map((song) => song.track_id)
      .filter((trackId) => typeof trackId === "string" && trackId.trim().length > 0)
  )];
  console.log(`DEBUG: Unique track_id candidates: ${trackIds.length}`);

  if (trackIds.length > 0) {
    const placeholders = trackIds.map((_, idx) => `$${idx + 1}`).join(", ");
    const query = `SELECT track_id, added_by_userdata FROM songs WHERE track_id IN (${placeholders})`;
    const existingTracks = await sequelize.query(query, {
      bind: trackIds,
      type: sequelize.QueryTypes.SELECT,
    });
    console.log(`DEBUG: Existing songs matched by track_id: ${existingTracks.length}`);

    for (const row of existingTracks) {
      existingByTrackId.set(row.track_id, row);
    }
  }

  const uniquePairs = [];
  const seenPairs = new Set();
  for (const song of songs) {
    const key = buildNameArtistKey(song.track_name, song.artist_name);
    if (!key || seenPairs.has(key)) {
      continue;
    }
    seenPairs.add(key);
    const [trackNameNormalized, artistNameNormalized] = key.split(NAME_ARTIST_SEPARATOR);
    uniquePairs.push({ key, trackNameNormalized, artistNameNormalized });
  }
  console.log(`DEBUG: Unique track_name/artist pairs: ${uniquePairs.length}`);

  if (uniquePairs.length > 0) {
    const conditions = uniquePairs.map((_, idx) => {
      const baseIndex = idx * 2;
      return `(LOWER(track_name) = $${baseIndex + 1} AND LOWER(artist_name) = $${baseIndex + 2})`;
    });
    const bind = uniquePairs.flatMap(({ trackNameNormalized, artistNameNormalized }) => [
      trackNameNormalized,
      artistNameNormalized,
    ]);
    const query = `SELECT track_id, track_name, artist_name, added_by_userdata FROM songs WHERE ${conditions.join(
      " OR "
    )}`;
    const existingNames = await sequelize.query(query, {
      bind,
      type: sequelize.QueryTypes.SELECT,
    });
    console.log(`DEBUG: Existing songs matched by name/artist: ${existingNames.length}`);

    for (const row of existingNames) {
      const key = buildNameArtistKey(row.track_name, row.artist_name);
      if (!existingByNameArtist.has(key)) {
        existingByNameArtist.set(key, row);
      }
    }
  }

  return { existingByTrackId, existingByNameArtist };
}

export async function POST(req) {
  console.log("DEBUG: Received POST request to /api/check-and-add");
  try {
    const body = await req.json();
    //console.log("DEBUG: Parsed request body:", body);

    const { songs } = body;

    if (!Array.isArray(songs)) {
      console.error("DEBUG: Invalid data format - songs is not an array:", songs);
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    console.log(`DEBUG: Number of songs received: ${songs.length}`);
    const newSongs = [];
    const existingTrackIds_originalDB = [];

    let existingSongMaps;
    try {
      existingSongMaps = await preloadExistingSongs(songs);
      console.log(
        `DEBUG: Preloaded ${existingSongMaps.existingByTrackId.size} songs by track_id and ${existingSongMaps.existingByNameArtist.size} songs by name/artist`
      );
    } catch (preloadErr) {
      console.error("DEBUG: Failed to preload songs:", preloadErr);
      return NextResponse.json({ error: "Failed to check songs" }, { status: 500 });
    }

    for (const [index, song] of songs.entries()) {
      console.log(
        `DEBUG: Evaluating song #${index + 1} (${song.track_name} - ${song.artist_name}) with track_id ${song.track_id || "<missing>"}`
      );
      const nameArtistKey = buildNameArtistKey(song.track_name, song.artist_name);
      const existingSong =
        (song.track_id && existingSongMaps.existingByTrackId.get(song.track_id)) ||
        existingSongMaps.existingByNameArtist.get(nameArtistKey);

      if (!existingSong) {
        //console.log(`DEBUG: Song with track_id ${song.track_id} does not exist. Adding to database.`);
        try {
          await sequelize.query(
            `INSERT INTO songs (track_id, track_name, artist_name, track_uri, artist_uri, album_uri, duration_ms, album_name, added_by_userdata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            {
              bind: [
                song.track_id,
                song.track_name,
                song.artist_name,
                song.track_uri,
                song.artist_uri,
                song.album_uri,
                song.duration_ms,
                song.album_name,
                song.added_by_userdata
              ],
            }
          );
          //console.log(`DEBUG: Successfully added song with track_id ${song.track_id} to database.`);
          console.log(`DEBUG: Inserted song ${song.track_name} (${song.track_id || "<no track_id>"})`);
          newSongs.push(song);
        } catch (insertErr) {
          console.error(`DEBUG: Error inserting song with track_id ${song.track_id}:`, insertErr);
        }
      } else {
        // The song already exists in the database.
        // Log the `added_by_userdata` from the DATABASE record (`existingSong`).
        //console.log(`Found existing song: ${song.track_name}. DB version has added_by_userdata: ${existingSong.added_by_userdata}`);

        // Check if the DATABASE record is an original entry.
        console.log(
          `DEBUG: Song already exists (${song.track_name}) with added_by_userdata=${existingSong.added_by_userdata}`
        );
        if (existingSong.added_by_userdata === 'no' || existingSong.added_by_userdata === null) {
          existingTrackIds_originalDB.push(song.track_id);
        }
      }
    }

    //console.log("New songs added to the database:", newSongs);
    console.log("Original DB track IDs found:", existingTrackIds_originalDB);

    return NextResponse.json({ 
      message: "Songs checked and added successfully", 
      newSongs,
      existingTrackIds_originalDB 
    }, { status: 200 });
  } catch (error) {
    console.error("Error in check-and-add API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
