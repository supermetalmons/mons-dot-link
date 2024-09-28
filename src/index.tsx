import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ConnectButton, createAuthenticationAdapter, RainbowKitAuthenticationProvider, RainbowKitProvider, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";
import { SiweMessage } from "siwe";
import { signIn } from "./connection/connection";
import { didGetPlayerEthAddress } from "./game/board";

import BoardComponent from "./game/BoardComponent";
import VoiceReactionSelect from "./ui/VoiceReactionSelect";
import MainMenu from "./ui/MainMenu";
import { config } from "./utils/wagmi";

import { verifyEthAddress } from "./connection/connection";

const queryClient = new QueryClient();

const App = () => {

  // TODO: start with loading and resolve it. authenticated == there is 
  const [authStatus, setAuthStatus] = useState<"loading" | "unauthenticated" | "authenticated">("unauthenticated");

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      return await signIn(); // TODO: call it earlier. once the "connect wallet" button is clicked? or when resolving authStatus?
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
      const res = await verifyEthAddress(message.toMessage(), signature);
      if (res && res.ok === true) {
        didGetPlayerEthAddress(res.address);
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
