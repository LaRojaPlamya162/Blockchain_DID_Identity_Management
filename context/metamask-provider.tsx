import { createContext, useContext, useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';

const MetaMaskContext = createContext<{
  account: string | null;
  provider: BrowserProvider | null;
  connect: () => Promise<void>;
  isConnected: boolean;
}>({
  account: null,
  provider: null,
  connect: async () => {},
  isConnected: false,
});

export function MetaMaskProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  useEffect(() => {
    // Kiểm tra MetaMask có được cài đặt không
    if (typeof window.ethereum !== 'undefined') {
      const provider = new BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }, []);

  const connect = async () => {
    if (!provider) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      // Yêu cầu kết nối ví
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);

      // Chuyển sang mạng Goerli nếu cần
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x5' }], // Goerli chainId
        });
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  return (
    <MetaMaskContext.Provider value={{ account, provider, connect, isConnected: !!account }}>
      {children}
    </MetaMaskContext.Provider>
  );
}

export const useMetaMask = () => useContext(MetaMaskContext);

// Sử dụng MetaMask
const { account, connect, isConnected } = useMetaMask();

// Sử dụng Besu
