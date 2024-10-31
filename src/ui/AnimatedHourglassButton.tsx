// AnimatedHourglassButton.tsx

import React, { useState, useEffect } from "react";
import { ControlButton } from "./BottomControls";

interface AnimatedHourglassIconProps {
  duration: number;
}

const AnimatedHourglassIcon: React.FC<AnimatedHourglassIconProps> = ({ duration }) => {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ display: "block" }}>
      {/* Hourglass outline */}
      <path
        d="
          M16,8 H48
          M16,56 H48
          M16,8 L16,20 L32,32 L16,44 L16,56
          M48,8 L48,20 L32,32 L48,44 L48,56
        "
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      {/* Sand in top bulb */}
      <path d="M16,8 L48,8 L32,32 Z" fill="currentColor" mask="url(#top-sand-mask)" />
      {/* Mask for top bulb sand */}
      <mask id="top-sand-mask">
        {/* Start with sand visible, cover with black rectangle moving down */}
        <rect x="0" y="0" width="64" height="64" fill="white" />
        <rect x="0" y="8" width="64" height="0" fill="black">
          <animate attributeName="height" from="0" to="24" dur={`${duration}s`} fill="freeze" />
        </rect>
      </mask>
      {/* Sand in bottom bulb */}
      <path d="M16,56 L48,56 L32,32 Z" fill="currentColor" mask="url(#bottom-sand-mask)" />
      {/* Mask for bottom bulb sand */}
      <mask id="bottom-sand-mask">
        {/* Start with sand hidden, reveal with white rectangle moving up */}
        <rect x="0" y="0" width="64" height="64" fill="black" />
        <rect x="0" y="56" width="64" height="0" fill="white">
          <animate attributeName="y" from="56" to="32" dur={`${duration}s`} fill="freeze" />
          <animate attributeName="height" from="0" to="24" dur={`${duration}s`} fill="freeze" />
        </rect>
      </mask>
    </svg>
  );
};

interface AnimatedHourglassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  duration?: number;
}

const AnimatedHourglassButton: React.FC<AnimatedHourglassButtonProps> = ({ duration = 5, onClick, ...props }) => {
  const [animationKey, setAnimationKey] = useState<number>(0);

  useEffect(() => {
    setAnimationKey((prevKey) => prevKey + 1);
  }, [duration]);

  return (
    <ControlButton onClick={onClick} aria-label="Timer" {...props}>
      <AnimatedHourglassIcon duration={duration} key={animationKey} />
    </ControlButton>
  );
};

export default AnimatedHourglassButton;
