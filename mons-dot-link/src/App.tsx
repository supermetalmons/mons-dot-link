import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Board from './Board';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <div className="connect-button-container">
        <ConnectButton />
      </div>
      <Board />
    </div>
  );
};

export default App;