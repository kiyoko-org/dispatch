import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export function useFCMToken() {
  useEffect(() => {
    registerForFCMToken();
  }, []);
}

async function registerForFCMToken() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[FCM] Permission denied');
      return;
    }
		console.log("GotHERER")

    const devicePushToken = await Notifications.getDevicePushTokenAsync();
    console.log('[FCM] Device Token:', devicePushToken.data);
    console.log('[FCM] Platform:', devicePushToken.type);

    Notifications.addPushTokenListener((token) => {
      console.log('[FCM] Token refreshed:', token.data);
    });
  } catch (error) {
    console.error('[FCM] Error getting token:', error);
  }
}
