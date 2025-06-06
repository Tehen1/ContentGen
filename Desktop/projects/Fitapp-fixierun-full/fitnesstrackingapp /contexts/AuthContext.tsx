import React, { createContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  connectWallet: () => Promise<void>;
  isWalletConnected: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: () => {},
  connectWallet: async () => {},
  isWalletConnected: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  
  useEffect(() => {
    // Simulate checking for existing session
    const checkSession = async () => {
      try {
        // Mock authentication check
        const hasSession = true;
        
        if (hasSession) {
          // Mock user data
          setUser({
            id: '1',
            name: 'Alex Johnson',
            email: 'alex@example.com',
            walletAddress: '0x1234...5678',
          });
          setIsWalletConnected(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);
  
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Mock authentication
      setUser({
        id: '1',
        name: 'Alex Johnson',
        email: email,
        walletAddress: '0x1234...5678',
      });
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = () => {
    setUser(null);
    setIsWalletConnected(false);
  };
  
  const connectWallet = async () => {
    try {
      // Mock wallet connection
      setIsWalletConnected(true);
      
      if (user) {
        setUser({
          ...user,
          walletAddress: '0x1234...5678',
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        signIn, 
        signOut, 
        connectWallet, 
        isWalletConnected 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};