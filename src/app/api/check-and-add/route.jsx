/*
* Check if the user's songs (top songs, most recent songs) are already in the database, if not, add them.
*/
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Song from "@/app/models/Song";

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI, {});
}

export async function POST(req) {
  try {
    await connectDB();
    const { songs } = await req.json();
    console.log("Received songs:", songs);

    if (!Array.isArray(songs)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const existingSongs = await Song.find(
      { track_id: { $in: songs.map((song) => song.id) } },
      { track_id: 1 }
    );

    const existingSongIds = new Set(existingSongs.map((song) => song.track_id));

    const newSongs = songs.filter((song) => !existingSongIds.has(song.id));

    console.log("New songs to be added:", newSongs);

    if (newSongs.length > 0) {
      await Song.insertMany(
        newSongs.map((song) => ({
          track_id: song.id,
          track_name: song.title,
          artist_name: song.artist,
          track_uri: song.track_uri,
          artist_uri: song.artist_uri,
          album_uri: song.album_uri,
          duration_ms: song.duration_ms,
          album_name: song.album,
          image: song.image,
          added_by_User: 1
        })),
        { strict: false } // Ensure no __v field is added
      );
    }

    return NextResponse.json({ message: "Songs checked and added successfully", newSongs });
  } catch (error) {
    console.error("Error in check-and-add API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
