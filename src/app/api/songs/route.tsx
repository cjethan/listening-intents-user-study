/* 
* Get a sample of songs by genre.
*/
import { NextResponse } from "next/server";
import Song from "@/app/models/Song";
import { Op } from "sequelize";
import sequelize from "@/app/utils/database";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const genre = url.searchParams.get("genres");

    let whereClause = {};
    if (genre) {
      whereClause = { genres: { [Op.contains]: [genre] } };
    }

    const songs = await Song.findAll({
      where: whereClause,
      order: sequelize.random(),
      limit: 10,
    });

    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}