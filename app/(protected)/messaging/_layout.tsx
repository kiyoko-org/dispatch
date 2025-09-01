import { Stack } from 'expo-router';

export default function MessagingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="new-message" />
    </Stack>
  );
}
