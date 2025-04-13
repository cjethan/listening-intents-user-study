import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Song from "@/app/models/Song";

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI, {});
}

export default async function handler(req, res) {
  const limit = parseInt(req.query.limit, 10) || 10;

  try {
    await connectDB(); // Establish the database connection
    const db = mongoose.connection.db; // Access the database instance
    const randomEntries = await db.collection("songs").aggregate([{ $sample: { size: limit } }]).toArray();

    res.status(200).json(randomEntries);
  } catch (error) {
    console.error("Error fetching random entries:", error);
    res.status(500).json({ error: "Failed to fetch random entries" });
  }
}