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

  useEffect(() => {
    if (!initializationRef.current) {
      go();
      setIsGridVisible(currentAssetsSet !== AssetsSet.Pangchiu);
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
  const [isGridVisible, setIsGridVisible] = useState(true);

  const standardBoardTransform = "translate(0,100)";
  const boardTransform = "translate(0,100) scale(0.81265509)";

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="board-svg" viewBox="0 0 1100 1410" shapeRendering="crispEdges" overflow="visible">
      <g style={{ display: isGridVisible ? "block" : "none" }}>
        <rect y="100" width="1100" height="1100" fill={colorLightSquare} />
        {Array.from({ length: 11 }, (_, row) =>
          Array.from({ length: 11 }, (_, col) => {
            const x = col * 100;
            const y = (row + 1) * 100;
            if ((row + col) % 2 === 1) {
              return <rect key={`square-${row}-${col}`} x={x} y={y} width="100" height="100" fill={colorDarkSquare} />;
            }
            return null;
          })
        )}

        <rect x="500" y="600" width="100" height="100" fill={colorManaPool} />
        <rect x="0" y="100" width="100" height="100" fill={colorManaPool} />
        <rect x="1000" y="1100" width="100" height="100" fill={colorManaPool} />
        <rect x="1000" y="100" width="100" height="100" fill={colorManaPool} />
        <rect x="0" y="1100" width="100" height="100" fill={colorManaPool} />
        <rect x="0" y="600" width="100" height="100" fill={colorPickupItemSquare} />
        <rect x="1000" y="600" width="100" height="100" fill={colorPickupItemSquare} />
        <rect x="400" y="400" width="100" height="100" fill={colorSimpleManaSquare} />
        <rect x="600" y="400" width="100" height="100" fill={colorSimpleManaSquare} />
        <rect x="400" y="800" width="100" height="100" fill={colorSimpleManaSquare} />
        <rect x="600" y="800" width="100" height="100" fill={colorSimpleManaSquare} />
        <rect x="300" y="500" width="100" height="100" fill={colorSimpleManaSquare} />
        <rect x="500" y="500" width="100" height="100" fill={colorSimpleManaSquare} />
        <rect x="700" y="500" width="100" height="100" fill={colorSimpleManaSquare} />
        <rect x="300" y="700" width="100" height="100" fill={colorSimpleManaSquare} />
        <rect x="500" y="700" width="100" height="100" fill={colorSimpleManaSquare} />
        <rect x="700" y="700" width="100" height="100" fill={colorSimpleManaSquare} />
      </g>

      {!isGridVisible && <image href="assets/bg/Pangchiu.png" x="30" y="100" height="1100" />}
      <g id="monsboard" transform={isGridVisible ? standardBoardTransform : boardTransform}></g>
      <g id="highlightsLayer" transform={isGridVisible ? standardBoardTransform : boardTransform}></g>
      <g id="itemsLayer" transform={isGridVisible ? standardBoardTransform : boardTransform}></g>
      <g id="controlsLayer"></g>
    </svg>
  );
};

export default BoardComponent;
