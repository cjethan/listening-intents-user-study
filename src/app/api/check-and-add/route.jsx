/*
* Check if the user's songs (top songs, most recent songs) are already in the database, if not, add them.
*/
import { NextResponse } from "next/server";
import { sequelize } from "@/app/utils/database";

export async function POST(req) {
  console.log("DEBUG: Received POST request to /api/check-and-add");
  try {
    const body = await req.json();
    console.log("DEBUG: Parsed request body:", body);

    const { songs } = body;

    if (!Array.isArray(songs)) {
      console.error("DEBUG: Invalid data format - songs is not an array:", songs);
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    console.log(`DEBUG: Number of songs received: ${songs.length}`);
    const newSongs = [];
    for (const [idx, song] of songs.entries()) {
      console.log(`DEBUG: Processing song #${idx + 1}:`, song);

      // Check if the song exists in the database
      let existingSong;
      try {
        [existingSong] = await sequelize.query(
          `SELECT track_id FROM songs WHERE track_id = $1 LIMIT 1`,
          { bind: [song.track_id], type: sequelize.QueryTypes.SELECT }
        );
        console.log(`DEBUG: Song with track_id ${song.track_id} exists:`, !!existingSong);
      } catch (checkErr) {
        console.error(`DEBUG: Error checking song existence for track_id ${song.track_id}:`, checkErr);
        continue;
      }

      if (!existingSong) {
        console.log(`DEBUG: Song with track_id ${song.track_id} does not exist. Adding to database.`);
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
          console.log(`DEBUG: Successfully added song with track_id ${song.track_id} to database.`);
          newSongs.push(song);
        } catch (insertErr) {
          console.error(`DEBUG: Error inserting song with track_id ${song.track_id}:`, insertErr);
        }
      } else {
        console.log(`DEBUG: Song with track_id ${song.track_id} already exists. Skipping insert.`);
      }
    }

    console.log("New songs added to the database:", newSongs);

    return NextResponse.json({ message: "Songs checked and added successfully", newSongs });
  } catch (error) {
    console.error("Error in check-and-add API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
