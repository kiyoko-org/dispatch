import { Button } from 'components/ui/Button';
import { TextInput } from 'components/ui/TextInput';
import { reportService } from 'lib/services/reports';
import { ReportData } from 'lib/types';
import { useState } from 'react';
import { Alert, View } from 'react-native';

export function ExampleReport() {
  const [formData, setFormData] = useState<ReportData>({
    incidentCategory: '',
    incidentSubcategory: '',
    incidentTitle: '',
    incidentDate: '',
    incidentTime: '',
    streetAddress: '',
    nearbyLandmark: '',
    city: 'Tuguegarao City',
    province: 'Cagayan',
    briefDescription: '',
    whatHappened: '',
    whoWasInvolved: '',
    numberOfWitnesses: '',
    injuriesReported: '',
    propertyDamage: '',
    suspectDescription: '',
    witnessContactInfo: '',
    requestFollowUp: true,
    shareWithCommunity: false,
    isAnonymous: false,
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
        value={formData.incidentTitle}
        onChangeText={(value) => updateFormData('incidentTitle', value)}
      />
      <TextInput
        label="What Happened"
        value={formData.whatHappened}
        onChangeText={(value) => updateFormData('whatHappened', value)}
      />

      <Button onPress={handleSubmit} label="Submit" loading={submitting} />
    </View>
  );
}
