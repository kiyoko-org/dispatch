import React, { createContext, useContext, useEffect, useState } from 'react';
import { initDispatchClient, type DispatchClient } from '@kiyoko-org/dispatch-lib';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

interface DispatchContextType {
  client: DispatchClient | null;
  isInitialized: boolean;
  error: string | null;
}

const DispatchContext = createContext<DispatchContextType>({
  client: null,
  isInitialized: false,
  error: null,
});

interface DispatchProviderProps {
  children: React.ReactNode;
}

export function DispatchProvider({ children }: DispatchProviderProps) {
  const [client, setClient] = useState<DispatchClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDispatchClient = async () => {
      try {
        // Get the Supabase URL and key from environment variables
        const { SUPABASE_URL, SUPABASE_ANON_KEY } = (Constants.expoConfig?.extra ?? {}) as {
          SUPABASE_URL?: string;
          SUPABASE_ANON_KEY?: string;
        };

        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
          throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in Expo extra');
        }

        // Initialize the DispatchClient with the same configuration
        const dispatchClient = initDispatchClient({
          supabaseClientConfig: {
            url: SUPABASE_URL,
            anonymousKey: SUPABASE_ANON_KEY,
            storage: AsyncStorage,
            detectSessionInUrl: false,
          },
        });

        setClient(dispatchClient);
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize DispatchClient:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsInitialized(true);
      }
    };

    initializeDispatchClient();
  }, []);

  return (
    <DispatchContext.Provider value={{ client, isInitialized, error }}>
      {children}
    </DispatchContext.Provider>
  );
}

export function useDispatchClient() {
  const context = useContext(DispatchContext);
  if (!context) {
    throw new Error('useDispatchClient must be used within a DispatchProvider');
  }
  return context;
}