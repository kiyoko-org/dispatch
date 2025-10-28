import { Button } from 'components/ui/Button';
import { TextInput } from 'components/ui/TextInput';
import { reportService } from 'lib/services/reports';
import { ReportData } from 'lib/types';
import { useState } from 'react';
import { Alert, View } from 'react-native';

export function ExampleReport() {
  const [formData, setFormData] = useState<ReportData>({
    incident_category: '',
    incident_subcategory: '',
    incident_title: '',
    incident_date: '',
    incident_time: '',
    street_address: '',
    nearby_landmark: '',
    what_happened: '',
  });

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);

    const { data, error } = await reportService.addReport(formData);
    console.log(data);
    if (error) {
      Alert.alert(error.message);
    }

    setSubmitting(false);
  }

  const updateFormData = (field: keyof ReportData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View>
      <TextInput
        label="Incident Title"
        value={formData.incident_title}
        onChangeText={(value) => updateFormData('incident_title', value)}
      />
      <TextInput
        label="What Happened"
        value={formData.what_happened}
        onChangeText={(value) => updateFormData('what_happened', value)}
      />

      <Button onPress={handleSubmit} label="Submit" loading={submitting} />
    </View>
  );
}
