import type { NextApiRequest, NextApiResponse } from "next";

import { connectToDatabase } from "@/utils/mongodb";
import { actionResolver } from "@/utils/actionResolver";

import * as dotenv from "dotenv";

dotenv.config();

export default async function handler( // CharacterSheetHandler
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("fetching /api/db/character");

  const { client, db } = await connectToDatabase();

  if (req.method === "GET") {
    const { name } = req.query
    const characterSheet = await db.collection("character-sheets").findOne({name: name});

    await client.close();
    
    if (characterSheet === null ) {
      return res.status(200).json({ message: "User does not have a character sheet" });
    }
    return res.status(200).json({ characterSheet: characterSheet });
  } else if (req.method === "POST") {
    const data = req.body; // from poke event
    const { action, weapon, damageType, tier, bodyPart, sender, receiver } =
      data;

    const update = await actionResolver(
      sender,
      receiver,
      action,
      weapon,
      damageType,
      tier,
      bodyPart
    );
    
    // https://www.mongodb.com/docs/manual/reference/method/db.collection.findOneAndUpdate/
    const updatedCharacterData = await db
      .collection("character-sheets")
      .findOneAndUpdate(
        { name: receiver },
        { $inc: update.receiverUpdate },
        { returnDocument: "after" }
      );

    const updatedSenderCharacterData = await db
      .collection("character-sheets")
      .findOneAndUpdate(
        { name: sender },
        { $inc: update.senderUpdate },
        { returnDocument: "after" }
      );

    await client.close();

    // Send updated character data to client
    return res.status(200).json({
      updatedCharacterData: updatedCharacterData,
      updatedSenderCharacterData: updatedSenderCharacterData,
    });
  }
}
