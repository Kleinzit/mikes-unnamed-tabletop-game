// add character context here?

export const fetchMyCharacterSheet = async (user: string) => {
  const response = await fetch(`/api/db/character?name=${user}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const characterData = await response.json();

  if (characterData.message) {
    console.log(characterData.message);
    return null;
  }
  return characterData;
};

// post change to reciver character sheet
export const updateCharacterSheet = async (data: object) => {
  const response = await fetch("/api/db/character", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const updatedCharacterData = await response.json();
  return updatedCharacterData;
};
