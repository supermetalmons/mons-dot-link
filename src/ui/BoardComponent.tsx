import React, { useEffect, useRef } from "react";
import { go } from "../game/gameController";

const BoardComponent: React.FC = () => {
  const initializationRef = useRef(false);

  useEffect(() => {
    if (!initializationRef.current) {
      go();
      initializationRef.current = true;
    }
  }, []);

  const colorGray = "#BEBEBE";
  const colorLightGray = "#E8E8E8";
  const colorBlue = "#030DF4";
  const colorDarkGray = "#4F4F4F";
  const colorLightBlue = "#88A8F8";

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="board-svg" viewBox="0 0 11 14.1" shapeRendering="crispEdges" overflow="visible">
      <defs>
        <pattern id="chessPattern" patternUnits="userSpaceOnUse" width="2" height="2">
          <rect width="1" height="1" fill={colorGray} />
          <rect x="1" y="1" width="1" height="1" fill={colorGray} />
        </pattern>
      </defs>
      <rect y="1" width="11" height="11" fill={colorLightGray} />
      <rect y="1" width="11" height="11" fill="url(#chessPattern)" />
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
