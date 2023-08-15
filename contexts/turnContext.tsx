import { useState, createContext, ReactNode, useEffect } from "react";

interface TurnContextProps {
  currentPlayer: string;
  setCurrentPlayer: (player: string) => void;
}

export const TurnContext = createContext<TurnContextProps>({
  currentPlayer: "",
  setCurrentPlayer: () => {},
});

interface TurnContextProviderProps {
  children: ReactNode;
}

export const TurnContextProvider = (props: TurnContextProviderProps) => {
  console.log("Loading TurnContextProvider");
  const [currentPlayer, setCurrentPlayer] = useState("");

  useEffect(() => {
    console.log("Fetching currentPlayer from database");
    const fetchCurrentPlayer = async () => {
      const response = await fetch("/api/db/turn");
      const data = await response.json();
      setCurrentPlayer(data.currentPlayer);
      console.log(data.currentPlayer);
    };
    fetchCurrentPlayer();
  }, []);

  const value = { currentPlayer, setCurrentPlayer };

  return (
    <TurnContext.Provider value={value}>{props.children}</TurnContext.Provider>
  );
};
