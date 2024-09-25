import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import BoardComponent from "./BoardComponent";
import { logoBase64 } from "./helpers/logo";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <div className="connect-button-container">
        <ConnectButton
          showBalance={false}
          chainStatus="none"
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
        />
      </div>
      <BoardComponent />

      <a
        className="rock-link"
        href="https://opensea.io/collection/super-metal-mons-gen-2"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "absolute",
          top: "9pt",
          left: "9pt",
          display: "",
        }}>
        <img src={logoBase64}
        style={{ width: "1.8rem", height: "1.8rem", opacity: 1 }} alt="Rock" />
      </a>

      <select
        className="voice-reaction-select"
        style={{
          position: "absolute",
          bottom: "10pt",
          right: "9pt",
          outline: "none",
          display: "none",
          fontSize: "1.23rem",
          opacity: 0.81,
        }}>
        <option value="" disabled selected>
          say
        </option>
        <option value="yo">yo</option>
        <option value="wahoo">wahoo</option>
        <option value="drop">drop</option>
        <option value="slurp">slurp</option>
        <option value="gg">gg</option>
      </select>
    </div>
  );
};

export default App;
