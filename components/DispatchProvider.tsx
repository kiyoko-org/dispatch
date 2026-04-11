import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { initDispatchClient, type DispatchClient } from '@kiyoko-org/dispatch-lib';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import type { Database } from '@kiyoko-org/dispatch-lib/database.types';
import { supabase } from 'lib/supabase';

type Category = Database["public"]["Tables"]["categories"]["Row"];

interface DispatchContextType {
  client: DispatchClient | null;
  isInitialized: boolean;
  error: string | null;
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  refreshCategories: () => Promise<void>;
}

const DispatchContext = createContext<DispatchContextType>({
  client: null,
  isInitialized: false,
  error: null,
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  refreshCategories: async () => {},
});

interface DispatchProviderProps {
  children: React.ReactNode;
}

export function DispatchProvider({ children }: DispatchProviderProps) {
  const [client, setClient] = useState<DispatchClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const clearRetryTimer = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Function to fetch categories
  const fetchCategories = useCallback(async (options?: { resetRetry?: boolean }) => {
    if (!client) return;

    if (options?.resetRetry) {
      retryCountRef.current = 0;
      clearRetryTimer();
    }

    setCategoriesLoading(true);
    setCategoriesError(null);

    try {
      const { data, error: fetchError } = await client.getCategories();

      if (fetchError) {
        console.error('Error fetching categories:', fetchError);
        setCategoriesError(fetchError.message || 'Failed to fetch categories');
        if (retryCountRef.current < 3) {
          const attempt = retryCountRef.current + 1;
          retryCountRef.current = attempt;
          const delay = Math.min(2000 * attempt, 6000);
          clearRetryTimer();
          retryTimeoutRef.current = setTimeout(() => {
            void fetchCategories();
          }, delay);
        }
        return;
      }

      if (data) {
        setCategories(data);
      }
      retryCountRef.current = 0;
      clearRetryTimer();
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
      setCategoriesError(err instanceof Error ? err.message : 'Unknown error');
      if (retryCountRef.current < 3) {
        const attempt = retryCountRef.current + 1;
        retryCountRef.current = attempt;
        const delay = Math.min(2000 * attempt, 6000);
        clearRetryTimer();
        retryTimeoutRef.current = setTimeout(() => {
          void fetchCategories();
        }, delay);
      }
    } finally {
      setCategoriesLoading(false);
    }
  }, [clearRetryTimer, client]);

  // Initialize DispatchClient and fetch categories
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

  // Fetch categories when client is initialized
  useEffect(() => {
    if (isInitialized && client && categories.length === 0 && !categoriesLoading && !categoriesError) {
      void fetchCategories({ resetRetry: true });
    }
  }, [categories.length, categoriesError, categoriesLoading, client, fetchCategories, isInitialized]);

  // Listen for auth state changes and refetch categories on login
  useEffect(() => {
    if (!client) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        void fetchCategories({ resetRetry: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, fetchCategories]);

  useEffect(() => {
    return () => {
      clearRetryTimer();
    };
  }, [clearRetryTimer]);

  return (
    <DispatchContext.Provider value={{ 
      client, 
      isInitialized, 
      error, 
      categories, 
      categoriesLoading, 
      categoriesError, 
      refreshCategories: async () => fetchCategories({ resetRetry: true })
    }}>
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
