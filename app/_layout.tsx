import { AuthProvider } from 'components/AuthProvider';
import { ThemeProvider } from 'components/ThemeContext';
import { Stack } from 'expo-router';

import '../global.css';

export default function RootLayout() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<Stack screenOptions={{ headerShown: false, animation: "none" }}>
					<Stack.Screen name='(protected)' />
				</Stack>
			</AuthProvider>
		</ThemeProvider>
	)
}
