import * as React from 'react';
import { useMemo } from 'react';
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

const SolanaWalletProvider = ({
    children
}) => {
    const supportedWallets = useMemo(() => {
        return [new PhantomWalletAdapter()];
      }, []);
      const endPoint = useMemo(() => {
        return clusterApiUrl('devnet');
      }, []);

      const handleError = React.useCallback((error, adapter) => {
        console.log(error, adapter, 'inside WalletProvider');
      }, []);
    return (
        <ConnectionProvider endpoint={ endPoint }>
        <WalletProvider wallets={ supportedWallets } autoConnect onError={ handleError }>
          { children }
        </WalletProvider>
      </ConnectionProvider>
    )
};

export default SolanaWalletProvider;