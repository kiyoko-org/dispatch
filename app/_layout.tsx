import { AuthProvider } from 'components/AuthProvider';
import { ThemeProvider } from 'components/ThemeContext';
import { DispatchProvider } from 'components/DispatchProvider';
import { UserDataProvider } from 'contexts/UserDataContext';
import { Stack } from 'expo-router';

import '../global.css';

export default function RootLayout() {
	return (
		<ThemeProvider>
			<DispatchProvider>
				<AuthProvider>
					<UserDataProvider>
						<Stack screenOptions={{ headerShown: false, animation: "none" }}>
							<Stack.Screen name='(protected)' />
						</Stack>
					</UserDataProvider>
				</AuthProvider>
			</DispatchProvider>
		</ThemeProvider>
	)
}
