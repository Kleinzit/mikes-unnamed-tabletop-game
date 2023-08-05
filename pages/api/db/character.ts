import type { NextApiRequest, NextApiResponse } from "next";

import { connectToDatabase } from "@/utils/mongodb";

import * as dotenv from "dotenv";

dotenv.config();

export default async function handler( // CharacterSheetHandler
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("fetched /api/db/character");

  const { client, db } = await connectToDatabase();

  if (req.method === "GET") {
    const { name } = req.query
    const turnData = await db.collection("character-sheets").findOne({name: name});

    await client.close();

    return res.status(200).json({ turnData: turnData });
  } else if (req.method === "POST") {
    const data = req.body;

    // await db.collection("turn").updateOne({}, { $set: { players } });

    await client.close();

    return res.status(200).json({ message: "posted to character sheet" });
  }
}
