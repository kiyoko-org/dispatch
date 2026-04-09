import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from 'lib/supabase';

const GUEST_NAME_KEY = 'dispatch_guest_name';

type GuestContextType = {
  guestName: string | null;
  isGuest: boolean;
  isLoadingGuest: boolean;
  setGuestName: (name: string) => Promise<void>;
  clearGuest: () => Promise<void>;
};

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [guestName, setGuestNameState] = useState<string | null>(null);
  const [isLoadingGuest, setIsLoadingGuest] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(GUEST_NAME_KEY)
      .then((name) => setGuestNameState(name))
      .finally(() => setIsLoadingGuest(false));
  }, []);

  // Auto-clear guest whenever a real Supabase session is established
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        AsyncStorage.removeItem(GUEST_NAME_KEY).catch(() => null);
        setGuestNameState(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function setGuestName(name: string) {
    await AsyncStorage.setItem(GUEST_NAME_KEY, name);
    setGuestNameState(name);
  }

  async function clearGuest() {
    await AsyncStorage.removeItem(GUEST_NAME_KEY);
    setGuestNameState(null);
  }

  return (
    <GuestContext.Provider
      value={{
        guestName,
        isGuest: !!guestName,
        isLoadingGuest,
        setGuestName,
        clearGuest,
      }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
}
