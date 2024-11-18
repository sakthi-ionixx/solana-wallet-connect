import * as React from 'react';
import { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import './App.css';

function App() {
  const solanaWalletRef = React.useRef(null);
  const {
    wallets,
    select: solanaWalletConnect,
    publicKey: connectedSolanaAddress,
    disconnect: disconnectSolanaWallet,
    connected: solanaWalletConnected,
    signMessage,
    wallet: solanaWallet,
  } = useWallet();

  const [walletAddress, setWalletAddress] = React.useState('');

  React.useEffect(() => {
    solanaWallet?.adapter?.addListener('error', (err) => {
      console.log(err, 'error inside Adapter');
      if (!connectedSolanaAddress) {
        console.log('have no active account');
      } else {
        console.log('Something went wrong. please try again.');
      }
    });
    solanaWallet?.adapter?.addListener('connect', (key) => {
      console.log(key.toString(), 'Public Key');
    });
    solanaWallet?.adapter?.addListener('disconnect', () => {
      console.log('Disconnected Successfully');
    });
    solanaWallet?.adapter?.addListener('readyStateChange', (state) => {
      console.log('New State', state);
    });
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      solanaWallet?.adapter?.removeListener('error', (err) => {
        console.log(err, 'error inside Listener');
      });
      solanaWallet?.adapter?.addListener('connect', (key) => {
        console.log(key.toString(), 'Public Key');
      });
      solanaWallet?.adapter?.addListener('disconnect', () => {
        console.log('Disconnected Successfully');
      });
      solanaWallet?.adapter?.addListener('readyStateChange', (state) => {
        console.log('New State', state);
      });
    };
  }, [setWalletAddress, connectedSolanaAddress, solanaWallet?.adapter]);


  React.useEffect(() => {
    const walletDetail = JSON.parse(window.sessionStorage.getItem('WalletDetail') ?? '{}');
    if (walletDetail?.walletAddress) {
      setWalletAddress(walletDetail?.walletAddress);
    }
  }, [setWalletAddress]);

  const onDisconnect = useCallback(async () => {
    window.sessionStorage.removeItem('WalletDetail');
    await disconnectSolanaWallet?.();
  }, [disconnectSolanaWallet]);
  const onClickPhantomWallet = useCallback(async () => {
    try {
      const isPhantomInstalled = wallets?.filter(
        item => item.readyState === 'Installed' &&
          item.adapter.name?.toLowerCase()?.includes('phantom'),
      );
      if (
        (isPhantomInstalled?.length ?? 0) > 0 &&
        isPhantomInstalled?.[0]?.adapter?.name
      ) {
        if (solanaWalletConnected) {
          await disconnectSolanaWallet?.();   
        }
        solanaWalletConnect?.(isPhantomInstalled?.[0]?.adapter.name);
        solanaWalletRef.current = true;
      } else {
        console.log('Phantom is not installed in your browser');
      }
    } catch (err) {
      console.log(err, 'error');
    }
  }, [solanaWalletConnect, disconnectSolanaWallet, solanaWalletConnected, wallets]);

  const onConnectSolanaWallets = useCallback(async () => {
    try {
      if (connectedSolanaAddress?.toString()) {
        solanaWalletRef.current = false;
        const encodedMessage = new TextEncoder().encode('Test Message');
        await signMessage(encodedMessage);
        setWalletAddress(connectedSolanaAddress?.toString());
        window.sessionStorage.setItem('WalletDetail', JSON.stringify({ walletAddress: connectedSolanaAddress?.toString() }));
      }
    } catch (err) {
      console.log('inside solana wallets error', err);
    }
  }, [connectedSolanaAddress, setWalletAddress, signMessage]);

  React.useEffect(() => {
    if (
      connectedSolanaAddress?.toString() &&
      solanaWalletConnected &&
      solanaWalletRef.current) {
      onConnectSolanaWallets();
    }
  }, [
    connectedSolanaAddress,
    onConnectSolanaWallets,
    solanaWalletConnected,
  ]);
  return (
    <div className="App">
      {
        walletAddress ? <div>
          <p>Connected Address: { connectedSolanaAddress?.toString() }</p>
          <button type='button' onClick={ onDisconnect }>Disconnect Wallet</button>
        </div> : <button type='button' onClick={ onClickPhantomWallet }>Connect Wallet</button>
      }
    </div>
  );
}

export default App;
