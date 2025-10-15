import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from 'lib/supabase';
import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { useRouter } from 'expo-router';

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isLoggingOut: boolean;
};

type AuthContextType = AuthState & {
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isLoggingOut: false,
  });

  const router = useRouter();

  useEffect(() => {
    if (authState.session) {
      router.replace('/(protected)/home');
    }
  }, [authState.session]);

  useEffect(() => {
    let isComponentMounted = true;

    const initializeAuth = async () => {
      try {
        // Handle deep linking first
        await handleDeepLink();

        // Then get the current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isComponentMounted) {
          setAuthState({
            user: session?.user ?? null,
            session,
            isLoading: false,
            isLoggingOut: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isComponentMounted) {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isLoggingOut: false,
          });
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.id);
      if (isComponentMounted) {
        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isLoggingOut: false,
        });
      }
    });

    // Handle deep linking for subsequent app opens
    const handleUrl = ({ url }: { url: string }) => {
      if (url && isComponentMounted) {
        handleDeepLink(url);
      }
    };

    const linkingSubscription = Linking.addEventListener('url', handleUrl);

    // Cleanup function
    return () => {
      isComponentMounted = false;
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  const handleDeepLink = async (url?: string) => {
    try {
      // Get the URL - either from parameter or current linking URL
      const linkingUrl = url || (await Linking.getInitialURL());

      if (!linkingUrl) {
        console.log('No linking URL found');
        return;
      }

      console.log('Processing deep link:', linkingUrl);

      // Parse query parameters from the URL
      const { params, errorCode } = QueryParams.getQueryParams(linkingUrl);

      if (errorCode) {
        console.error('Failed to get params:', errorCode);
        return;
      }

      const { access_token, refresh_token } = params;

      // Only process if we have both tokens
      if (access_token && refresh_token) {
        console.log('Setting session from deep link tokens');

        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error('Failed to set session:', error.message);
          return;
        }

        console.log('Successfully set session from deep link');
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  };

  const signOut = async () => {
    try {
      // Set loading state
      setAuthState(prev => ({ ...prev, isLoggingOut: true }));
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Logout timeout')), 10000); // 10 second timeout
      });
      
      // Race between logout and timeout
      await Promise.race([
        supabase.auth.signOut(),
        timeoutPromise
      ]);
      
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Reset loading state on error
      setAuthState(prev => ({ ...prev, isLoggingOut: false }));
    }
  };

  // TODO: put sign in here
  const singIn = async () => {};

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
