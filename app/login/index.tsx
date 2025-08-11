import { Card } from 'components/Card';
import { TextInput } from 'components/TextInput';
import { Button } from 'components/Button';
import { Alert, AppState, Text, View } from 'react-native';
import { Lock, Mail } from 'lucide-react-native';

import '../../global.css';
import { useRouter } from 'expo-router';

import { supabase } from 'lib/supabase';
import { useState } from 'react';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
	if (state === 'active') {
		supabase.auth.startAutoRefresh()
	} else {
		supabase.auth.stopAutoRefresh()
	}
})

export default function Login() {
	const router = useRouter()

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
			Alert.alert(error.message)
			setLoading(false);
			return
		}
		setLoading(false);
		Alert.alert(`Signed in successfully! Welcome back!`);
		router.push('/home');
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
						onPress={() => { router.push('/sign-up') }}
						className='underline'
					>Create one</Text></Text>
				</Card>
			</View>
		</>
	)
}
