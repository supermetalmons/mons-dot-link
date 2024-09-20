import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import BoardComponent from './BoardComponent';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <div className="connect-button-container">
        <ConnectButton />
      </div>
      <BoardComponent />
    </div>
  );
};

export default App;