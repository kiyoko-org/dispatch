import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useAuthContext } from 'components/AuthProvider';
import { useResilientRealtimeChannel } from 'hooks/useResilientRealtimeChannel';
import { supabase } from 'lib/supabase';
import type { ProfileRow } from 'lib/types/db';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type CurrentProfileContextValue = {
  profile: ProfileRow | null;
  loading: boolean;
  error: string | null;
  isRealtimeConnected: boolean;
  refresh: () => Promise<void>;
};

const CurrentProfileContext = createContext<CurrentProfileContextValue | undefined>(undefined);

export function CurrentProfileProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuthContext();
  const userId = session?.user?.id ?? null;

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileRef = useRef<ProfileRow | null>(null);

  const applyProfile = useCallback((nextProfile: ProfileRow | null) => {
    profileRef.current = nextProfile;
    setProfile(nextProfile);
  }, []);

  const refreshProfile = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!userId) {
        applyProfile(null);
        setError(null);
        setLoading(false);
        return;
      }

      const shouldShowLoading = !silent || profileRef.current === null;

      if (shouldShowLoading) {
        setLoading(true);
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        applyProfile(data ?? null);
        setError(null);
      } catch (refreshError) {
        setError(refreshError instanceof Error ? refreshError.message : 'Failed to load profile');
      } finally {
        if (shouldShowLoading) {
          setLoading(false);
        }
      }
    },
    [applyProfile, userId]
  );

  const refresh = useCallback(async () => {
    await refreshProfile();
  }, [refreshProfile]);

  const createChannel = useCallback(() => {
    if (!userId) {
      throw new Error('Cannot subscribe to profile updates without an active user');
    }

    return supabase.channel(`current-profile-${userId}`).on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload: RealtimePostgresChangesPayload<ProfileRow>) => {
        applyProfile(payload.new as ProfileRow);
        setError(null);
      }
    );
  }, [applyProfile, userId]);

  const { isConnected: isRealtimeConnected } = useResilientRealtimeChannel({
    channelName: 'current-profile',
    enabled: Boolean(userId),
    createChannel,
    onReconnect: useCallback(async () => {
      await refreshProfile({ silent: true });
    }, [refreshProfile]),
  });

  useEffect(() => {
    if (!userId) {
      applyProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    void refreshProfile();
  }, [applyProfile, refreshProfile, userId]);

  const value = useMemo<CurrentProfileContextValue>(
    () => ({
      profile,
      loading,
      error,
      isRealtimeConnected,
      refresh,
    }),
    [error, isRealtimeConnected, loading, profile, refresh]
  );

  return <CurrentProfileContext.Provider value={value}>{children}</CurrentProfileContext.Provider>;
}

export function useCurrentProfile() {
  const context = useContext(CurrentProfileContext);

  if (!context) {
    throw new Error('useCurrentProfile must be used within a CurrentProfileProvider');
  }

  return context;
}
