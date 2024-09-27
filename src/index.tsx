import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { createAuthenticationAdapter, RainbowKitAuthenticationProvider, RainbowKitProvider, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";
import { SiweMessage } from "siwe";

import App from "./App";
import { config } from "./wagmi";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const queryClient = new QueryClient();

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
    return true; // TODO: implement actual verify
    // const verifyRes = await fetch('/api/verify', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ message, signature }),
    // });

    // return Boolean(verifyRes.ok);
  },

  signOut: async () => {
    // TODO: implement actual logout
    // await fetch('/api/logout');
  },
});

// TODO: You'll need to resolve AUTHENTICATION_STATUS here
// https://www.rainbowkit.com/docs/custom-authentication

root.render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider
          adapter={authenticationAdapter}
          status={"authenticated"} // TODO: either 'loading' (during initial load), 'unauthenticated' or 'authenticated'
        >
          <RainbowKitProvider
            modalSize="compact"
            theme={{
              lightMode: lightTheme(),
              darkMode: darkTheme(),
            }}>
            <App />
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);