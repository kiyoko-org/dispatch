import { ScreenContent } from 'components/ScreenContent';
import { StatusBar } from 'expo-status-bar';

import './global.css';
import { Card } from 'components/Card';
import { TextInput } from 'components/TextInput';
import { Button } from 'components/Button';
import { Text } from 'react-native';

export default function App() {
	return (
		<>
			<ScreenContent title="Home" path="App.tsx">
				<Card>
					<Text className='font-bold text-xl'>Sign In</Text>
					<Text className='opacity-70 mt-1'>Use your email/phone and password to continue</Text>

					<TextInput label='Email/Phone' className='mt-6' placeholder='you@example.com' />

					<TextInput label='Password' className='mt-4' secureTextEntry={true} />

					<Button className='mt-6' label="Sign in"></Button>

					<Text className='opacity-70 mt-4 text-center'>Don't have an account? <Text className='underline'>Create one</Text></Text>
				</Card>
			</ScreenContent>
			<StatusBar style="auto" />
		</>
	);
}

