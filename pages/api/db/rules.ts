import type { NextApiRequest, NextApiResponse } from "next";

import { connectToDatabase } from "@/utils/mongodb";

import * as dotenv from "dotenv";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("fetching /api/db/rules");

  const { client, db } = await connectToDatabase();

  if (req.method === "GET") {
    const woundsData = await db.collection("rules").findOne({});

    await client.close();

    return res.status(200).json({ woundsData: woundsData });
  } else {
    return res.status(500).json({ message: "Rules endpoint!" });
  }
}
