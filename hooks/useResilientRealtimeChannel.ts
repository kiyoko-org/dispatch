import NetInfo from '@react-native-community/netinfo';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

const RETRY_DELAYS_MS = [1000, 2000, 5000, 10000, 30000] as const;
const RECOVERABLE_STATUSES = new Set(['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED']);

type ResilientChannelOptions = {
  channelName: string;
  enabled: boolean;
  createChannel: () => RealtimeChannel;
  beforeSubscribe?: () => Promise<void> | void;
  onSubscribed?: () => Promise<void> | void;
  onDisconnected?: (status: string) => void;
  onReconnect?: () => Promise<void> | void;
};

type ResilientChannelResult = {
  isConnected: boolean;
  reconnect: () => Promise<void>;
  status: string | null;
};

export function useResilientRealtimeChannel({
  channelName,
  enabled,
  createChannel,
  beforeSubscribe,
  onSubscribed,
  onDisconnected,
  onReconnect,
}: ResilientChannelOptions): ResilientChannelResult {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryIndexRef = useRef(0);
  const hasSubscribedOnceRef = useRef(false);
  const isConnectedRef = useRef(false);
  const currentStatusRef = useRef<string | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const networkConnectedRef = useRef<boolean | null>(null);
  const enabledRef = useRef(enabled);
  const reconnectRef = useRef<() => Promise<void>>(async () => {});

  const clearReconnectTimer = useCallback(() => {
    if (!reconnectTimerRef.current) return;
    clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;
  }, []);

  const destroyChannel = useCallback(async () => {
    const currentChannel = channelRef.current;
    if (!currentChannel) return;

    channelRef.current = null;

    try {
      await currentChannel.unsubscribe();
    } catch (error) {
      console.warn(`[${channelName}] Failed to unsubscribe realtime channel`, error);
    }
  }, [channelName]);

  const scheduleReconnect = useCallback(() => {
    if (!enabledRef.current) return;
    if (reconnectTimerRef.current) return;

    const retryDelay = RETRY_DELAYS_MS[Math.min(retryIndexRef.current, RETRY_DELAYS_MS.length - 1)];
    retryIndexRef.current = Math.min(retryIndexRef.current + 1, RETRY_DELAYS_MS.length - 1);

    console.log(`[${channelName}] Realtime reconnect scheduled in ${retryDelay}ms`);

    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      void reconnectRef.current();
    }, retryDelay);
  }, [channelName]);

  const createAndSubscribe = useCallback(async () => {
    if (!enabledRef.current) return;

    await destroyChannel();

    try {
      await beforeSubscribe?.();

      const nextChannel = createChannel();
      channelRef.current = nextChannel;

      nextChannel.subscribe((nextStatus) => {
        if (channelRef.current !== nextChannel) return;

        console.log(`[${channelName}] Realtime subscription status: ${nextStatus}`);

        currentStatusRef.current = nextStatus;
        setStatus(nextStatus);

        const nextIsConnected = nextStatus === 'SUBSCRIBED';
        isConnectedRef.current = nextIsConnected;
        setIsConnected(nextIsConnected);

        if (nextStatus === 'SUBSCRIBED') {
          const isReconnect = hasSubscribedOnceRef.current;

          hasSubscribedOnceRef.current = true;
          retryIndexRef.current = 0;
          clearReconnectTimer();

          void onSubscribed?.();

          if (isReconnect) {
            void onReconnect?.();
          }

          return;
        }

        if (!RECOVERABLE_STATUSES.has(nextStatus)) return;

        console.warn(`[${channelName}] Realtime disconnected: ${nextStatus}`);
        void onDisconnected?.(nextStatus);
        scheduleReconnect();
      });
    } catch (error) {
      console.warn(`[${channelName}] Failed to create realtime channel`, error);
      scheduleReconnect();
    }
  }, [
    beforeSubscribe,
    channelName,
    clearReconnectTimer,
    createChannel,
    destroyChannel,
    onDisconnected,
    onReconnect,
    onSubscribed,
    scheduleReconnect,
  ]);

  const reconnect = useCallback(async () => {
    if (!enabledRef.current) return;
    console.log(`[${channelName}] Reconnecting realtime channel`);
    clearReconnectTimer();
    await createAndSubscribe();
  }, [channelName, clearReconnectTimer, createAndSubscribe]);

  reconnectRef.current = reconnect;

  const handleRecovery = useCallback(async () => {
    if (!enabledRef.current) return;

    if (isConnectedRef.current && currentStatusRef.current === 'SUBSCRIBED') {
      await onReconnect?.();
      return;
    }

    await reconnect();
  }, [onReconnect, reconnect]);

  useEffect(() => {
    enabledRef.current = enabled;

    if (!enabled) {
      clearReconnectTimer();
      retryIndexRef.current = 0;
      hasSubscribedOnceRef.current = false;
      isConnectedRef.current = false;
      currentStatusRef.current = null;
      setIsConnected(false);
      setStatus(null);
      void destroyChannel();
      return;
    }

    void createAndSubscribe();

    return () => {
      clearReconnectTimer();
      void destroyChannel();
    };
  }, [clearReconnectTimer, createAndSubscribe, destroyChannel, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      const wasActive = appStateRef.current === 'active';
      const isActive = nextAppState === 'active';
      appStateRef.current = nextAppState;

      if (!wasActive && isActive) {
        void handleRecovery();
      }
    });

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const nextIsConnected = Boolean(state.isConnected);
      const previousIsConnected = networkConnectedRef.current;
      networkConnectedRef.current = nextIsConnected;

      if (previousIsConnected === false && nextIsConnected) {
        void handleRecovery();
      }
    });

    return () => {
      appStateSubscription.remove();
      unsubscribeNetInfo();
    };
  }, [enabled, handleRecovery]);

  return {
    isConnected,
    reconnect,
    status,
  };
}
