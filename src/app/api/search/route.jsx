/*
* Search the database for songs, artists, albums, also in combination.
*/
import { NextResponse } from "next/server";
import { Op } from "sequelize";
import Song from "@/app/models/Song";

export async function POST(req) {
  try {
    const { query, page = 1 } = await req.json();
    const limit = 15;
    const offset = (page - 1) * limit;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const queryWords = query.split(/\s+/).map((word) => ({
      [Op.or]: [
        { track_name: { [Op.iLike]: `%${word}%` } },
        { artist_name: { [Op.iLike]: `%${word}%` } },
        { album_name: { [Op.iLike]: `%${word}%` } },
      ],
    }));

    const results = await Song.findAll({
      where: { [Op.and]: queryWords },
      attributes: ["track_id", "track_name", "artist_name", "album_name"],
      offset,
      limit,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching songs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}