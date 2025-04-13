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

    const songs = await Song.aggregate([
      { $sample: { size: 20 } } // Fetch 10 random songs
    ]);

    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}