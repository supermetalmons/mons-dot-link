import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import React, { useState, useCallback } from "react";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ConnectButton, RainbowKitAuthenticationProvider, RainbowKitProvider, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";

import BoardComponent from "./game/BoardComponent";
import MainMenu from "./ui/MainMenu";
import { config } from "./utils/wagmi";
import { useAuthStatus, createAuthAdapter } from './connection/authentication';
import { signIn } from './connection/connection';
import BottomControls from "./ui/BottomControls";
import { useBottomControlsActions } from "./ui/BottomControlsActions";

const queryClient = new QueryClient();

const App = () => {
  const { authStatus, setAuthStatus } = useAuthStatus();
  const authenticationAdapter = createAuthAdapter(setAuthStatus);
  const [hasClickedConnect, setHasClickedConnect] = useState(false);
  const bottomControlsActions = useBottomControlsActions();

  const handleConnectClick = useCallback(() => {
    if (!hasClickedConnect) {
      signIn();
      setHasClickedConnect(true);
    }
  }, [hasClickedConnect]);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider adapter={authenticationAdapter} status={authStatus}>
          <RainbowKitProvider
            modalSize="compact"
            theme={{
              lightMode: lightTheme(),
              darkMode: darkTheme(),
            }}>
            <div className="app-container">
              <div className="connect-button-container" onClick={handleConnectClick}>
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
              <BottomControls actions={bottomControlsActions} />
            </div>
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
