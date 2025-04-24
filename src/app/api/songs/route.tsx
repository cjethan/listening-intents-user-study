import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Song from "@/app/models/Song";

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI, {
  });
}

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const genre = url.searchParams.get("genre");

    let query = {};
    if (genre) {
      query = { genres: { $in: [genre] } }; // Filter by genre in the genres array
      console.log(`Filtering songs by genre: ${genre}`);
    }

    const songs = await Song.aggregate([
      { $match: query }, // Apply genre filter if provided
      { $sample: { size: 10 } }, // Fetch a smaller random sample (10 songs)
    ]);

    console.log(`Fetched ${songs.length} songs${genre ? ` for genre: ${genre}` : ""}`);
    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}