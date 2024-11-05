import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import { useCallback } from "react";
import ReactDOM from "react-dom/client";
import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ConnectButton, RainbowKitAuthenticationProvider, RainbowKitProvider, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";

import BoardComponent from "./ui/BoardComponent";
import MainMenu from "./ui/MainMenu";
import { config } from "./utils/wagmi";
import { useAuthStatus, createAuthAdapter } from "./connection/authentication";
import { signIn } from "./connection/connection";
import BottomControls from "./ui/BottomControls";
import { useBottomControlsActions } from "./ui/BottomControlsActions";
import { isMobile } from "./utils/misc";

const queryClient = new QueryClient();

const App = () => {
  const { authStatus, setAuthStatus } = useAuthStatus();
  const authenticationAdapter = createAuthAdapter(setAuthStatus);
  const bottomControlsActions = useBottomControlsActions();

  const handleConnectClick = useCallback(() => {
    signIn();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider adapter={authenticationAdapter} status={authStatus}>
          <RainbowKitProvider
            showRecentTransactions={true}
            modalSize="compact"
            theme={{
              lightMode: lightTheme(),
              darkMode: darkTheme(),
            }}>
            <div className="app-container">
              {/* use a custom ab renderer if we ever release these. the default one starts with a text loader and twitches on window resize.*/}
              {/* 
              <iframe
                className="background-iframe"
                src="https://live.artblocks.io/random/0x68c01cb4733a82a58d5e7bb31bddbff26a3a35d5/18?useCustomViewParams=true&showText=false&backgroundColor=000000&width=100vw&height=100vh"
                title="background"
              ></iframe> */}
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

let lastTouchStartTime = 0;
const MIN_TIME_BETWEEN_TOUCHSTARTS = 475; // 500 is reliable. 450 does not protect.

if (isMobile) {
  document.addEventListener(
    "touchstart",
    (e) => {
      const currentTime = e.timeStamp;
      if (currentTime - lastTouchStartTime < MIN_TIME_BETWEEN_TOUCHSTARTS) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        lastTouchStartTime = currentTime;
      }
    },
    { passive: false }
  );
}
