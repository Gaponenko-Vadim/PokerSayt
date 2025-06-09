type PlayerData = {
  position: string;
  bet: string | null;
};

export const betActionPositionFold = (
  fullPosition: string[],
  position: string,
  infoPlayers: { [key: string]: PlayerData },
  maxBet: number
): string[] => {
  console.log("betActionPositionFold input:", {
    position,
    fullPosition,
    maxBet,
    infoPlayers: Object.fromEntries(
      Object.entries(infoPlayers).map(([pos, data]) => [
        pos,
        { position: data.position, bet: data.bet },
      ])
    ),
  });

  // Проверяем текущую позицию
  const currentPlayer = infoPlayers[position];
  if (!currentPlayer) {
    console.log(`Error: No currentPlayer for position: ${position}`);
    return [];
  }

  // Находим индексы position, SB и BB
  const positionIndex = fullPosition.indexOf(position);
  const sbIndex = fullPosition.indexOf("SB");
  const bbIndex = fullPosition.indexOf("BB");
  if (positionIndex === -1 || sbIndex === -1 || bbIndex === -1) {
    console.log(
      "Error: Invalid position, SB, or BB not found in fullPosition:",
      {
        positionIndex,
        sbIndex,
        bbIndex,
      }
    );
    return [];
  }

  // Проверяем ставку текущей позиции
  const currentBetValue =
    currentPlayer.bet && currentPlayer.bet !== ""
      ? parseFloat(currentPlayer.bet.replace(/BB$/, ""))
      : null;
  console.log(
    `Current position ${position} bet: ${currentPlayer.bet} (${currentBetValue}BB)`
  );

  // Собираем позиции со ставками
  const positionsWithBets: string[] = [];
  for (const pos of fullPosition) {
    if (pos === position) {
      console.log(`Skipped position ${pos} (current position)`);
      continue;
    }
    const player = infoPlayers[pos];
    if (player && player.bet !== null && player.bet !== "") {
      const betValue = parseFloat(player.bet.replace(/BB$/, ""));
      if (!isNaN(betValue)) {
        if (betValue === maxBet) {
          console.log(`Skipped position ${pos} (has maxBet: ${player.bet})`);
          continue;
        }
        if (currentBetValue !== null && betValue < currentBetValue) {
          console.log(
            `Skipped position ${pos} (bet ${player.bet} < current bet ${currentPlayer.bet})`
          );
          continue;
        }
        positionsWithBets.push(pos);
        console.log(
          `Added position ${pos} to positionsWithBets (bet: ${player.bet})`
        );
      } else {
        console.log(`Skipped position ${pos} (invalid bet: ${player.bet})`);
      }
    }
  }
  console.log("Positions with valid bets:", positionsWithBets);

  // Собираем позиции от position до SB только для не-SB/BB позиций
  const positionsToSB: string[] = [];
  if (position !== "SB" && position !== "BB") {
    for (let i = 1; i < fullPosition.length; i++) {
      const index = (positionIndex + i) % fullPosition.length;
      const pos = fullPosition[index];
      if (pos === "SB") {
        console.log(`Reached SB, stopping`);
        break;
      }
      positionsToSB.push(pos);
      console.log(
        `Added position ${pos} to positionsToSB (bet: ${
          infoPlayers[pos]?.bet || "none"
        })`
      );
    }
  } else {
    console.log(`No positionsToSB for position ${position} (SB or BB)`);
  }
  console.log("Positions to SB:", positionsToSB);

  // Формируем результат
  const result =
    currentBetValue === null && position !== "SB" && position !== "BB"
      ? [...positionsWithBets, ...positionsToSB]
      : [...positionsWithBets];
  console.log(
    `Final result (positionsToSB included: ${
      currentBetValue === null && position !== "SB" && position !== "BB"
    }):`,
    result
  );

  return result;
};
