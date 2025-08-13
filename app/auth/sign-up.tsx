import { Card } from 'components/ui/Card';
import { TextInput } from 'components/ui/TextInput';
import { Button } from 'components/ui/Button';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { CreditCard, FileText, Home, Lock, Mail, User, UserCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from 'lib/supabase';
import { createURL } from 'expo-linking';

export default function RootLayout() {
	const router = useRouter();

	const [loading, setLoading] = useState<boolean>(false);
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [firstName, setFirstName] = useState<string>('');
	const [middleName, setMiddleName] = useState<string>('');
	const [lastName, setLastName] = useState<string>('');
	const [address, setAddress] = useState<string>('');

	const [step, setStep] = useState<number>(1);

	async function signUpWithEmail() {
		setLoading(true);

		const {
			data: { session },
			error,
		} = await supabase.auth.signUp({
			email: email,
			password: password,
			options: {
				emailRedirectTo: createURL('/home'),
				data: {
					first_name: firstName,
					middle_name: middleName,
					last_name: lastName,
					address: address
				}
			}
		});

		setLoading(false)

		if (error) {
			Alert.alert(error.message);
			console.error(error.stack);
			return
		}

		if (!session) {
			Alert.alert('Please check your inbox for email verification!');
		}
	}

	const step1 = (
		<View className="mt-8 items-center">
			<Card className="w-[90%]">
				<Text className="text-xl font-bold">Create your account</Text>
				<Text className="mt-1 opacity-70">Tell us a bit about you</Text>

				<View className="mt-6 flex gap-4">
					<TextInput
						icon={<User />}
						label="First Name"
						placeholder="Juan"
						value={firstName}
						onChangeText={setFirstName}
					/>

					<TextInput
						label="Middle Name"
						placeholder="Dalisay"
						value={middleName}
						onChangeText={setMiddleName}
					/>

					<TextInput
						label="Last Name"
						placeholder="Dela Cruz"
						value={lastName}
						onChangeText={setLastName}
					/>

					<TextInput
						icon={<Home />}
						label="Address"
						placeholder="Barangay, City, Province"
						value={address}
						onChangeText={setAddress}
					/>

					<TextInput
						icon={<Mail />}
						label="Email/Phone"
						value={email}
						onChangeText={setEmail}
						placeholder="you@example.com"
					/>

					<TextInput
						icon={<Lock />}
						label="Password"
						value={password}
						onChangeText={setPassword}
						placeholder="••••••"
						secureTextEntry={true}
					/>
				</View>

				<Button
					loading={loading}
					className="mt-6"
					label="Sign Up"
					onPress={() => {
						signUpWithEmail();
					}}></Button>

				<Text className="mt-4 text-center opacity-70">
					Already have an account?{' '}
					<Text
						onPress={() => {
							router.back();
						}}
						className="underline">
						Sign in
					</Text>
				</Text>
			</Card>
		</View>
	);

	const step2 = (
		<View className="mt-8 items-center">
			<Card className="w-[90%]">
				<Text className="text-xl font-bold">Government Issued IDs</Text>
				<Text className="mt-1 opacity-70">
					Please provide your government identification documents
				</Text>

				<View className="mt-6 flex gap-4">
					<TextInput icon={<CreditCard />} label="SSS Number" placeholder="34-5678901-2" />

					<TextInput icon={<FileText />} label="TIN Number" placeholder="123-456-789-000" />

					<TextInput icon={<UserCheck />} label="PhilHealth Number" placeholder="1234-5678-9012" />

					<TextInput
						icon={<CreditCard />}
						label="Passport Number (Optional)"
						placeholder="P12345678"
					/>

					<TextInput
						icon={<FileText />}
						label="Driver's License (Optional)"
						placeholder="A01-12-345678"
					/>
				</View>

				<Button className="mt-6" label="Complete Registration" />

				<Text className="mt-4 text-center opacity-70">
					<Text
						onPress={() => {
							setStep((step) => step - 1);
						}}
						className="underline">
						Go back
					</Text>{' '}
					to previous step
				</Text>
			</Card>
		</View>
	);

	return (
		<SafeAreaView>
			<View style={styles.topbar}>
				<Text className="text-2xl font-bold">DISPATCH</Text>
				{/**
					<Text>Step 1 of 2</Text>
				**/}
			</View>
			{/**
				<StepProgress current={step} max={2} />
			**/}
			{step == 1 ? step1 : step2}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	topbar: {
		padding: 15,
		width: '100%',
		backgroundColor: 'white',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
});
