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
const MIN_TIME_BETWEEN_TOUCHSTARTS = 500; // have seen a tooltip with 495

export function preventTouchstartIfNeeded(event: TouchEvent | MouseEvent) {
  if (!isMobile) {
    return;
  }
  const currentTime = event.timeStamp;
  const shouldPrevent = currentTime - lastTouchStartTime < MIN_TIME_BETWEEN_TOUCHSTARTS;
  if (!shouldPrevent) {
    lastTouchStartTime = currentTime;
  } else {
    event.preventDefault();
    event.stopPropagation();
  }
}

if (isMobile) {
  document.addEventListener(
    "touchstart",
    (e) => {
      preventTouchstartIfNeeded(e);
    },
    { passive: false }
  );
}
