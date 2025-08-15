import { AuthProvider } from 'components/AuthProvider';
import { Stack } from 'expo-router';

import '../global.css';

export default function RootLayout() {
	return (
		<AuthProvider>
			<Stack screenOptions={{ headerShown: false, animation: "none" }}>
				<Stack.Screen name='(protected)' />
			</Stack>
		</AuthProvider>
	)
}
