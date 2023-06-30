import { GlobalContext } from "@/contexts/globalContext";
import { useContext } from "react";

export const MyUserComponent = () => {
  const { user, setUser } = useContext(GlobalContext);

  const handleUsernameChange = (event: { target: { value: any } }) => {
    setUser(event.target.value);
  };

  return (
    <div>
      <input type="text" onChange={handleUsernameChange} />
      <p>Entered username: {user}</p>
    </div>
  );
};
