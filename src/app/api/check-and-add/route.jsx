/*
* Check if the user's songs (top songs, most recent songs) are already in the database, if not, add them.
*/
import { NextResponse } from "next/server";
import { sequelize } from "@/app/utils/database";

export async function POST(req) {
  try {
    const { songs } = await req.json();

    if (!Array.isArray(songs)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const newSongs = [];
    for (const song of songs) {
      // Check if the song exists in the database
      const [existingSong] = await sequelize.query(
        `SELECT track_id FROM songs WHERE track_id = $1 LIMIT 1`, // Changed table name to lowercase
        { bind: [song.track_id], type: sequelize.QueryTypes.SELECT }
      );

      if (!existingSong) {
        // Add the song to the database if it does not exist
        await sequelize.query(
          `INSERT INTO songs (track_id, track_name, artist_name, track_uri, artist_uri, album_uri, duration_ms, album_name, added_by_Userdata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, // Changed table name to lowercase
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
              1, // added_by_Userdata
            ],
          }
        );
        newSongs.push(song);
      }
    }

    console.log("New songs added to the database:", newSongs);

    return NextResponse.json({ message: "Songs checked and added successfully", newSongs });
  } catch (error) {
    console.error("Error in check-and-add API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
