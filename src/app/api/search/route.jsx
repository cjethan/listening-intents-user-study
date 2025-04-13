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
    const { query, page = 1 } = await req.json();
    const limit = 10;
    const skip = (page - 1) * limit;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const results = await Song.find(
      {
        $or: [
          { track_name: { $regex: query, $options: "i" } },
          { artist_name: { $regex: query, $options: "i" } },
          { album_name: { $regex: query, $options: "i" } },
        ],
      },
      {
        track_id: 1,
        track_name: 1,
        artist_name: 1,
        album_name: 1,
        _id: 0,
      }
    )
      .skip(skip)
      .limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching songs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}