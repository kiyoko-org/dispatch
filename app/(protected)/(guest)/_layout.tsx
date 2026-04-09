import { Stack } from 'expo-router';

export default function GuestLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="emergency/index" />
      <Stack.Screen name="hotlines/index" />
    </Stack>
  );
}
