import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ConnectButton, createAuthenticationAdapter, RainbowKitAuthenticationProvider, RainbowKitProvider, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";
import { SiweMessage } from "siwe";

import BoardComponent from "./game/BoardComponent";
import VoiceReactionSelect from "./ui/VoiceReactionSelect";
import MainMenu from "./ui/MainMenu";
import { config } from "./utils/wagmi";

import { verifyEthAddress } from "./connection/connection";

const queryClient = new QueryClient();

const App = () => {

  // TODO: correctly setup initial status based on previous login
  const [authStatus, setAuthStatus] = useState<"loading" | "unauthenticated" | "authenticated">("unauthenticated");

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    },

    createMessage: ({ nonce, address, chainId }) => {
      return new SiweMessage({
        domain: window.location.host,
        address,
        statement: "mons ftw", // TODO: add firebase user id in the message somehow
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });
    },

    getMessageBody: ({ message }) => {
      return message.prepareMessage();
    },

    verify: async ({ message, signature }) => {
      // TODO: pass message in an appropriate format
      // JSON.stringify({ message, signature })
      const res = await verifyEthAddress("hello", signature);
      if (res && res.ok === true) {
        setAuthStatus("authenticated");
        return true;
      } else {
        setAuthStatus("unauthenticated");
        return false;
      }
    },

    signOut: async () => {},
  });

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
