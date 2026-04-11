import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import {
  validateVerificationFile,
  VERIFICATION_MAX_FILE_SIZE_BYTES,
  type DispatchClient,
  type VerificationDocumentType,
} from '@kiyoko-org/dispatch-lib';
import {
  type LocalVerificationFile,
  uploadVerificationDocuments,
} from 'lib/services/verification-storage';

const DOCUMENT_TYPE_OPTIONS: Array<{
  value: VerificationDocumentType;
  label: string;
  subtitle: string;
}> = [
  {
    value: 'drivers_license',
    label: "Driver's License",
    subtitle: 'Front required, back optional',
  },
  {
    value: 'passport',
    label: 'Passport',
    subtitle: 'Main info page only if needed',
  },
  {
    value: 'postal_id',
    label: 'Postal ID',
    subtitle: 'Front required, back optional',
  },
  {
    value: 'umid',
    label: 'UMID',
    subtitle: 'Front required, back optional',
  },
]; 

type ManualVerificationModalProps = {
  visible: boolean;
  profileId: string;
  client: DispatchClient;
  colors: Record<string, string>;
  onClose: () => void;
  onSubmitted: () => Promise<void>;
};

export default function ManualVerificationModal({
  visible,
  profileId,
  client,
  colors,
  onClose,
  onSubmitted,
}: ManualVerificationModalProps) {
  const [documentType, setDocumentType] = useState<VerificationDocumentType | null>(null);
  const [frontFile, setFrontFile] = useState<LocalVerificationFile | null>(null);
  const [backFile, setBackFile] = useState<LocalVerificationFile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return Boolean(documentType && frontFile && !submitting && !pickerLoading);
  }, [documentType, frontFile, pickerLoading, submitting]);

  function resetForm() {
    setDocumentType(null);
    setFrontFile(null);
    setBackFile(null);
    setSubmitting(false);
    setPickerLoading(false);
  }

  function handleClose() {
    if (submitting) return;
    resetForm();
    onClose();
  }

  async function pickImage(target: 'front' | 'back') {
    setPickerLoading(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Photo library access is required to choose an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      const file = await createLocalVerificationFile({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        sizeBytes: asset.fileSize ?? null,
        name: asset.fileName ?? 'image',
      });

      if (!file) return;
      if (target === 'front') setFrontFile(file);
      else setBackFile(file);
    } catch (error) {
      console.error('Failed to pick verification image', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setPickerLoading(false);
    }
  }

  async function handleSubmit() {
    if (!documentType) {
      Alert.alert('Missing document type', 'Please choose which ID you want to submit.');
      return;
    }

    if (!frontFile) {
      Alert.alert('Front file required', 'Please attach the front of your ID before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const requestId = randomUUID();
      const { frontStoragePath, backStoragePath } = await uploadVerificationDocuments({
        client,
        profileId,
        requestId,
        frontFile,
        backFile,
      });

      const { error } = await client.submitVerificationRequest({
        id: requestId,
        profile_id: profileId,
        document_type: documentType,
        front_storage_path: frontStoragePath,
        back_storage_path: backStoragePath,
      });

      if (error) {
        throw new Error(error.message);
      }

      await onSubmitted();
      resetForm();
      onClose();

      Alert.alert(
        'Submitted',
        'Your verification request was submitted successfully and is now pending admin review.',
      );
    } catch (error) {
      console.error('Failed to submit manual verification request', error);
      const message = error instanceof Error ? error.message : 'Failed to submit request';
      Alert.alert('Submission failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
              Upload another ID
            </Text>
            <Text style={{ marginTop: 4, fontSize: 13, color: colors.textSecondary }}>
              Manual review is available if you cannot verify with National ID.
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} disabled={submitting}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.primary }}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 10 }}>
            DOCUMENT TYPE
          </Text>
          <View style={{ gap: 10 }}>
            {DOCUMENT_TYPE_OPTIONS.map((option) => {
              const selected = documentType === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setDocumentType(option.value)}
                  style={{
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? `${colors.primary}15` : colors.surface,
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                    {option.label}
                  </Text>
                  <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>
                    {option.subtitle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 10 }}>
              FRONT OF ID
            </Text>
            <FileCard
              label={frontFile?.name ?? 'No file selected'}
              subtitle={frontFile ? formatFileMeta(frontFile) : 'Required'}
              colors={colors}
              onClear={() => setFrontFile(null)}
              hasFile={Boolean(frontFile)}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <ActionButton
                label="Choose Image"
                onPress={() => void pickImage('front')}
                disabled={pickerLoading || submitting}
                colors={colors}
              />
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 10 }}>
              BACK OF ID (OPTIONAL)
            </Text>
            <FileCard
              label={backFile?.name ?? 'No file selected'}
              subtitle={backFile ? formatFileMeta(backFile) : 'Optional'}
              colors={colors}
              onClear={() => setBackFile(null)}
              hasFile={Boolean(backFile)}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <ActionButton
                label="Choose Image"
                onPress={() => void pickImage('back')}
                disabled={pickerLoading || submitting}
                colors={colors}
              />
            </View>
          </View>

          <View
            style={{
              marginTop: 24,
              borderRadius: 14,
              padding: 14,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
              Upload rules
            </Text>
            <Text style={{ marginTop: 8, fontSize: 12, lineHeight: 18, color: colors.textSecondary }}>
              • Allowed files: JPG, PNG{`\n`}
              • Max size: {Math.round(VERIFICATION_MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB per file{`\n`}
              • Front file is required{`\n`}
              • Manual review may take time
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => void handleSubmit()}
            disabled={!canSubmit}
            style={{
              marginTop: 24,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: canSubmit ? colors.primary : colors.border,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                Submit for review
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

function FileCard({
  label,
  subtitle,
  colors,
  onClear,
  hasFile,
}: {
  label: string;
  subtitle: string;
  colors: Record<string, string>;
  onClear: () => void;
  hasFile: boolean;
}) {
  return (
    <View
      style={{
        borderRadius: 14,
        padding: 14,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{label}</Text>
        <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>{subtitle}</Text>
      </View>
      {hasFile ? (
        <TouchableOpacity onPress={onClear}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#EF4444' }}>Remove</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  disabled,
  colors,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  colors: Record<string, string>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: disabled ? colors.surfaceVariant : colors.surface,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{label}</Text>
    </TouchableOpacity>
  );
}

async function createLocalVerificationFile({
  uri,
  mimeType,
  sizeBytes,
  name,
}: {
  uri: string;
  mimeType: string;
  sizeBytes: number | null;
  name?: string | null;
}): Promise<LocalVerificationFile | null> {
  const resolvedSize = await resolveFileSize(uri, sizeBytes);
  const validation = validateVerificationFile({ mimeType, sizeBytes: resolvedSize });

  if (!validation.isValid) {
    Alert.alert('Invalid file', validation.error ?? 'Please choose a valid file.');
    return null;
  }

  return {
    uri,
    mimeType,
    sizeBytes: resolvedSize,
    name,
  };
}

async function resolveFileSize(uri: string, fallbackSize: number | null): Promise<number> {
  if (typeof fallbackSize === 'number' && fallbackSize > 0) {
    return fallbackSize;
  }

  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) return 0;
  return fileInfo.size ?? 0;
}

function formatFileMeta(file: LocalVerificationFile): string {
  return `${formatBytes(file.sizeBytes)} • ${file.mimeType}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
