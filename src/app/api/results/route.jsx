/*
* Save a user's input to PostgreSQL database
*/
import { NextResponse } from "next/server";
import UserResult from "../../models/results";
import Genre from "../../models/genre";
import UserGenre from "../../models/userGenre";

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, prolific_id, play_instrument, formal_education, compose_music, hours_listening_weekly, instruments_played_years, genres, intents } = body;

    // Save user data
    const newUser = await UserResult.create({
      user_id,
      prolific_id,
      play_instrument,
      formal_education,
      compose_music,
      hours_listening_weekly,
      instruments_played_years,
      intents,
    });

    // Save genres
    if (genres && genres.length > 0) {
      for (const genreName of genres) {
        let genre = await Genre.findOne({ where: { name: genreName } });
        if (!genre) {
          genre = await Genre.create({ name: genreName });
        }
        await UserGenre.create({ user_id: newUser.user_id, genre_id: genre.id });
      }
    }

    return NextResponse.json({ message: "User saved successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}
