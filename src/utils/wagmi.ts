import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, mainnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "mons",
  projectId: "6af0ccf76de096639d08ed8aeb3d69af",
  chains: [mainnet, base],
});
