import { useState } from "react";
import Button from "@/components/ui/button";
import React from "react";

type AttackOptionsProps = {
  options: string[];
  onOptionSelection: (option: string) => void;
};

export default function AttackOptions({
  options,
  onOptionSelection,
}: AttackOptionsProps) {
  return (
    <>
      <ul>
        {options.map((option) => (
          <React.Fragment key={option}>
            <li>
              <Button onClick={() => onOptionSelection(option)}>
                {option}
              </Button>
            </li>
            <br />
          </React.Fragment>
        ))}
      </ul>
    </>
  );
}
