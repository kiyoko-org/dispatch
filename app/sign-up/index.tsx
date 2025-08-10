import { Card } from 'components/Card';
import { TextInput } from 'components/TextInput';
import { Button } from 'components/Button';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Home, Lock, Mail, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import StepProgress from 'components/StepProgress';

export default function RootLayout() {

	const router = useRouter()

	return (
		<>
			<View>
				<View style={styles.topbar}>
					<Text className='font-bold text-2xl'>DISPATCH</Text>
					<Text >Step 1 of 2</Text>
				</View>
				<StepProgress current={1} max={2}/>
			</View>

			<View className="items-center mt-8">

				<Card className='w-[90%]'>
					<Text className='font-bold text-xl'>Create your account</Text>
					<Text className='opacity-70 mt-1'>Tell us a bit about you</Text>

					<View className='mt-6 flex gap-4'>

						<TextInput icon={<User />} label='First Name' placeholder='Juan' />

						<TextInput label='Middle Name' placeholder='Dalisay' />

						<TextInput label='Last Name' placeholder='Dela Cruz' />


						<TextInput icon={<Home />} label='Address' placeholder='Barangay, City, Province' />

						<TextInput icon={
							<Mail />
						} label='Email/Phone' placeholder='you@example.com' />

						<TextInput icon={
							<Lock />
						} label='Password' placeholder='••••••' secureTextEntry={true} />

					</View>


					<Button
						className='mt-6' 
						label="Continue"
						onPress={() => {
							router.push('/sign-up/government-ids');
						}}
					/>

					<Text className='opacity-70 mt-4 text-center'>Already have an account? <Text
						onPress={() => { router.push('/') }}
						className='underline'
					>Sign in</Text></Text>
				</Card>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	topbar: {
		paddingTop: StatusBar.currentHeight, padding: 15, width: '100%', backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
	}
})
