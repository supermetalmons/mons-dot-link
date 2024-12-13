import React, { useEffect, useRef, useState } from "react";
import { go } from "../game/gameController";
import { AssetsSet, ColorSet, currentAssetsSet, getCurrentColorSet, toggleBoardStyle } from "../content/boardStyles";

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

export const didClickBrushButton = () => {
  toggleBoardStyle();
  listeners.forEach((listener) => listener());
};

const BoardComponent: React.FC = () => {
  const initializationRef = useRef(false);
  const [currentColorSet, setCurrentColorSet] = useState<ColorSet>(getCurrentColorSet());
  const [prefersDarkMode] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches);

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
  const [isGridVisible] = useState(currentAssetsSet !== AssetsSet.Pangchiu);

  const standardBoardTransform = "translate(0,100)";
  const pangchiuBoardTransform = "translate(83,184) scale(0.85892388)";

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="board-svg" style={{ maxHeight: isGridVisible ? "83vh" : "90vh", ...(isGridVisible ? {} : { top: "max(51%, 222.5pt)" }) }} viewBox="0 0 1100 1410" shapeRendering="crispEdges" overflow="visible">
      {isGridVisible ? (
        <g id="boardBackgroundLayer">
          <rect y="100" width="1100" height="1100" fill={colorLightSquare} />
          {Array.from({ length: 11 }, (_, row) =>
            Array.from({ length: 11 }, (_, col) => {
              const x = col * 100;
              const y = (row + 1) * 100;
              return (row + col) % 2 === 1 ? <rect key={`square-${row}-${col}`} x={x} y={y} width="100" height="100" fill={colorDarkSquare} /> : null;
            })
          )}

          {[
            [500, 600],
            [0, 100],
            [1000, 1100],
            [1000, 100],
            [0, 1100],
          ].map(([x, y], i) => (
            <rect key={`mana-pool-${i}`} x={x} y={y} width="100" height="100" fill={colorManaPool} />
          ))}

          {[
            [0, 600],
            [1000, 600],
          ].map(([x, y], i) => (
            <rect key={`pickup-${i}`} x={x} y={y} width="100" height="100" fill={colorPickupItemSquare} />
          ))}

          {[
            [400, 400],
            [600, 400],
            [400, 800],
            [600, 800],
            [300, 500],
            [500, 500],
            [700, 500],
            [300, 700],
            [500, 700],
            [700, 700],
          ].map(([x, y], i) => (
            <rect key={`simple-mana-${i}`} x={x} y={y} width="100" height="100" fill={colorSimpleManaSquare} />
          ))}
        </g>
      ) : (
        <g id="boardBackgroundLayer">
          <rect x="1" y="101" height="1161" width="1098" fill={prefersDarkMode ? "#232323" : "#FEFCF6"} />
          <image href="assets/bg/Pangchiu.jpg" x="0" y="100" width="1100" style={{ backgroundColor: prefersDarkMode ? "#232323" : "#FEFCF6" }} />
        </g>
      )}
      <g id="monsboard" transform={isGridVisible ? standardBoardTransform : pangchiuBoardTransform}></g>
      <g id="highlightsLayer" transform={isGridVisible ? standardBoardTransform : pangchiuBoardTransform}></g>
      <g id="itemsLayer" transform={isGridVisible ? standardBoardTransform : pangchiuBoardTransform}></g>
      <g id="controlsLayer"></g>
    </svg>
  );
};

export default BoardComponent;
