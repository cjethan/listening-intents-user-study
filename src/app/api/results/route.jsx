/*
* Save a user's input to PostgreSQL database (classic server, ORM models)
*/
import { NextResponse } from "next/server";
import UserResult from "../../models/results";
import Genre from "../../models/genre";
import UserGenre from "../../models/userGenre";
import Intent from "../../models/intent";
import IntentSong from "../../models/intentSong";
import UserInstrument from "../../models/userInstruments";
import Instrument from "../../models/instrument";
import IntentAdjective from "../../models/intentAdjectives";
import Adjective from "../../models/adjective";
import IntentSongGenre from "../../models/intentSongGenres";

export async function POST(request) {
  console.log("POST /api/results called");
  try {
    const body = await request.json();
    console.log("Request body parsed:", body);

    const {
      user_id,
      prolific_id,
      play_instrument,
      formal_education,
      compose_music,
      hours_listening_daily,
      instruments_played_years,
      genres,
      intents,
      instruments_played,
      age,            // <-- added
      gender,         // <-- added
      nationality     // <-- added
    } = body;

    // Check if the user_id already exists
    const existingUser = await UserResult.findOne({ where: { user_id } });

    // If user does not exist, create user and all info
    if (!existingUser) {
      console.log("User does not exist. Proceeding with creation...");

      // Validate formal_education field
      const validFormalEducation = ['yes', 'ongoing', 'no'];
      if (!validFormalEducation.includes(formal_education)) {
        console.error(`Invalid value for formal_education: ${formal_education}`);
        return NextResponse.json({ error: `Invalid value for formal_education: ${formal_education}` }, { status: 400 });
      }

      // Map empty string for instruments_played_years to null
      const instruments_played_years_mapped = instruments_played_years === "" ? null : instruments_played_years;

      // Save user data, now including age, gender, nationality
      const newUser = await UserResult.create({
        user_id,
        prolific_id,
        play_instrument,
        formal_education,
        compose_music,
        hours_listening_daily,
        instruments_played_years: instruments_played_years_mapped,
        age,            // <-- added
        gender,         // <-- added
        nationality     // <-- added
      });

      // Save instruments and associate with the user
      if (instruments_played && instruments_played.length > 0) {
        for (const instrumentName of instruments_played) {
          const [instrument] = await Instrument.findOrCreate({
            where: { name: instrumentName },
          });
          await UserInstrument.create({
            user_id: newUser.user_id,
            instrument_id: instrument.id,
          });
        }
      }

      // Save genres and associate with the user
      if (genres && genres.length > 0) {
        for (const genreName of genres) {
          const [genre] = await Genre.findOrCreate({ where: { name: genreName } });
          await UserGenre.create({ user_id: newUser.user_id, genre_id: genre.id });
        }
      }
    }

    // Always save new intents and their data (even if user exists)
    for (const key in intents) {
      const intent = intents[key];

      // Check if this intent already exists for this user (avoid duplicates)
      const existingIntent = await Intent.findOne({
        where: { user_id: user_id, name: intent.intent_name }
      });
      if (existingIntent) {
        console.log(`Intent "${intent.intent_name}" for user_id ${user_id} already exists. Skipping.`);
        continue;
      }

      // Save the intent
      const newIntent = await Intent.create({
        user_id: user_id,
        name: intent.intent_name,
        how_often: intent.how_often,
        how_imp: intent.how_imp,
      });

      // Save songs for this intent
      for (const song of intent.songs) {
        const newIntentSong = await IntentSong.create({
          intent_id: newIntent.id,
          intent_name: intent.intent_name,
          track_id: song.track_id,
          track_name: song.track_name,
          artist_name: song.artist_name,
          album_name: song.album_name,
          track_uri: song.track_uri,
          artist_uri: song.artist_uri,
          album_uri: song.album_uri,
          duration_ms: song.duration_ms,
        });

        // Save genres for this song
        for (const genreName of song.genres) {
          const [genre] = await Genre.findOrCreate({ where: { name: genreName } });
          await IntentSongGenre.create({
            intent_song_id: newIntentSong.id,
            genre_id: genre.id,
          });
        }
      }

      // Save adjectives for this intent
      for (const adjective of intent.adjectives) {
        const [adjectiveRecord] = await Adjective.findOrCreate({
          where: { word: adjective },
        });
        await IntentAdjective.create({
          intent_id: newIntent.id,
          adjective_id: adjectiveRecord.id,
        });
      }
    }

    console.log("All data saved successfully");
    return NextResponse.json({ message: "User, genres, instruments, and new intents saved successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Error saving user, genres, instruments, or intents:", error);
    return NextResponse.json({ error: "Failed to save user, genres, instruments, or intents" }, { status: 500 });
  }
}
