import { NextResponse } from "next/server";
import { userResult } from "../../models/results"; // your mongoose model
import mongoose from "mongoose";

// MongoDB connection URI
const uri = process.env.MONGODB_URI_RESULTS;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(uri);
}

// This is your API route handler for saving a user
export async function POST(request) {
  try {
    await connectDB();
    console.log("Connected to MongoDB"); // Log the connection status

    const body = await request.json(); // get the incoming data
    console.log("Request body:", body); // Log the request body

    const newUser = new userResult(body); // create a new userResult document with the body
    console.log("New user document:", newUser); // Log the new user document

    await newUser.save(); // save it to MongoDB

    return NextResponse.json({ message: "User saved successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}
