import React, { useState } from "react";
import styles from "./stayle.module.css";

const LimitsGame: React.FC = () => {
  type TypeLimitStadia = "low" | "medium" | "large" | "maximum";

  const [activeStadia, setActiveStadia] = useState<TypeLimitStadia>("low");

  const stadiaOptions: TypeLimitStadia[] = [
    "low",
    "medium",
    "large",
    "maximum",
  ];

  const getStadiaClass = (stadia: TypeLimitStadia) => {
    switch (stadia) {
      case "low":
        return styles.low;
      case "medium":
        return styles.medium;
      case "large":
        return styles.large;
      case "maximum":
        return styles.maximum;
      default:
        return "";
    }
  };

  const handleStadiaChange = (stadia: TypeLimitStadia) => {
    setActiveStadia(stadia);
  };

  return (
    <div className={styles.gameStadiaContainer}>
      <h1 className={styles.title}>Limits</h1>
      <div className={styles.stadiaButtons}>
        {stadiaOptions.map((stadia) => (
          <button
            key={stadia}
            className={`${styles.stadiaButton} ${
              activeStadia === stadia ? getStadiaClass(stadia) : ""
            }`}
            onClick={() => handleStadiaChange(stadia)}
          >
            {stadia.charAt(0).toUpperCase() + stadia.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.stadiaContent}>
        <h2>Current Stage: {activeStadia.toUpperCase()}</h2>
        <div
          className={`${styles.stadiaIndicator} ${getStadiaClass(
            activeStadia
          )}`}
        ></div>
        <p>Content for {activeStadia} stage goes here...</p>
      </div>
    </div>
  );
};

export default LimitsGame;
