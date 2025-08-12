import { Card } from 'components/Card';
import { TextInput } from 'components/TextInput';
import { Button } from 'components/Button';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { CreditCard, FileText, UserCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import StepProgress from 'components/StepProgress';

export default function GovernmentIds() {
	const router = useRouter()

	return (
		<>
			<View>
				<View style={styles.topbar}>
					<Text className='font-bold text-2xl'>DISPATCH</Text>
					<Text>Step 2 of 2</Text>
				</View>
				<StepProgress current={2} max={2}/>
			</View>

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
							onPress={() => { router.back() }}
							className='underline'
						>Go back</Text> to previous step
					</Text>
				</Card>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	topbar: {
		paddingTop: StatusBar.currentHeight, 
		padding: 15, 
		width: '100%', 
		backgroundColor: 'white', 
		flexDirection: 'row', 
		justifyContent: 'space-between', 
		alignItems: 'center'
	}
})
