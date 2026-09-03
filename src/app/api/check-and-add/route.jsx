/*
* Check if the user's songs are already in the database, if not, add them.
*/
import { NextResponse } from "next/server";
import { sequelize } from "@/app/utils/database";

const NAME_ARTIST_SEPARATOR = "__@@__";
const normalize = (value = "") => (typeof value === "string" ? value.trim().toLowerCase() : "");
const buildNameArtistKey = (trackName = "", artistName = "") => {
  const normalizedTrackName = normalize(trackName);
  const normalizedArtistName = normalize(artistName);
  if (!normalizedTrackName || !normalizedArtistName) {
    return "";
  }
  return `${normalizedTrackName}${NAME_ARTIST_SEPARATOR}${normalizedArtistName}`;
};

// Preload existing songs in as few queries as possible to avoid per-song DB lookups
async function preloadExistingSongs(songs) {
  const existingByTrackId = new Map();
  const existingByNameArtist = new Map();

  const trackIds = [...new Set(
    songs
      .map((song) => song.track_id)
      .filter((trackId) => typeof trackId === "string" && trackId.trim().length > 0)
  )];

  if (trackIds.length > 0) {
    const placeholders = trackIds.map((_, idx) => `$${idx + 1}`).join(", ");
    const query = `SELECT track_id, track_name, artist_name, added_by_userdata FROM songs WHERE track_id IN (${placeholders})`;
    const existingTracks = await sequelize.query(query, {
      bind: trackIds,
      type: sequelize.QueryTypes.SELECT,
    });

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
  try {
    const body = await req.json();

    const { songs } = body;

    if (!Array.isArray(songs)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const newSongs = [];
    const originalLastFmTrackIds = new Map();

    let existingSongMaps;
    try {
      existingSongMaps = await preloadExistingSongs(songs);
    } catch (preloadErr) {
      return NextResponse.json({ error: "Failed to check songs" }, { status: 500 });
    }

    for (const [index, song] of songs.entries()) {
      const nameArtistKey = buildNameArtistKey(song.track_name, song.artist_name);
      const existingSong =
        (song.track_id && existingSongMaps.existingByTrackId.get(song.track_id)) ||
        existingSongMaps.existingByNameArtist.get(nameArtistKey);

      if (!existingSong) {
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
          newSongs.push(song);
        } catch (insertErr) {
          console.error(`Error inserting song with track_id ${song.track_id}:`, insertErr);
        }
      } else {
        if (existingSong.added_by_userdata === 'no' || existingSong.added_by_userdata === null) {
          const dbNameArtistKey = buildNameArtistKey(existingSong.track_name, existingSong.artist_name);
          const fallbackKey = nameArtistKey || existingSong.track_id || song.track_id;
          const dedupeKey = dbNameArtistKey || fallbackKey;
          const lastFmId = song.track_id || existingSong.track_id;
          if (dedupeKey && lastFmId && !originalLastFmTrackIds.has(dedupeKey)) {
            originalLastFmTrackIds.set(dedupeKey, lastFmId);
          }
        }
      }
    }

    const existingTrackIds_originalDB = Array.from(originalLastFmTrackIds.values());

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
