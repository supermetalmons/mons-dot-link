import React, { useEffect, useRef, useState } from "react";
import { go } from "../game/gameController";
import * as Board from "../game/board";

const colorSets = {
  defaultBoard: {
    gray: "#BEBEBE",
    lightGray: "#E8E8E8",
    blue: "#030DF4",
    darkGray: "#4F4F4F",
    lightBlue: "#88A8F8",
  },
  originalBoard: {
    gray: "#C9C9C9",
    lightGray: "#FDFDFD",
    blue: "#1805FF",
    darkGray: "#EDB2FF",
    lightBlue: "#53EEFF",
  },
  darkAndYellow: {
    gray: "#181818",
    lightGray: "#4A4A4A",
    blue: "#FDF30B",
    darkGray: "#BAB8B9",
    lightBlue: "#816306",
  },
  funBoard: {
    gray: "#FF69B4",
    lightGray: "#FFD700",
    blue: "#00FF00",
    darkGray: "#FF4500",
    lightBlue: "#1E90FF",
  },
};

type ColorSetKey = keyof typeof colorSets;

let currentColorSetKey: ColorSetKey = (() => {
  const stored = localStorage.getItem("boardStyle");
  return stored && stored in colorSets ? (stored as ColorSetKey) : "defaultBoard";
})();

const listeners: Array<() => void> = [];

export const toggleBoardStyle = () => {
  const keys = Object.keys(colorSets) as ColorSetKey[];
  const currentIndex = keys.indexOf(currentColorSetKey);
  currentColorSetKey = keys[(currentIndex + 1) % keys.length];
  localStorage.setItem("boardStyle", currentColorSetKey);
  listeners.forEach((listener) => listener());
  if (currentIndex === keys.length - 1) {
    Board.toggleItemsStyle();
  }
};

export const subscribeToColorSetChanges = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

const BoardComponent: React.FC = () => {
  const initializationRef = useRef(false);
  const [currentColorSet, setCurrentColorSet] = useState(colorSets[currentColorSetKey]);

  useEffect(() => {
    if (!initializationRef.current) {
      go();
      initializationRef.current = true;
    }
  }, []);

  useEffect(() => {
    const updateColorSet = () => {
      setCurrentColorSet(colorSets[currentColorSetKey]);
    };

    const unsubscribe = subscribeToColorSetChanges(updateColorSet);
    return () => {
      unsubscribe();
    };
  }, []);

  const colorGray = currentColorSet.gray;
  const colorLightGray = currentColorSet.lightGray;
  const colorBlue = currentColorSet.blue;
  const colorDarkGray = currentColorSet.darkGray;
  const colorLightBlue = currentColorSet.lightBlue;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="board-svg" viewBox="0 0 11 14.1" shapeRendering="crispEdges" overflow="visible">
      <rect y="1" width="11" height="11" fill={colorLightGray} />
      {Array.from({ length: 11 }, (_, row) =>
        Array.from({ length: 11 }, (_, col) => {
          const x = col;
          const y = row + 1;
          if ((row + col) % 2 === 1) {
            return <rect key={`square-${row}-${col}`} x={x} y={y} width="1" height="1" fill={colorGray} />;
          }
          return null;
        })
      )}

      <rect x="5" y="6" width="1" height="1" fill={colorBlue} />
      <rect x="0" y="1" width="1" height="1" fill={colorBlue} />
      <rect x="10" y="11" width="1" height="1" fill={colorBlue} />
      <rect x="10" y="1" width="1" height="1" fill={colorBlue} />
      <rect x="0" y="11" width="1" height="1" fill={colorBlue} />
      <rect x="0" y="6" width="1" height="1" fill={colorDarkGray} />
      <rect x="10" y="6" width="1" height="1" fill={colorDarkGray} />
      <rect x="4" y="4" width="1" height="1" fill={colorLightBlue} />
      <rect x="6" y="4" width="1" height="1" fill={colorLightBlue} />
      <rect x="4" y="8" width="1" height="1" fill={colorLightBlue} />
      <rect x="6" y="8" width="1" height="1" fill={colorLightBlue} />
      <rect x="3" y="5" width="1" height="1" fill={colorLightBlue} />
      <rect x="5" y="5" width="1" height="1" fill={colorLightBlue} />
      <rect x="7" y="5" width="1" height="1" fill={colorLightBlue} />
      <rect x="3" y="7" width="1" height="1" fill={colorLightBlue} />
      <rect x="5" y="7" width="1" height="1" fill={colorLightBlue} />
      <rect x="7" y="7" width="1" height="1" fill={colorLightBlue} />

      <g id="monsboard"></g>
      <g id="highlightsLayer"></g>
      <g id="itemsLayer"></g>
      <g id="controlsLayer"></g>
    </svg>
  );
};

export default BoardComponent;
