import '../global.css';
import { Stack } from 'expo-router';
import { AuthProvider } from 'components/AuthProvider';

export default function RootLayout() {
	return (
		<AuthProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" />
				<Stack.Screen name="home" />
			</Stack>
		</AuthProvider>
	)
}
