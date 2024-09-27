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

const queryClient = new QueryClient();

const App = () => {

  // TODO: correctly setup initial status based on previous login
  const [authStatus, setAuthStatus] = useState<"loading" | "unauthenticated" | "authenticated">("unauthenticated");

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      // TODO: get nonce from firebase?
    },

    createMessage: ({ nonce, address, chainId }) => {
      return new SiweMessage({
        domain: window.location.host,
        address,
        statement: "mons ftw",
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
      // TODO: implement actual verify
      // const verifyRes = await fetch('/api/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message, signature }),
      // });
      // const isVerified = Boolean(verifyRes.ok);

      const isVerified = true; // Simulating successful verification
      if (isVerified) {
        setAuthStatus("authenticated");
      }
      return isVerified;
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
