import { Button } from 'components/ui/Button';
import { TextInput } from 'components/ui/TextInput';
import { reportService } from 'lib/services/reports';
import { useState } from 'react';
import { Alert, View } from 'react-native';

export function ExampleReport() {
	const [title, setTitle] = useState('');
	const [subject, setSubject] = useState('');

	const [submitting, setSubmitting] = useState(false)

	async function handleSubmit() {
		setSubmitting(true)


		const { data, error } = await reportService.addReport(title, subject)
		console.log(data)
		if (error) {
			Alert.alert(error.message)
		}

		setSubmitting(false)
	}

	return (
		<View>
			<TextInput label='title' value={title} onChangeText={setTitle} />
			<TextInput label='subject' value={subject} onChangeText={setSubject} />

			<Button onPress={handleSubmit} label='Submit' loading={submitting} />
		</View>
	)
}
