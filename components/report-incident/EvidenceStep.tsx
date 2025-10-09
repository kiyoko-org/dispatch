import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { Mic, Upload, Camera, FileText, X, Music, File } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { UploadProgress } from '../ui/UploadProgress';
import {
	UploadManager,
	FileUploadResult,
	FileUploadProgress,
	SupabaseStorageService,
	ExpoFilePickerService
} from '../../lib/services';
import { FileUtils } from '../../lib/services/file-utils';
import { AudioRecorder } from 'expo-audio';
import { useTheme } from '../ThemeContext';

interface EvidenceStepProps {
	uiState: {
		isRecording: boolean;
	};
	onUpdateUIState: (updates: Partial<EvidenceStepProps['uiState']>) => void;
	onFilesUploaded?: (files: FileUploadResult[]) => void;
}

// Initialize services (in a real app, these would be provided via context or props)
const storageService = new SupabaseStorageService(); // Use MockStorageService for testing
const filePickerService = new ExpoFilePickerService();
const uploadManager = new UploadManager(storageService, filePickerService);

export default function EvidenceStep({
	uiState,
	onUpdateUIState,
	onFilesUploaded,
}: EvidenceStepProps) {
	const { colors } = useTheme();
	const [uploadedFiles, setUploadedFiles] = useState<FileUploadResult[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<FileUploadProgress | null>(null);
	const [recorder, setRecorder] = useState<AudioRecorder | null>(null);
	const [recordingDuration, setRecordingDuration] = useState(0);
	const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// Cleanup recording interval on unmount
	useEffect(() => {
		return () => {
			if (recordingIntervalRef.current) {
				clearInterval(recordingIntervalRef.current);
			}
		};
	}, []);

	const handleVoiceRecording = async () => {
		if (uiState.isRecording) {
			// Stop recording
			if (recorder) {
				try {
					console.log('Stopping voice recording...');
					setIsUploading(true);
					const result = await uploadManager.uploadRecordedAudio(
						recorder,
						{
							stopRecording: true,
							maxSize: 25 * 1024 * 1024, // 25MB for audio
							allowedTypes: ["application/octet-stream"],
						},
						(progress) => {
							console.log('Upload progress:', progress);
							setUploadProgress(progress);
						}
					);

					console.log('Audio upload result:', result);
					if (result) {
						const newFiles = [...uploadedFiles, result];
						setUploadedFiles(newFiles);
						onFilesUploaded?.(newFiles);
						console.log('Audio file added to evidence list');
					}
				} catch (error) {
					console.error('Error uploading recorded audio:', error);
					Alert.alert('Upload Failed', 'Failed to upload recorded audio. Please try again.');
				} finally {
					setIsUploading(false);
					setUploadProgress(null);
					setRecorder(null);
				}
			}

			// Clear recording timer
			if (recordingIntervalRef.current) {
				clearInterval(recordingIntervalRef.current);
				recordingIntervalRef.current = null;
			}
			setRecordingDuration(0);
			onUpdateUIState({ isRecording: false });
		} else {
			// Start recording
			try {
				const newRecorder = await filePickerService.startRecording();
				if (newRecorder) {
					setRecorder(newRecorder);
					onUpdateUIState({ isRecording: true });

					// Start recording duration timer
					setRecordingDuration(0);
					recordingIntervalRef.current = setInterval(() => {
						setRecordingDuration((prev) => prev + 1);
					}, 1000);
				}
			} catch (error) {
				console.error('Error starting recording:', error);
				Alert.alert('Recording Failed', 'Failed to start audio recording. Please try again.');
			}
		}
	};

	const handleFileUpload = async (type: 'image' | 'photo' | 'document') => {
		try {
			console.log('Starting file upload for type:', type);
			setIsUploading(true);
			let result: FileUploadResult | null = null;

			if (type === 'image') {
				console.log('Uploading image...');
				result = await uploadManager.pickAndUploadImage(
					{
						maxSize: 10 * 1024 * 1024, // 10MB
						allowedTypes: FileUtils.getAllowedTypesForCategory('images'),
					},
					(progress) => {
						console.log('Image upload progress:', progress);
						setUploadProgress(progress);
					}
				);
			} else if (type === 'photo') {
				console.log('Taking photo...');
				result = await uploadManager.takePhotoAndUpload(
					{
						maxSize: 10 * 1024 * 1024, // 10MB
						allowedTypes: FileUtils.getAllowedTypesForCategory('images'),
					},
					(progress) => {
						console.log('Photo upload progress:', progress);
						setUploadProgress(progress);
					}
				);
			} else if (type === 'document') {
				console.log('Uploading document...');
				console.log('Allowed document types:', FileUtils.getAllowedTypesForCategory('documents'));
				result = await uploadManager.pickDocumentAndUpload(
					{
						maxSize: 25 * 1024 * 1024, // 25MB
						allowedTypes: FileUtils.getAllowedTypesForCategory('documents'),
						type: FileUtils.getAllowedTypesForCategory('documents'), // Pass type for file picker filtering
					},
					(progress) => {
						console.log('Document upload progress:', progress);
						setUploadProgress(progress);
					}
				);
			}

			console.log('Upload result:', result);

			if (result) {
				const newFiles = [...uploadedFiles, result];
				setUploadedFiles(newFiles);
				onFilesUploaded?.(newFiles);
				console.log('File uploaded successfully:', result.name);
			} else {
				console.log('No result returned from upload');
				Alert.alert('Upload Failed', 'No file was uploaded. Please try again.');
			}
		} catch (error) {
			console.error('Upload failed:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			Alert.alert('Upload Failed', `Failed to upload file: ${errorMessage}. Please try again.`);
		} finally {
			setIsUploading(false);
			setUploadProgress(null);
		}
	};

	const removeFile = (index: number) => {
		const newFiles = uploadedFiles.filter((_, i) => i !== index);
		setUploadedFiles(newFiles);
		onFilesUploaded?.(newFiles);
	};

	const renderFilePreview = (file: FileUploadResult) => {
		if (FileUtils.isImageFile(file.type)) {
			// Show thumbnail for images
			return (
				<View className="mr-3 h-12 w-12 overflow-hidden rounded-lg">
					<Image
						source={{ uri: file.url }}
						style={{ width: 48, height: 48 }}
						resizeMode="cover"
					/>
				</View>
			);
		} else if (FileUtils.isAudioFile(file.type)) {
			// Show music icon for audio files
			return (
				<View className="mr-3 h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
					<Music size={24} color="#3B82F6" />
				</View>
			);
		} else if (FileUtils.isDocumentFile(file.type)) {
			// Show document icon for documents
			return (
				<View className="mr-3 h-12 w-12 items-center justify-center rounded-lg bg-green-100">
					<FileText size={24} color="#10B981" />
				</View>
			);
		} else {
			// Show generic file icon for other file types
			return (
				<View className="mr-3 h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
					<File size={24} color="#6B7280" />
				</View>
			);
		}
	};

	return (
		<Card style={{ marginBottom: 20 }}>
			<View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
				<View style={{ 
					marginRight: 12, 
					height: 32, 
					width: 32, 
					alignItems: 'center', 
					justifyContent: 'center', 
					borderRadius: 8, 
					backgroundColor: colors.surfaceVariant 
				}}>
					<Mic size={20} color={colors.textSecondary} />
				</View>
				<Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Voice Statement & Evidence</Text>
			</View>

			<View>
				<Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
					Record a voice statement or attach evidence to provide additional details.
				</Text>

				{/* Upload Progress */}
				{isUploading && uploadProgress && (
					<UploadProgress progress={uploadProgress} fileName="Uploading file..." />
				)}

				{/* Uploaded Files */}
				{uploadedFiles.length > 0 && (
					<View style={{ marginBottom: 16 }}>
						<Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 8 }}>
							Uploaded Files:
						</Text>
						{uploadedFiles.map((file, index) => (
							<View
								key={index}
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'space-between',
									borderRadius: 8,
									backgroundColor: colors.surfaceVariant,
									padding: 12,
									marginBottom: 8,
								}}>
								{renderFilePreview(file)}
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }} numberOfLines={1}>
										{file.name}
									</Text>
									<Text style={{ fontSize: 12, color: colors.textSecondary }}>
										{FileUtils.formatFileSize(file.size)} • {file.type}
									</Text>
								</View>
								<TouchableOpacity
									onPress={() => removeFile(index)}
									style={{ marginLeft: 8, padding: 4 }}
									hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
									<X size={16} color={colors.error} />
								</TouchableOpacity>
							</View>
						))}
					</View>
				)}

				{/* Voice Recording */}
				<View style={{
					alignItems: 'center',
					borderRadius: 8,
					borderWidth: 2,
					borderStyle: 'dashed',
					borderColor: colors.border,
					paddingHorizontal: 16,
					paddingVertical: 20,
					marginBottom: 16,
				}}>
					<TouchableOpacity
						onPress={handleVoiceRecording}
						style={{
							marginBottom: 12,
							height: 56,
							width: 56,
							alignItems: 'center',
							justifyContent: 'center',
							borderRadius: 28,
							backgroundColor: uiState.isRecording ? colors.error : colors.primary,
						}}
						activeOpacity={0.8}>
						<Mic size={22} color={colors.card} />
					</TouchableOpacity>
					<Text style={{ marginBottom: 4, fontSize: 16, fontWeight: '500', color: colors.text }}>
						{uiState.isRecording ? 'Stop Recording' : 'Start Recording'}
					</Text>
					{uiState.isRecording && (
						<Text style={{ marginBottom: 4, fontSize: 14, fontWeight: '500', color: colors.error }}>
							Recording: {Math.floor(recordingDuration / 60)}:
							{(recordingDuration % 60).toString().padStart(2, '0')}
						</Text>
					)}
					<Text style={{ textAlign: 'center', fontSize: 14, color: colors.textSecondary }}>
						Click to {uiState.isRecording ? 'stop' : 'start'} voice recording
					</Text>
				</View>

				{/* Evidence Attachments */}
				<View>
					<Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 12 }}>
						Attach Evidence:
					</Text>
					<View style={{ flexDirection: 'row', gap: 8 }}>
						<TouchableOpacity
							style={{
								flex: 1,
								alignItems: 'center',
								borderRadius: 8,
								borderWidth: 2,
								borderStyle: 'dashed',
								borderColor: colors.border,
								paddingHorizontal: 8,
								paddingVertical: 16,
							}}
							onPress={() => handleFileUpload('image')}
							disabled={isUploading}>
							<Upload size={22} color={isUploading ? colors.textSecondary : colors.text} />
							<Text
								style={{
									marginTop: 8,
									textAlign: 'center',
									fontSize: 12,
									fontWeight: '500',
									color: isUploading ? colors.textSecondary : colors.text,
								}}>
								Upload Files
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={{
								flex: 1,
								alignItems: 'center',
								borderRadius: 8,
								borderWidth: 2,
								borderStyle: 'dashed',
								borderColor: colors.border,
								paddingHorizontal: 8,
								paddingVertical: 16,
							}}
							onPress={() => handleFileUpload('photo')}
							disabled={isUploading}>
							<Camera size={22} color={isUploading ? colors.textSecondary : colors.text} />
							<Text
								style={{
									marginTop: 8,
									textAlign: 'center',
									fontSize: 12,
									fontWeight: '500',
									color: isUploading ? colors.textSecondary : colors.text,
								}}>
								Take Photo
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={{
								flex: 1,
								alignItems: 'center',
								borderRadius: 8,
								borderWidth: 2,
								borderStyle: 'dashed',
								borderColor: colors.border,
								paddingHorizontal: 8,
								paddingVertical: 16,
							}}
							onPress={() => handleFileUpload('document')}
							disabled={isUploading}>
							<FileText size={22} color={isUploading ? colors.textSecondary : colors.text} />
							<Text
								style={{
									marginTop: 8,
									textAlign: 'center',
									fontSize: 12,
									fontWeight: '500',
									color: isUploading ? colors.textSecondary : colors.text,
								}}>
								Documents
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Card>
	);
}
