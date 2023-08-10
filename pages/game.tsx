import { useCallback, useContext, useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import * as Ably from "ably/promises";

import { GlobalContext } from "@/contexts/globalContext";
import { TurnContext } from "@/contexts/turnContext";

import BasePage from "@/components/base/basePage";
import Modal from "react-modal";
import { PokeNotification } from "@/components/pokeNotification";
import Loading from "@/pages/loading";
import PokeButton from "@/components/ui/pokeButton";
import EndTurnButton from "@/components/ui/endTurnButton";
import { CharacterSheet } from "@/components/characterSheet";

interface CharacterSheetInterface {
  characterSheet: any;
}

const Game: React.FC = () => {
  const router = useRouter();

  const { user } = useContext(GlobalContext);
  const { currentPlayer, setCurrentPlayer } = useContext(TurnContext);
  
  const [character, setCharacter] = useState<CharacterSheetInterface | null>(
    null
  );
  const [shouldRefetch, setShouldRefetch] = useState(false); // replace with characterData and updatedCharacterData
  
  const [pokeSender, setPokeSender] = useState<string | null>(null);
  const [pokeNotification, setPokeNotification] = useState<string | null>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [ably, setAbly] = useState<Ably.Types.RealtimePromise | null>(null);
  const [channel, setChannel] =
    useState<Ably.Types.RealtimeChannelPromise | null>(null);

  const handlePresenceMessage = useCallback(
    (message: Ably.Types.PresenceMessage) => {
      console.log(
        "handlePresenceMessage",
        message.action,
        message.clientId,
        new Date()
      );

      if (message.action === "enter" || message.action === "present") {
        setOnlineUsers((prev) => {
          if (prev.includes(message.clientId) === false) {
            return [...prev, message.clientId];
          } else {
            return prev;
          }
        });
      } else {
        // user has left
        setOnlineUsers((prev) =>
          prev.filter((username) => {
            const keep: boolean = username !== message.clientId;
            return keep;
          })
        );
      }
    },
    []
  );

  useEffect(() => {
    // The first requirement is to have a valid username
    // to be used as the Ably clientId
    if (!user) {
      // redirect to User Form
      router.push("/");
      return async () => {
        await channel?.presence.leave();
        channel?.presence.unsubscribe();
        ably?.close();
        setChannel(null);
        setAbly(null);
      };
    }
    // If not already connected to ably, connect
    if (ably === null) {
      const ably = new Ably.Realtime.Promise({
        authUrl: "/api/authentication/token-auth",
        authMethod: "POST",
        clientId: user,
      });

      ably.connection.on((stateChange: Ably.Types.ConnectionStateChange) => {
        console.log(stateChange);
      });

      setAbly(ably);
    }

    if (ably === null) return;

    // If not already subscribed to a channel, subscribe
    if (channel === null) {
      const _channel: Ably.Types.RealtimeChannelPromise =
        ably.channels.get("game");
      setChannel(_channel);

      // Note: the 'present' event doesn't always seem to fire
      // so we use presence.get() later to get the initial list of users
      // _channel.presence.subscribe(['present', 'enter', 'leave'], handlePresenceMessage)
      _channel.presence.subscribe(["enter", "leave"], handlePresenceMessage);

      // Subscribe to poke event
      _channel.subscribe("poke", async (message) => {
        const {
          damageRating,
          damageType,
          bodyPart,
          action,
          sender,
          receiver,
          timestamp,
        } = message.data;

        if (sender === user) {
          // make prowess useState work instead of this garbage
          const characterData = await fetchMyCharacterSheet(user);
          // let user choose damageType if possible
          const attackProwess = // sum prowess with modifiers
            characterData.characterSheet.attributes.prowess.unmodifiedValue;
          console.log("attackProwess value", attackProwess);
          // get tier from diceRoll
          const numDice = attackProwess + damageRating;
          console.log("numDice", numDice);
          const tier = rollDice(numDice);
          console.log("tier", tier);
          // post change to reciver character sheet
          const updateDatabase = async () => {
            const response = await fetch("/api/db/character", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                receiver: receiver,
                sender: sender,
                action: action,
                tier: tier,
                bodyPart: bodyPart,
                damageType: damageType,
              }),
            });
            const updatedCharacterData = await response.json();
            return updatedCharacterData;
          };

          const updatedCharacterData = await updateDatabase();
          console.log(updatedCharacterData);
          setShouldRefetch((prev) => !prev);
          // Send a message to the receiver to notify them that the update is complete
          _channel.publish("update-complete", {
            receiver: receiver,
            updatedCharacterData: updatedCharacterData,
          });
        }

        if (receiver === user) {
          // display message to the user
          setPokeSender(sender);
          console.log(`You received a poke from ${sender}`);
          setPokeNotification(
            `${timestamp} - You received a poke from ${sender}`
          );
          setIsModalOpen(true);
        }
      });

      // Subscribe to Character Sheet "update-complete" Change event
      _channel.subscribe("update-complete", (message) => {
        if (message.data.receiver === user) {
          // update character sheet if changed
          setShouldRefetch((prev) => !prev);
        }
      });

      // Subscribe to Turn "currentPlayer" Change event
      _channel.subscribe("currentPlayer", (message) => {
        setCurrentPlayer(message.data);
        console.log("client context currentPlayer:", currentPlayer);
      });

      const getExistingMembers = async () => {
        const messages = await _channel.presence.get();
        messages.forEach(handlePresenceMessage);
      };
      getExistingMembers();

      _channel.presence.enter();

      return () => {};
    }
  }, [
    user,
    ably,
    channel,
    onlineUsers,
    handlePresenceMessage,
    setCurrentPlayer,
  ]);

  useEffect(() => {
    const updateDatabase = async () => {
      await fetch("/api/db/turn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ players: onlineUsers }),
      });
    };
    updateDatabase();
  }, [onlineUsers]);

  const fetchData = async () => {
    const characterData = await fetchMyCharacterSheet(user);
    setCharacter(characterData);
    console.log(characterData);
  };

  useEffect(() => {
    fetchData();
  }, [shouldRefetch]);

  const fetchMyCharacterSheet = async (user: string) => {
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

  const sendPoke = (receiver: string) => {
    const handsSlot = character?.characterSheet.equipment.hands
    channel?.publish("poke", {
      sender: user,
      receiver,
      timestamp: new Date().toISOString(),
      action: "attack",
      bodyPart: "Torso",
      damageType: handsSlot.damageType[0], // add choice
      damageRating: handsSlot.damageRating,
    });
  };

  const endTurn = async (user: string) => {
    const data = {
      name: "endTurn",
      username: user,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch("/api/db/turn-action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log(result);
    if (result.success) {
      channel?.publish("currentPlayer", result.currentPlayer);
    }
  };

  function rollDice(numDice: number) {
    let count = 0;
    for (let i = 0; i < numDice; i++) {
      const roll = Math.floor(Math.random() * 6) + 1;
      if (roll === 5 || roll === 6) {
        count++;
      }
    }
    return count;
  }

  return (
    <BasePage>
      <div className="text-2xl m-6 text-center">
        {onlineUsers.length === 0 ? (
          <Loading />
        ) : (
          <ul>
            {onlineUsers.map((username: string) => {
              return (
                <li key={username}>
                  {username} is Online
                  {username === user ? (
                    " (you)"
                  ) : user === currentPlayer ? (
                    <PokeButton sendPoke={sendPoke} username={username} />
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="flex justify-center">
        {user === currentPlayer ? (
          <EndTurnButton endTurn={endTurn} username={user} />
        ) : (
          ""
        )}
      </div>
      <CharacterSheet character={character} />
      <Modal
        className="h-0 w-1/2 flex justify-center items-center fixed inset-20"
        overlayClassName="fixed top-0 left-0 right-0 bottom-0 bg-gray-600 bg-opacity-30"
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      >
        {pokeSender && <PokeNotification sender={pokeSender} />}
      </Modal>
      <div>{pokeNotification && <div>{pokeNotification}</div>}</div>
    </BasePage>
  );
};

export default Game;
