import React, { useEffect, useRef } from 'react';
import { go } from "./game-controller";

const BoardComponent: React.FC = () => {
  const initializationRef = useRef(false);

  useEffect(() => {
    if (!initializationRef.current) {
      go();
      initializationRef.current = true;
    }
  }, []);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="board-svg" viewBox="0 0 11 13.1" shapeRendering="crispEdges" overflow="visible">
      <defs>
        <pattern id="chessPattern" patternUnits="userSpaceOnUse" width="2" height="2">
          <rect width="1" height="1" fill="#BEBEBE"/>
          <rect x="1" y="1" width="1" height="1" fill="#BEBEBE"/>
        </pattern>
      </defs>
      <rect y="1" width="11" height="11" fill="#E8E8E8"/>
      <rect y="1" width="11" height="11" fill="url(#chessPattern)"/>
      <rect x="5" y="6" width="1" height="1" fill="#030DF4"/>
      <rect x="0" y="1" width="1" height="1" fill="#030DF4"/>
      <rect x="10" y="11" width="1" height="1" fill="#030DF4"/>
      <rect x="10" y="1" width="1" height="1" fill="#030DF4"/>
      <rect x="0" y="11" width="1" height="1" fill="#030DF4"/>
      <rect x="0" y="6" width="1" height="1" fill="#4F4F4F"/>
      <rect x="10" y="6" width="1" height="1" fill="#4F4F4F"/>
      <rect x="4" y="4" width="1" height="1" fill="#88A8F8"/>
      <rect x="6" y="4" width="1" height="1" fill="#88A8F8"/>
      <rect x="4" y="8" width="1" height="1" fill="#88A8F8"/>
      <rect x="6" y="8" width="1" height="1" fill="#88A8F8"/>
      <rect x="3" y="5" width="1" height="1" fill="#88A8F8"/>
      <rect x="5" y="5" width="1" height="1" fill="#88A8F8"/>
      <rect x="7" y="5" width="1" height="1" fill="#88A8F8"/>
      <rect x="3" y="7" width="1" height="1" fill="#88A8F8"/>
      <rect x="5" y="7" width="1" height="1" fill="#88A8F8"/>
      <rect x="7" y="7" width="1" height="1" fill="#88A8F8"/>
      <g id="monsboard"></g>
      <g id="highlightsLayer"></g>
      <g id="itemsLayer"></g>
      <g id="controlsLayer"></g>
    </svg>
  );
};

export default BoardComponent;