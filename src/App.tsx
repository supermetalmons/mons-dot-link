import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import BoardComponent from "./BoardComponent";
import VoiceReactionSelect from "./VoiceReactionSelect";
import MainMenu from "./MainMenu";

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
      <MainMenu />
      <VoiceReactionSelect />
    </div>
  );
};

export default App;
