/*
* Save a user's input to PostgreSQL database
*/
import { NextResponse } from "next/server";
import UserResult from "../../models/results"; // Use named import
import Genre from "../../models/genre";
import UserGenre from "../../models/userGenre";
import Intent from "../../models/intent";
import IntentSong from "../../models/intentSong"; // Import IntentSong model
import UserInstrument from "../../models/userInstruments"; // Import UserInstrument model
import Instrument from "../../models/instrument"; // Import Instrument model

export async function POST(request) {
  console.log("POST /api/results called");
  try {
    const body = await request.json();
    console.log("Request body parsed:", body);

    const { user_id, prolific_id, play_instrument, formal_education, compose_music, hours_listening_weekly, instruments_played_years, genres, intents, instruments_played } = body;

    /*console.log("Extracted fields:", {
      user_id,
      prolific_id,
      play_instrument,
      formal_education,
      compose_music,
      hours_listening_weekly,
      instruments_played_years,
      genres,
      intents,
      instruments_played, // Log instruments
    });*/

    // Check if the user_id already exists
    //console.log(`Checking if user_id ${user_id} exists...`);
    const existingUser = await UserResult.findOne({ where: { user_id } });

    if (!existingUser) {
      //console.log(`User with user_id ${user_id} already exists. Skipping creation.`);
      //return NextResponse.json({ message: "User already exists", user: existingUser }, { status: 200 });
    

      console.log("User does not exist. Proceeding with creation...");

      // Validate formal_education field
      const validFormalEducation = ['yes', 'ongoing', 'no'];
      if (!validFormalEducation.includes(formal_education)) {
        console.error(`Invalid value for formal_education: ${formal_education}`);
        return NextResponse.json({ error: `Invalid value for formal_education: ${formal_education}` }, { status: 400 });
      }

      console.log("Formal education validation passed");

      // Map empty string for instruments_played_years to null
      const instruments_played_years_mapped = instruments_played_years === "" ? null : instruments_played_years;

      // Save user data
      console.log("Saving user data...");
      const newUser = await UserResult.create({
        user_id,
        prolific_id,
        play_instrument,
        formal_education,
        compose_music,
        hours_listening_weekly,
        instruments_played_years: instruments_played_years_mapped, // Map empty string to null
      });
      //console.log("User saved successfully:", newUser);

      // Save instruments and associate with the user
      console.log("Saving user instruments...");
      if (instruments_played && instruments_played.length > 0) {
        console.log("Processing instruments:", instruments_played);
        for (const instrumentName of instruments_played) {
          console.log(`Processing instrument: ${instrumentName}`);
          // Find or create the instrument in the Instrument table
          const [instrument, created] = await Instrument.findOrCreate({
            where: { name: instrumentName },
          });
          console.log(`Instrument ${created ? "created" : "found"}:`, instrument);

          // Create the association in the UserInstrument table
          await UserInstrument.create({
            user_id: newUser.user_id,
            instrument_id: instrument.id, // Link to the Instrument table
          });
          console.log(`UserInstrument association created for user_id: ${newUser.user_id}, instrument_id: ${instrument.id}`);
        }
      } else {
        console.log("No instruments provided");
      }

      // Save genres and associate with the user
      if (genres && genres.length > 0) {
        //console.log("Processing genres:", genres);
        for (const genreName of genres) {
          //console.log(`Processing genre: ${genreName}`);
          const [genre, created] = await Genre.findOrCreate({ where: { name: genreName } });
          //console.log(`Genre ${created ? "created" : "found"}:`, genre);

          await UserGenre.create({ user_id: newUser.user_id, genre_id: genre.id });
          console.log(`UserGenre association created for user_id: ${newUser.user_id}, genre_id: ${genre.id}`);
        }
      } else {
        console.log("No genres provided");
      }

    }

    //console.log("intents start;", intents);
    for (const key in intents) {
      const intent = intents[key];
      //console.log("Intent:", intent);
      //console.log("Songs received for intent:", intent.songs); // Debug log to inspect songs
      const newIntent = await Intent.create({
        user_id: user_id,
        name: intent.intent_name,
        how_often: intent.how_often,
        how_imp: intent.how_imp,
      });
      //console.log("Intent saved successfully:", newIntent);

      //console.log("songs for intent:", intent.songs);
      for (const song of intent.songs) { // Use for...of to iterate through the array
        //console.log("song:", song); // Debug log for each song
        const newIntentSong = await IntentSong.create({
          intent_id: newIntent.id, // Ensure this references the correct intent
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
        //console.log("IntentSong saved successfully:", newIntentSong);
      }
    }
    console.log("All intents and songs saved successfully");

    console.log("All data saved successfully");
    return NextResponse.json({ message: "User, genres, instruments, and intents saved successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Error saving user, genres, instruments, or intents:", error);
    return NextResponse.json({ error: "Failed to save user, genres, instruments, or intents" }, { status: 500 });
  }
}
