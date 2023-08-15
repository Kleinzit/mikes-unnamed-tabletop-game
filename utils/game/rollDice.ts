export default function rollDice(numDice: number) {
  let count = 0;
  for (let i = 0; i < numDice; i++) {
    const roll = Math.floor(Math.random() * 6) + 1;
    if (roll === 5 || roll === 6) {
      count++;
    }
  }
  return count;
}
