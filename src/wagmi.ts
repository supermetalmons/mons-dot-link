import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  base,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'mons',
  projectId: 'YOUR_PROJECT_ID', // TODO: setup
  chains: [
    base,
  ],
});