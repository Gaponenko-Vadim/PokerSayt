import {
  isSuited,
  isConsecutive,
  isPocketPair,
  hasGap,
} from "./cardVerification";

export const calculateCoffTwoDiapazon = (
  selectedCards: string[], // Исправляем тип на string[]
  averageEquity: number
): number => {
  const suited = isSuited(selectedCards);
  const consecutive = isConsecutive(selectedCards);
  const pocketPair = isPocketPair(selectedCards);
  const gap = hasGap(selectedCards);
  let coff: number;

  if (pocketPair) {
    // Карманная пара
    coff = 1.01;
    const startEquity = 0.75;
    const step = 0.01;
    const coffIncrement = 0.0037;

    if (averageEquity < 0.2) {
      coff = 1.2;
      const coffIncrement = 0.005;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.08;
      const coffIncrement = 0.005;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else if (suited && consecutive) {
    // Одномастные коннекторы
    coff = 1.01;
    const startEquity = 0.75;
    const step = 0.01;
    const coffIncrement = 0.0042;

    if (averageEquity < 0.13) {
      coff = 1.5;
      const coffIncrement = 0.012;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.2) {
      coff = 1.2;
      const coffIncrement = 0.008;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.2;
      const coffIncrement = 0.004;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else if (!suited && consecutive) {
    // Разномастные коннекторы
    coff = 1.01;
    const startEquity = 0.75;
    const step = 0.01;
    const coffIncrement = 0.0042;

    if (averageEquity < 0.13) {
      coff = 1.5;
      const coffIncrement = 0.006;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.2) {
      coff = 1.25;
      const coffIncrement = 0.0055;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.15;
      const coffIncrement = 0.0045;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else if (suited && gap) {
    // Одномастные карты с пробелом
    coff = 1.01;
    const startEquity = 0.75;
    const step = 0.01;
    const coffIncrement = 0.0042;

    if (averageEquity < 0.13) {
      coff = 1.4;
      const coffIncrement = 0.01;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.2) {
      coff = 1.17;
      const coffIncrement = 0.0055;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.1;
      const coffIncrement = 0.0035;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else if (!suited && gap) {
    // Разномастные карты с пробелом
    coff = 1;
    const startEquity = 0.7;
    const step = 0.01;
    const coffIncrement = 0.0035;

    if (averageEquity < 0.13) {
      coff = 1.14;
      const coffIncrement = 0.013;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.2) {
      coff = 1.28;
      const coffIncrement = 0.0036;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.1;
      const coffIncrement = 0.0045;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else {
    // Случай, когда ни одно условие не выполнено (например, selectedCards пустой)
    coff = 1.0; // Устанавливаем нейтральный коэффициент
  }

  return coff;
};
export const calculateCoffThreeDiapazon = (
  selectedCards: string[], // Исправляем тип на string[]
  averageEquity: number
): number => {
  const suited = isSuited(selectedCards);
  const consecutive = isConsecutive(selectedCards);
  const pocketPair = isPocketPair(selectedCards);
  const gap = hasGap(selectedCards);
  let coff: number;

  if (pocketPair) {
    // Карманная пара
    coff = 1.0;
    const startEquity = 0.65;
    const step = 0.01;
    const coffIncrement = 0.005;
    if (averageEquity < 0.09) {
      coff = 1.5;
      const coffIncrement = 0.014;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.13) {
      coff = 1.2;
      const coffIncrement = 0.014;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.2) {
      coff = 1.2;
      const coffIncrement = 0.0075;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.1;
      const coffIncrement = 0.006;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else if (suited && consecutive) {
    // Одномастные коннекторы
    coff = 1.0;
    const startEquity = 0.65;
    const step = 0.01;
    const coffIncrement = 0.006;
    if (averageEquity < 0.05) {
      coff = 1.3;
      const coffIncrement = 0.05;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.07) {
      coff = 1.28;
      const coffIncrement = 0.04;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.09) {
      coff = 1.3;
      const coffIncrement = 0.028;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.13) {
      coff = 1.5;
      const coffIncrement = 0.017;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.2) {
      coff = 1.45;
      const coffIncrement = 0.008;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.16;
      const coffIncrement = 0.0068;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else if (!suited && consecutive) {
    // Разномастные коннекторы
    coff = 1.0;
    const startEquity = 0.6;
    const step = 0.01;
    const coffIncrement = 0.006;
    if (averageEquity < 0.05) {
      coff = 1.2;
      const coffIncrement = 0.065;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.07) {
      coff = 1.25;
      const coffIncrement = 0.038;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.09) {
      coff = 1.2;
      const coffIncrement = 0.028;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.13) {
      coff = 1.1;
      const coffIncrement = 0.02;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.2) {
      coff = 1.4;
      const coffIncrement = 0.0065;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.13;
      const coffIncrement = 0.006;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else if (suited && gap) {
    // Одномастные карты с пробелом
    coff = 1.0;
    const startEquity = 0.6;
    const step = 0.01;
    const coffIncrement = 0.006;
    if (averageEquity < 0.05) {
      coff = 1.15;
      const coffIncrement = 0.05;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.072) {
      coff = 1.2;
      const coffIncrement = 0.037;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.09) {
      coff = 1.2;
      const coffIncrement = 0.028;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.13) {
      coff = 1.25;
      const coffIncrement = 0.0195;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.2) {
      coff = 1.35;
      const coffIncrement = 0.008;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.13;
      const coffIncrement = 0.007;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else if (!suited && gap) {
    // Разномастные карты с пробелом
    coff = 1.0;
    const startEquity = 0.6;
    const step = 0.01;
    const coffIncrement = 0.006;
    if (averageEquity < 0.03) {
      coff = 1.18;
      const coffIncrement = 0.07;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.49) {
      coff = 1.18;
      const coffIncrement = 0.06;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.072) {
      coff = 1.2;
      const coffIncrement = 0.028;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.09) {
      coff = 1.2;
      const coffIncrement = 0.02;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.13) {
      coff = 1.25;
      const coffIncrement = 0.0195;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.2) {
      coff = 1.3;
      const coffIncrement = 0.0075;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.13;
      const coffIncrement = 0.007;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else {
    // Случай, когда ни одно условие не выполнено (например, selectedCards пустой)
    coff = 1.0; // Устанавливаем нейтральный коэффициент
  }

  return coff;
};
