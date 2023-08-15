type CharacterSheetProps = {
  character: any;
};

export const CharacterSheet = ({ character }: CharacterSheetProps) => {

  return (
    <div className="text-2xl m-6 text-center">
      {character && character.characterSheet.name && (
        <div>
          <h1>Action Points {character.characterSheet.actionPoints}</h1>
          <br />
          <p>Character Name: {character.characterSheet.name}</p>
          <br />
          <p>Attributes:</p>
          <br />
          <ul>
            {Object.keys(character.characterSheet.attributes).map(
              (attribute) => (
                <li key={attribute}>
                  {attribute}{" "}
                  {
                    character.characterSheet.attributes[attribute]
                      .unmodifiedValue
                  }
                </li>
              )
            )}
          </ul>
          <br />
          <p>Equipment:</p>
          <br />
          <p>Hands Slot:</p>
          <br />
          {character.characterSheet.equipment.hands ? (
            <p>
              {character.characterSheet.equipment.hands.quantity}
              {" * "}
              {character.characterSheet.equipment.hands.name}
            </p>
          ) : (
            <p>Nothing in Hands</p>
          )}

          <br />
          <p>Effects:</p>
          <br />
          <ul>
            {Object.keys(character.characterSheet.statusEffects).map(
              (effect) => (
                <li key={effect}>
                  {character.characterSheet.statusEffects[effect]}
                  {" * "}
                  {effect}
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
};  
