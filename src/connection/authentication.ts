import { useState, useEffect } from "react";
import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import { SiweMessage } from "siwe";
import { subscribeToAuthChanges, signIn, verifyEthAddress } from "./connection";
import { didGetPlayerEthAddress } from "../game/board";

export type AuthStatus = "loading" | "unauthenticated" | "authenticated";

export function useAuthStatus() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let didPerformInitialSetup = false;
    subscribeToAuthChanges((uid) => {
      if (didPerformInitialSetup) { return; }
      didPerformInitialSetup = true;
      if (uid !== null) {
        const storedAddress = getStoredEthAddress(uid);
        if (storedAddress) {
          didGetPlayerEthAddress(storedAddress);
          setAuthStatus("authenticated");
        } else {
          setAuthStatus("unauthenticated");
        }
      } else {
        setAuthStatus("unauthenticated");
      }
    });
  }, []);

  return { authStatus, setAuthStatus };
}
export const createAuthAdapter = (setAuthStatus: (status: AuthStatus) => void) =>
  createAuthenticationAdapter({
    getNonce: async () => {
      return await signIn();
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
        saveEthAddress(res.uid, res.address);
        setAuthStatus("authenticated");
        return true;
      } else {
        setAuthStatus("unauthenticated");
        return false;
      }
    },

    signOut: async () => {},
  });

export const saveEthAddress = (uid: string, address: string): void => {
  localStorage.setItem(`ethAddress_${uid}`, address);
};

export const getStoredEthAddress = (uid: string): string | null => {
  return localStorage.getItem(`ethAddress_${uid}`);
};