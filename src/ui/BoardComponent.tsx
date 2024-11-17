import React, { useEffect, useRef, useState } from "react";
import { go } from "../game/gameController";
import { ColorSet, getCurrentColorSet, toggleColorSet } from "../content/colors";

const listeners: Array<() => void> = [];

export const subscribeToColorSetChanges = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

export const toggleBoardStyle = () => {
  toggleColorSet();
  listeners.forEach((listener) => listener());
};

const BoardComponent: React.FC = () => {
  const initializationRef = useRef(false);
  const [currentColorSet, setCurrentColorSet] = useState<ColorSet>(getCurrentColorSet());

  useEffect(() => {
    if (!initializationRef.current) {
      go();
      initializationRef.current = true;
    }
  }, []);

  useEffect(() => {
    const updateColorSet = () => {
      setCurrentColorSet(getCurrentColorSet());
    };

    const unsubscribe = subscribeToColorSetChanges(updateColorSet);
    return () => {
      unsubscribe();
    };
  }, []);

  const colorDarkSquare = currentColorSet.darkSquare;
  const colorLightSquare = currentColorSet.lightSquare;
  const colorManaPool = currentColorSet.manaPool;
  const colorPickupItemSquare = currentColorSet.pickupItemSquare;
  const colorSimpleManaSquare = currentColorSet.simpleManaSquare;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="board-svg" viewBox="0 0 11 14.1" shapeRendering="crispEdges" overflow="visible">
      <rect y="1" width="11" height="11" fill={colorLightSquare} />
      {Array.from({ length: 11 }, (_, row) =>
        Array.from({ length: 11 }, (_, col) => {
          const x = col;
          const y = row + 1;
          if ((row + col) % 2 === 1) {
            return <rect key={`square-${row}-${col}`} x={x} y={y} width="1" height="1" fill={colorDarkSquare} />;
          }
          return null;
        })
      )}

      <rect x="5" y="6" width="1" height="1" fill={colorManaPool} />
      <rect x="0" y="1" width="1" height="1" fill={colorManaPool} />
      <rect x="10" y="11" width="1" height="1" fill={colorManaPool} />
      <rect x="10" y="1" width="1" height="1" fill={colorManaPool} />
      <rect x="0" y="11" width="1" height="1" fill={colorManaPool} />
      <rect x="0" y="6" width="1" height="1" fill={colorPickupItemSquare} />
      <rect x="10" y="6" width="1" height="1" fill={colorPickupItemSquare} />
      <rect x="4" y="4" width="1" height="1" fill={colorSimpleManaSquare} />
      <rect x="6" y="4" width="1" height="1" fill={colorSimpleManaSquare} />
      <rect x="4" y="8" width="1" height="1" fill={colorSimpleManaSquare} />
      <rect x="6" y="8" width="1" height="1" fill={colorSimpleManaSquare} />
      <rect x="3" y="5" width="1" height="1" fill={colorSimpleManaSquare} />
      <rect x="5" y="5" width="1" height="1" fill={colorSimpleManaSquare} />
      <rect x="7" y="5" width="1" height="1" fill={colorSimpleManaSquare} />
      <rect x="3" y="7" width="1" height="1" fill={colorSimpleManaSquare} />
      <rect x="5" y="7" width="1" height="1" fill={colorSimpleManaSquare} />
      <rect x="7" y="7" width="1" height="1" fill={colorSimpleManaSquare} />

      <g id="monsboard"></g>
      <g id="highlightsLayer"></g>
      <g id="itemsLayer"></g>
      <g id="controlsLayer"></g>
    </svg>
  );
};

export default BoardComponent;
