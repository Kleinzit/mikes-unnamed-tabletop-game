import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactFragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import * as Ably from "ably/promises";

import { GlobalContext } from "@/contexts/globalContext";
import { TurnContext } from "@/contexts/turnContext";

import {
  fetchMyCharacterSheet,
  updateCharacterSheet,
} from "@/utils/game/characterSheets";
import rollDice from "@/utils/game/rollDice";

import BasePage from "@/components/base/basePage";
import Modal from "react-modal";
import { PokeNotification } from "@/components/pokeNotification";
import Loading from "@/pages/loading";
import PokeButton from "@/components/ui/pokeButton";
import EndTurnButton from "@/components/ui/endTurnButton";
import { CharacterSheet } from "@/components/characterSheet";
import AttackOptions from "@/components/attackOptions";
import React from "react";

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

  const [pokeSender, setPokeSender] = useState<string | null>(null);
  const [pokeReceiver, setPokeReceiver] = useState<string | null>(null);
  const [showPartSelection, setShowPartSelection] = useState(false);
  const [showAttackSelection, setShowAttackSelection] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

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

      const getExistingMembers = async () => {
        const messages = await _channel.presence.get();
        messages.forEach(handlePresenceMessage);
      };
      getExistingMembers();

      _channel.presence.enter();

      return () => {};
    }
  }, [user, ably, channel, onlineUsers, handlePresenceMessage]);

  useEffect(() => {
    // custom events in "game" channel
    // Subscribe to Turn "currentPlayer" Change event
    channel?.subscribe("currentPlayer", (message) => {
      setCurrentPlayer(message.data);
    });

    // Subscribe to "poke" event
    channel?.subscribe("poke", async (message) => {
      const {
        tier,
        damageType,
        bodyPart,
        action,
        sender,
        receiver,
        timestamp,
      } = message.data;

      if (sender === user) {
        const data = {
          receiver: receiver,
          sender: sender,
          action: action,
          tier: tier,
          bodyPart: bodyPart,
          damageType: damageType,
        };

        const updatedCharacterData = await updateCharacterSheet(data);
        console.log(updatedCharacterData); // sender and reciver sheets
        console.log(updatedCharacterData.updatedSenderCharacterData.value);
        setCharacter({
          characterSheet: updatedCharacterData.updatedSenderCharacterData.value,
        });

        // Send a message to the receiver
        channel?.publish("update-complete", {
          updatedCharacterData: updatedCharacterData.updatedCharacterData.value,
          timestamp: timestamp,
          sender: sender,
          receiver: receiver,
        });
      }
    });

    // Subscribe to Character Sheet "update-complete" Change event
    channel?.subscribe("update-complete", (message) => {
      const { updatedCharacterData, timestamp, sender, receiver } =
        message.data;
      if (receiver === user) {
        console.log(
          "Updated Character Sheet Recived from attacker: ",
          updatedCharacterData
        );
        setCharacter({ characterSheet: updatedCharacterData });
        // set poke sender to display poke alert
        setPokeSender(sender);
        // display message to the user in the DOM
        console.log(`You received a poke from ${sender}`);
        setPokeNotification(
          `${timestamp} - You received a poke from ${sender}`
        );
        setIsModalOpen(true);
      }
    });
  }, [channel]);

  useEffect(() => {
    if (onlineUsers.length > 0) {
      updateTurnInDatabase();
    }
  }, [onlineUsers]);

  useEffect(() => {
    fetchCharacterData();
  }, []);

  const updateTurnInDatabase = async () => {
    // Post Online Users To turn MongoDB Doc
    await fetch("/api/db/turn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ players: onlineUsers }),
    });
  };

  const fetchCharacterData = async () => {
    const characterData = await fetchMyCharacterSheet(user);
    setCharacter(characterData);
    console.log(characterData);
  };

  const sendPoke = (receiver: string, attackDamageType: string) => {
    console.log("Selected Body Part: ", selectedBodyPart);
    const characterSheet = character?.characterSheet;
    const handsSlot = characterSheet.equipment.hands;

    const weaponName = characterSheet.equipment.hands.name;
    const damageRating = handsSlot.damageRating;

    const attackProwess = characterSheet.attributes.prowess.unmodifiedValue;
    // sum prowess with modifiers
    console.log("attackProwess value", attackProwess);
    // get tier from diceRoll
    const numDice = attackProwess + damageRating;
    console.log("numDice", numDice);
    const tier = rollDice(numDice);
    console.log("tier", tier);

    channel?.publish("poke", {
      sender: user,
      receiver,
      timestamp: new Date().toISOString(),
      damageRating: damageRating,
      tier: tier,
      bodyPart: selectedBodyPart, // FIX async
      damageType: attackDamageType,
      action: "attack", // add choice
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

  function handlePartSelection(bodyPart: string) {
    setSelectedBodyPart(bodyPart);
    setShowPartSelection(false);
    setShowAttackSelection(true);
  }

  function handleAttackSelection(attack: string) {
    if (pokeReceiver) {
      sendPoke(pokeReceiver, attack); // move after rollDice manual switch
      setShowAttackSelection(false);
      setPokeReceiver(null);
    }
  }

  return (
    <BasePage>
      <div className="text-2xl m-6 text-center">
        {onlineUsers.length === 0 ? (
          <Loading />
        ) : (
          <>
            <>
              <div className="flex justify-center">
                {user === currentPlayer ? (
                  <EndTurnButton endTurn={endTurn} username={user} />
                ) : (
                  ""
                )}
              </div>
              <br />
            </>
            <ul>
              {onlineUsers.map((username: string) => {
                return (
                  <React.Fragment key={username}>
                    <li>
                      {username} is Online
                      {username === user ? (
                        " (you)"
                      ) : user === currentPlayer ? (
                        pokeReceiver !== username ? (
                          <PokeButton
                            onPoke={() => {
                              setPokeReceiver(username);
                              setShowPartSelection(true);
                            }}
                          />
                        ) : showPartSelection ? (
                          <AttackOptions
                            options={["Head", "Torso", "Limbs"]}
                            onOptionSelection={handlePartSelection}
                          />
                        ) : showAttackSelection ? (
                          character &&
                          character.characterSheet.equipment.hands
                            .damageType && (
                            <AttackOptions
                              options={
                                character.characterSheet.equipment.hands
                                  .damageType
                              }
                              onOptionSelection={handleAttackSelection}
                            />
                          )
                        ) : null
                      ) : null}
                    </li>
                    <br />
                  </React.Fragment>
                );
              })}
            </ul>
          </>
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
