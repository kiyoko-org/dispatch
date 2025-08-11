import { Card } from 'components/Card';
import { TextInput } from 'components/TextInput';
import { Button } from 'components/Button';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { CreditCard, FileText, Home, Lock, Mail, User, UserCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import StepProgress from 'components/StepProgress';
import { useState } from 'react';
import { supabase } from 'lib/supabase';

/* TODO:
 * The next step should be a separate component, not a screen
*/
export default function RootLayout() {

	const router = useRouter()

	const [loading, setLoading] = useState<boolean>(false)
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')

	const [step, setStep] = useState<number>(1)

	async function signUpWithEmail() {
		setLoading(true)
		const {
			data: { session },
			error,
		} = await supabase.auth.signUp({
			email: email,
			password: password,
		})
		if (error) Alert.alert(error.message)
		if (!session) Alert.alert('Please check your inbox for email verification!')
		setLoading(false)
	}

	const step1 = (
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
						setStep(2)
					}}
				></Button>

				<Text className='opacity-70 mt-4 text-center'>Already have an account? <Text
					onPress={() => { router.back() }}
					className='underline'
				>Sign in</Text></Text>
			</Card>
		</View>
	)

	const step2 = (
		<View className="items-center mt-8">
			<Card className='w-[90%]'>
				<Text className='font-bold text-xl'>Government Issued IDs</Text>
				<Text className='opacity-70 mt-1'>Please provide your government identification documents</Text>

				<View className='mt-6 flex gap-4'>
					<TextInput
						icon={<CreditCard />}
						label='SSS Number'
						placeholder='34-5678901-2'
					/>

					<TextInput
						icon={<FileText />}
						label='TIN Number'
						placeholder='123-456-789-000'
					/>

					<TextInput
						icon={<UserCheck />}
						label='PhilHealth Number'
						placeholder='1234-5678-9012'
					/>

					<TextInput
						icon={<CreditCard />}
						label='Passport Number (Optional)'
						placeholder='P12345678'
					/>

					<TextInput
						icon={<FileText />}
						label="Driver's License (Optional)"
						placeholder='A01-12-345678'
					/>
				</View>

				<Button
					className='mt-6'
					label="Complete Registration"
				/>

				<Text className='opacity-70 mt-4 text-center'>
					<Text
						onPress={() => {
							setStep(step => step - 1)
						}}
						className='underline'
					>Go back</Text> to previous step
				</Text>
			</Card>
		</View>
	)

	return (
		<SafeAreaView>
			<View style={styles.topbar}>
				<Text className='font-bold text-2xl'>DISPATCH</Text>
				<Text >Step 1 of 2</Text>
			</View>
			<StepProgress current={step} max={2} />
			{step == 1 ? step1 : step2}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	topbar: {
		padding: 15, width: '100%', backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
	}
})
