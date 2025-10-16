import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // Function to fetch categories
  const fetchCategories = async () => {
    if (!client) return;
    
    setCategoriesLoading(true);
    setCategoriesError(null);
    
    try {
      const { data, error: fetchError } = await client.getCategories();
      
      if (fetchError) {
        console.error('Error fetching categories:', fetchError);
        setCategoriesError(fetchError.message || 'Failed to fetch categories');
        return;
      }
      
      if (data) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
      setCategoriesError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCategoriesLoading(false);
    }
  };

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
    if (isInitialized && client && categories.length === 0) {
      fetchCategories();
    }
  }, [isInitialized, client, categories.length]);

  // Listen for auth state changes and refetch categories on login
  useEffect(() => {
    if (!client) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Refetch categories when user signs in
      if (event === 'SIGNED_IN' && session) {
        console.log('Auth state changed to SIGNED_IN, refetching categories');
        fetchCategories();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  return (
    <DispatchContext.Provider value={{ 
      client, 
      isInitialized, 
      error, 
      categories, 
      categoriesLoading, 
      categoriesError, 
      refreshCategories: fetchCategories 
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