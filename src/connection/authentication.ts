import { useState, useEffect } from "react";
import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import { SiweMessage } from "siwe";
import { subscribeToAuthChanges, signIn, verifyEthAddress } from "./connection";
import { didGetPlayerEthAddress } from "../game/board";

export type AuthStatus = "loading" | "unauthenticated" | "authenticated";

export function useAuthStatus() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    subscribeToAuthChanges((uid) => {
      // TODO: handle further changes
      console.log('auth changed', uid);
    });

    // TODO: resolve an actual auth status
    const timer = setTimeout(() => {
      setAuthStatus("unauthenticated");
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { authStatus, setAuthStatus };
}

export const createAuthAdapter = (setAuthStatus: (status: AuthStatus) => void) =>
  createAuthenticationAdapter({
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
