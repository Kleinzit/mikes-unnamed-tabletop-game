import { useState } from "react";
import Button from "@/components/ui/button";

type PokeButtonProps = {
  onPoke: () => void;
};

export default function PokeButton({ onPoke }: PokeButtonProps) {
  const [buttonText, setButtonText] = useState("Poke");
  const initialState = "Poke";

  const handleClick = () => {
    onPoke();
    setButtonText("Poked");
    setTimeout(() => setButtonText(initialState), 1000);
  };

  return <Button onClick={handleClick}>{buttonText}</Button>;
}
