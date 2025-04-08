export type PlayerStatus = "neutral" | "aggressive" | "tight";
type Position8Max = "UTG" | "UTG+1" | "MP" | "MP+1" | "HJ" | "BT" | "SB" | "BB";
type StackSize = "little" | "middle" | "big"; // <15BB | 15-25BB | 25+BB

export const AllInFE_8Max: Record<
  Position8Max,
  {
    base: number; // Базовое фолд эквити при алл-ине (в долях, 0-1)
    adjustments: {
      stack: Record<StackSize, number>; // Корректировки для стека оппонента
      status: Record<PlayerStatus, number>; // Корректировки для стиля игры
      myStack: Record<StackSize, number>; // Корректировки для моего стека
      // Дополнительная корректировка, если мой стек маленький, а у оппонента большой
    };
  }
> = {
  UTG: {
    base: 0.75,
    adjustments: {
      stack: { little: 0.1, middle: 0, big: -0.05 },
      status: { neutral: 0, aggressive: -0.05, tight: 0.1 },
      myStack: { little: -0.05, middle: 0, big: 0.1 },
    },
  },
  "UTG+1": {
    base: 0.73,
    adjustments: {
      stack: { little: 0.11, middle: 0, big: -0.06 },
      status: { neutral: 0, aggressive: -0.05, tight: 0.1 },
      myStack: { little: -0.05, middle: 0, big: 0.1 },
    },
  },
  MP: {
    base: 0.7,
    adjustments: {
      stack: { little: 0.12, middle: 0, big: -0.07 },
      status: { neutral: 0, aggressive: -0.06, tight: 0.11 },
      myStack: { little: -0.06, middle: 0, big: 0.11 },
    },
  },
  "MP+1": {
    base: 0.68,
    adjustments: {
      stack: { little: 0.13, middle: 0, big: -0.08 },
      status: { neutral: 0, aggressive: -0.06, tight: 0.11 },
      myStack: { little: -0.06, middle: 0, big: 0.11 },
    },
  },
  HJ: {
    base: 0.65,
    adjustments: {
      stack: { little: 0.14, middle: 0, big: -0.09 },
      status: { neutral: 0, aggressive: -0.07, tight: 0.12 },
      myStack: { little: -0.07, middle: 0, big: 0.12 },
    },
  },
  BT: {
    // Предполагаю BT = BTN
    base: 0.6,
    adjustments: {
      stack: { little: 0.15, middle: 0, big: -0.1 },
      status: { neutral: 0, aggressive: -0.08, tight: 0.13 },
      myStack: { little: -0.07, middle: 0, big: 0.12 },
    },
  },
  SB: {
    base: 0.55,
    adjustments: {
      stack: { little: 0.16, middle: 0, big: -0.12 },
      status: { neutral: 0, aggressive: -0.09, tight: 0.14 },
      myStack: { little: -0.08, middle: 0, big: 0.13 },
    },
  },
  BB: {
    base: 0.5,
    adjustments: {
      stack: { little: 0.18, middle: 0, big: -0.15 },
      status: { neutral: 0, aggressive: -0.1, tight: 0.15 },
      myStack: { little: -0.08, middle: 0, big: 0.15 },
    },
  },
};

export const Open23BetFE_8Max: Record<
  Position8Max,
  {
    base: number; // Базовое фолд эквити при открытии 2-3x (в долях, 0-1)
    adjustments: {
      stack: Record<StackSize, number>; // Корректировки для стека оппонента
      status: Record<PlayerStatus, number>; // Корректировки для стиля игры
      myStack: Record<StackSize, number>; // Корректировки для моего стека
    };
  }
> = {
  UTG: {
    base: 0.4, // Умеренное FE, так как UTG тайтовая, но не алл-ин
    adjustments: {
      stack: { little: -0.03, middle: 0, big: -0.07 },
      status: { neutral: 0, aggressive: -0.05, tight: 0.07 },
      myStack: { little: -0.03, middle: 0, big: 0.05 },
    },
  },
  "UTG+1": {
    base: 0.38,
    adjustments: {
      stack: { little: -0.03, middle: 0, big: -0.07 },
      status: { neutral: 0, aggressive: -0.05, tight: 0.07 },
      myStack: { little: -0.03, middle: 0, big: 0.05 },
    },
  },
  MP: {
    base: 0.35,
    adjustments: {
      stack: { little: -0.04, middle: 0, big: -0.08 },
      status: { neutral: 0, aggressive: -0.06, tight: 0.08 },
      myStack: { little: -0.04, middle: 0, big: 0.06 },
    },
  },
  "MP+1": {
    base: 0.33,
    adjustments: {
      stack: { little: -0.04, middle: 0, big: -0.08 },
      status: { neutral: 0, aggressive: -0.06, tight: 0.08 },
      myStack: { little: -0.04, middle: 0, big: 0.06 },
    },
  },
  HJ: {
    base: 0.3,
    adjustments: {
      stack: { little: -0.05, middle: 0, big: -0.09 },
      status: { neutral: 0, aggressive: -0.07, tight: 0.09 },
      myStack: { little: -0.05, middle: 0, big: 0.07 },
    },
  },
  BT: {
    // Предполагаю BT = BTN
    base: 0.28,
    adjustments: {
      stack: { little: -0.05, middle: 0, big: -0.1 },
      status: { neutral: 0, aggressive: -0.08, tight: 0.1 },
      myStack: { little: -0.05, middle: 0, big: 0.07 },
    },
  },
  SB: {
    base: 0.25, // SB вложил 0.5 BB, реже фолдит
    adjustments: {
      stack: { little: -0.06, middle: 0, big: -0.11 },
      status: { neutral: 0, aggressive: -0.09, tight: 0.11 },
      myStack: { little: -0.06, middle: 0, big: 0.08 },
    },
  },
  BB: {
    base: 0.2, // BB вложил 1 BB, еще реже фолдит
    adjustments: {
      stack: { little: -0.07, middle: 0, big: -0.12 },
      status: { neutral: 0, aggressive: -0.1, tight: 0.12 },
      myStack: { little: -0.07, middle: 0, big: 0.09 },
    },
  },
};

// myLittleVsOpponentBig: -0.17,
