// Define the wounds array - fetch once on game start from db
const attacksConfig = [
  {
    bodyPart: "Torso",
    damageType: "Bludgeoning",
    tierOneEffects: [{ "attributes.constitution.unmodifiedValue": -1 }],
    tierTwoEffects: [
      { "statusEffects.constitution.unmodifiedValue": -1 },
      { "statusEffects.shock": 1 },
    ],
    tierThreeEffects: [
      { "attributes.constitution.unmodifiedValue": -1 },
      { "statusEffects.shock": 1 },
      { "statusEffects.collapsedLung": 1 },
    ],
    tierFourEffects: [
      { "attributes.constitution.unmodifiedValue": -2 },
      { "statusEffects.shock": 1 },
      { "statusEffects.collapsedLung": 1 },
    ],
  },
  {
    bodyPart: "Torso",
    damageType: "slashing",
    tierOneEffects: [{ "statusEffects.bleed": 1 }],
    tierTwoEffects: [
      { "attributes.constitution.unmodifiedValue": -1 },
      { "statusEffects.bleed": 1 },
    ],
    tierThreeEffects: [
      { "attributes.constitution.unmodifiedValue": -2 },
      { "statusEffects.gutspill": 1 },
    ],
    tierFourEffects: [
      { "attributes.constitution.unmodifiedValue": -3 },
      { "statusEffects.gutspill": 1 },
      { "statusEffects.internalBleeding": 1 },
    ],
  },
  {
    bodyPart: "Torso",
    damageType: "Piercing",
    tierOneEffects: [{ "attributes.constitution.unmodifiedValue": -1 }],
    tierTwoEffects: [{ "attributes.constitution.unmodifiedValue": -2 }],
    tierThreeEffects: [
      { "attributes.constitution.unmodifiedValue": -2 },
      { "statusEffects.internalBleeding": 1 },
    ],
    tierFourEffects: [
      { "attributes.constitution.unmodifiedValue": -3 },
      { "statusEffects.collapsedLung": 1 },
      { "statusEffects.internalBleeding": 1 },
    ],
  },
];

interface UpdateInterface {
  receiverUpdate: any;
  senderUpdate: any;
}

export async function actionResolver(
  sender: string,
  receiver: string,
  action: string,
  weapon: string,
  damageType: string,
  tier: number,
  bodyPart: string
) {
  console.log(sender, receiver, action, damageType, bodyPart);

  // Construct the update object based on the action, damageType, and tier
  const update: UpdateInterface = {
    receiverUpdate: {},
    senderUpdate: {},
  };

  if (action === "attack") {
    //    check melee or ranged
    update.senderUpdate["actionPoints"] = -1;
    // Find the attack in the attackConfig array
    const attackObj = attacksConfig.find(
      (attackConfig) =>
        attackConfig.damageType === damageType &&
        attackConfig.bodyPart === bodyPart
    );
    console.log(attackObj);

    if (attackObj) {
      // Set the update object based on the weapon's damageRating
      if (damageType === "slashing") {
        if (tier === 1) {
          const receiverUpdate = Object.assign({}, ...attackObj.tierOneEffects);
          update.receiverUpdate = receiverUpdate;
        }
        if (tier === 2) {
          const receiverUpdate = Object.assign({}, ...attackObj.tierTwoEffects);
          update.receiverUpdate = receiverUpdate;
        }
        if (tier === 3) {
          const receiverUpdate = Object.assign(
            {},
            ...attackObj.tierThreeEffects
          );
          update.receiverUpdate = receiverUpdate;
        }
        if (tier === 4) {
          const receiverUpdate = Object.assign(
            {},
            ...attackObj.tierFourEffects
          );
          update.receiverUpdate = receiverUpdate;
        }
      }
      if (damageType === "Piercing") {
        if (tier === 1) {
          const receiverUpdate = Object.assign({}, ...attackObj.tierOneEffects);
          update.receiverUpdate = receiverUpdate;
        }
        if (tier === 2) {
          const receiverUpdate = Object.assign({}, ...attackObj.tierTwoEffects);
          update.receiverUpdate = receiverUpdate;
        }
        if (tier === 3) {
          const receiverUpdate = Object.assign(
            {},
            ...attackObj.tierThreeEffects
          );
          update.receiverUpdate = receiverUpdate;
        }
        if (tier === 4) {
          const receiverUpdate = Object.assign(
            {},
            ...attackObj.tierFourEffects
          );
          update.receiverUpdate = receiverUpdate;
        }
      }
    }

    // switch (action) {
    //   case "take":
    //     break;
    //   case "hide":
    //     break;
    //   case "move":
    //     break;
    //   case "mount":
    //     break;
    //   case "grapple":
    //     break;
    //   case "bolster":
    //     break;
    //   case "intimidate":
    //     break;
    //   case "reaction":
    //     //    check Dodge, Block or Resist
    //     break;
    //   case "attack":
    //     //    check melee or ranged
    //     update.senderUpdate["actionPoints"] = -1;
    //     // Find the attack in the attackConfig array
    //     const attackObj = attacksConfig.find(
    //       (attackConfig) =>
    //         attackConfig.damageType === damageType &&
    //         attackConfig.bodyPart === bodyPart
    //     );
    //     console.log(attackObj);

    //     if (attackObj) {
    //       // Set the update object based on the weapon's damageRating
    //       let receiverUpdate; // FIX THIS

    //       switch (damageType) {
    //         case "slashing":
    //           switch (tier) {
    //             case 1:
    //               // tierOneEffects
    //               receiverUpdate = Object.assign({}, ...attackObj.tierOneEffects);
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //             case 2:
    //               // tierTwoEffects
    //               receiverUpdate = Object.assign({}, ...attackObj.tierTwoEffects);
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //             case 3:
    //               // tierThreeEffects
    //               receiverUpdate = Object.assign(
    //                 {},
    //                 ...attackObj.tierThreeEffects
    //               );
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //             case 4:
    //               // tierFourEffects
    //               receiverUpdate = Object.assign(
    //                 {},
    //                 ...attackObj.tierFourEffects
    //               );
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //           }
    //           break;
    //         case "Bludgeoning":
    //           switch (tier) {
    //             case 1:
    //               // tierOneEffects
    //               receiverUpdate = Object.assign({}, ...attackObj.tierOneEffects);
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //             case 2:
    //               // tierTwoEffects
    //               receiverUpdate = Object.assign({}, ...attackObj.tierTwoEffects);
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //             case 3:
    //               // tierThreeEffects
    //               receiverUpdate = Object.assign(
    //                 {},
    //                 ...attackObj.tierThreeEffects
    //               );
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //             case 4:
    //               // tierFourEffects
    //               receiverUpdate = Object.assign(
    //                 {},
    //                 ...attackObj.tierFourEffects
    //               );
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //           }
    //           break;
    //         case "Piercing":
    //           switch (tier) {
    //             case 1:
    //               // tierOneEffects
    //               receiverUpdate = Object.assign({}, ...attackObj.tierOneEffects);
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //             case 2:
    //               // tierTwoEffects
    //               receiverUpdate = Object.assign({}, ...attackObj.tierTwoEffects);
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //             case 3:
    //               // tierThreeEffects
    //               receiverUpdate = Object.assign(
    //                 {},
    //                 ...attackObj.tierThreeEffects
    //               );
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //             case 4:
    //               // tierFourEffects
    //               receiverUpdate = Object.assign(
    //                 {},
    //                 ...attackObj.tierFourEffects
    //               );
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //           }
    //           break;
    //         case "Elemental":
    //           switch (tier) {
    //             case 1:
    //               // tierOneEffects
    //               receiverUpdate = Object.assign({}, ...attackObj.tierOneEffects);
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //             case 2:
    //               // tierTwoEffects
    //               receiverUpdate = Object.assign({}, ...attackObj.tierTwoEffects);
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //             case 3:
    //               // tierThreeEffects
    //               receiverUpdate = Object.assign(
    //                 {},
    //                 ...attackObj.tierThreeEffects
    //               );
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //             case 4:
    //               // tierFourEffects
    //               receiverUpdate = Object.assign(
    //                 {},
    //                 ...attackObj.tierFourEffects
    //               );
    //               update.receiverUpdate = receiverUpdate;
    //               break;
    //           }
    //           break;
    //       }
    //     }
    //     break;
  }

  console.log("update", update);
  return update;
}
