/*
* Search the database for songs, artists, albums, also in combination.
*/
import { NextResponse } from "next/server";
import { Op } from "sequelize";
import Song from "@/app/models/Song";

export async function POST(req) {
  try {
    const { query, page = 1, searchType = "all" } = await req.json();
    const limit = 50;
    const offset = (page - 1) * limit;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    let where = {};
    if (searchType === "all") {
      const queryWords = query.split(/\s+/).map((word) => ({
        [Op.or]: [
          { track_name: { [Op.iLike]: `%${word}%` } },
          { artist_name: { [Op.iLike]: `%${word}%` } },
          { album_name: { [Op.iLike]: `%${word}%` } },
        ],
      }));
      where = { [Op.and]: queryWords };
    } else {
      // searchType is one of "track_name", "artist_name", "album_name"
      const queryWords = query.split(/\s+/).map((word) => ({
        [searchType]: { [Op.iLike]: `%${word}%` },
      }));
      where = { [Op.and]: queryWords };
    }

    const results = await Song.findAll({
      where,
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