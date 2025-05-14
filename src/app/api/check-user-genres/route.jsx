/*
* Get genres from the user's songs.
*/
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRESQL_URI,
});

export async function POST(req) {
  try {
    const { songs } = await req.json();

    if (!Array.isArray(songs) || songs.length === 0) {
      return NextResponse.json({ error: "Songs array is required" }, { status: 400 });
    }

    const songIds = songs.map((song) => song.track_id);
    const query = `
      SELECT track_id, genres
      FROM songs
      WHERE track_id = ANY($1::text[])
    `;
    const { rows: results } = await pool.query(query, [songIds]);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error checking user genres:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
