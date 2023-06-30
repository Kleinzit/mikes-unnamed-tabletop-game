import { useState, createContext, ReactNode } from "react";

interface GlobalContextProps {
  user: string;
  setUser: (user: string) => void;
}

export const GlobalContext = createContext<GlobalContextProps>({
  user: "",
  setUser: () => {},
});

interface GlobalContextProviderProps {
  children: ReactNode;
}

export const GlobalContextProvider = (props: GlobalContextProviderProps) => {
  const [username, setUser] = useState("");

  return (
    <GlobalContext.Provider
      value={{
        user: username,
        setUser: setUser,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
};
