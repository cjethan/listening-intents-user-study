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

    if (!Array.isArray(songs) || songs.length === 0) {
      return NextResponse.json({ error: "Songs array is required" }, { status: 400 });
    }

    const songIds = songs.map((song) => song.id);
    const results = await Song.find(
      { track_id: { $in: songIds } },
      { track_id: 1, genres: 1, _id: 0 }
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error checking user genres:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
