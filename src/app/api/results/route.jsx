/*
* Save a user's input to database
*/
import { NextResponse } from "next/server";
import { userResult } from "../../models/results";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI_RESULTS;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(uri);
}

export async function POST(request) {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    const body = await request.json();
    console.log("Request body:", body);

    const newUser = new userResult(body);
    console.log("New user document:", newUser);

    await newUser.save();

    return NextResponse.json({ message: "User saved successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}
