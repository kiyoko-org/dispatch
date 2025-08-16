import { Card } from 'components/ui/Card';
import { TextInput } from 'components/ui/TextInput';
import { Button } from 'components/ui/Button';
import { Alert, AppState, Text, View } from 'react-native';
import { Lock, Mail } from 'lucide-react-native';

import { useRouter } from 'expo-router';

import { supabase } from 'lib/supabase';
import { useState } from 'react';
import { useURL } from 'expo-linking';

/** INFO: 
 * Tells Supabase Auth to continuously refresh the session automatically if
 * the app is in the foreground. When this is added, you will continue to receive
 * `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
 * if the user's session is terminated. This should only be registered once. 
**/
AppState.addEventListener('change', (state) => {
	if (state === 'active') {
		supabase.auth.startAutoRefresh()
	} else {
		supabase.auth.stopAutoRefresh()
	}
})

export default function Login() {
	const router = useRouter()

	const linking = useURL()

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	async function signInWithEmail() {
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});
		if (error) {
			console.error('Error signing in:', error);
			setLoading(false);
			return
		}
		setLoading(false);
		Alert.alert(`Signed in successfully! Welcome back!`);
		// INFO: So that we can't go back to sign up or the let's get started screen
		router.dismissAll()
		router.replace('/home');
	}

	return (
		<>
			<View className="items-center flex-1 justify-center">
				<Card>
					<Text className='font-bold text-2xl mb-6'>Dispatch</Text>

					<Text className='font-bold text-xl'>Sign In</Text>
					<Text className='opacity-70 mt-1'>Use your email/phone and password to continue</Text>

					<View className='mt-6 flex gap-4'>

						<TextInput icon={
							<Mail />
						}
							value={email}
							onChangeText={setEmail}
							label='Email/Phone'
							placeholder='you@example.com'
						/>

						<TextInput icon={
							<Lock />
						}
							value={password}
							onChangeText={setPassword}
							label='Password' placeholder='••••••'
							secureTextEntry={true} />

					</View>


					<Button
						className='mt-6'
						label="Sign in"
						loading={loading}
						onPress={() => {
							signInWithEmail()
						}}
					></Button>
					<Text className='opacity-70 mt-4 text-center'>Don't have an account? <Text
						onPress={() => { router.push('/auth/sign-up') }}
						className='underline'
					>Create one</Text></Text>
				</Card>
			</View>
		</>
	)
}
