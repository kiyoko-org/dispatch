import { Redirect, Stack } from "expo-router";
import { useAuth } from "hooks/useAuth";

export function ProtectedLayout() {
	const auth = useAuth()

	if (auth.session === null) {
		return <Redirect href={'/auth/login'} />
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="home" />
		</Stack>
	)
}
