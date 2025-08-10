import { Card } from 'components/Card';
import { TextInput } from 'components/TextInput';
import { Button } from 'components/Button';
import { Text, View } from 'react-native';
import { Lock, Mail } from 'lucide-react-native';

import '../../global.css';
import { useRouter } from 'expo-router';

export default function Login() {
	const router = useRouter()

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
						} label='Email/Phone' placeholder='you@example.com' />

						<TextInput icon={
							<Lock />
						} label='Password' placeholder='••••••' secureTextEntry={true} />

					</View>

					<Button
						className='mt-6' label="Sign in"></Button>

					<Text className='opacity-70 mt-4 text-center'>Don't have an account? <Text
						onPress={() => { router.push('/sign-up') }}
						className='underline'
					>Create one</Text></Text>
				</Card>
			</View>
		</>
	)
}
