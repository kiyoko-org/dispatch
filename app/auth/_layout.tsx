import { Stack } from 'expo-router';

export default function RootLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="sign-up" />
			<Stack.Screen name="login" />
		</Stack>
	)
}
