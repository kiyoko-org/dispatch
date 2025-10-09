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
						},
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
		<Card className="mb-5">
			<View className="mb-4 flex-row items-center">
				<View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
					<Mic size={20} color="#475569" />
				</View>
				<Text className="text-xl font-bold text-slate-900">Voice Statement & Evidence</Text>
			</View>

			<View className="space-y-5">
				<Text className="text-sm text-slate-600">
					Record a voice statement or attach evidence to provide additional details.
				</Text>

				{/* Upload Progress */}
				{isUploading && uploadProgress && (
					<UploadProgress progress={uploadProgress} fileName="Uploading file..." />
				)}

				{/* Uploaded Files */}
				{uploadedFiles.length > 0 && (
					<View className="space-y-2">
						<Text className="text-sm font-medium text-slate-700">Uploaded Files:</Text>
						{uploadedFiles.map((file, index) => (
							<View
								key={index}
								className="flex-row items-center justify-between rounded-lg bg-gray-50 p-3">
								{renderFilePreview(file)}
								<View className="flex-1">
									<Text className="text-sm font-medium text-slate-900" numberOfLines={1}>
										{file.name}
									</Text>
									<Text className="text-xs text-slate-500">
										{FileUtils.formatFileSize(file.size)} • {file.type}
									</Text>
								</View>
								<TouchableOpacity
									onPress={() => removeFile(index)}
									className="ml-2 p-1"
									hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
									<X size={16} color="#EF4444" />
								</TouchableOpacity>
							</View>
						))}
					</View>
				)}

				{/* Voice Recording */}
				<View className="items-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-5">
					<TouchableOpacity
						onPress={handleVoiceRecording}
						className={`mb-3 h-14 w-14 items-center justify-center rounded-full ${uiState.isRecording ? 'bg-red-600' : 'bg-slate-600'
							}`}
						activeOpacity={0.8}>
						<Mic size={22} color="white" />
					</TouchableOpacity>
					<Text className="mb-1 text-base font-medium text-slate-700">
						{uiState.isRecording ? 'Stop Recording' : 'Start Recording'}
					</Text>
					{uiState.isRecording && (
						<Text className="mb-1 text-sm font-medium text-red-600">
							Recording: {Math.floor(recordingDuration / 60)}:
							{(recordingDuration % 60).toString().padStart(2, '0')}
						</Text>
					)}
					<Text className="text-center text-sm text-slate-500">
						Click to {uiState.isRecording ? 'stop' : 'start'} voice recording
					</Text>
				</View>

				{/* Evidence Attachments */}
				<View className="space-y-3">
					<Text className="text-sm font-medium text-slate-700">Attach Evidence:</Text>
					<View className="flex-row space-x-2">
						<TouchableOpacity
							className="flex-1 items-center rounded-lg border-2 border-dashed border-gray-300 px-2 py-4"
							onPress={() => handleFileUpload('image')}
							disabled={isUploading}>
							<Upload size={22} color={isUploading ? '#9CA3AF' : '#64748B'} />
							<Text
								className={`mt-2 text-center text-xs font-medium ${isUploading ? 'text-gray-400' : 'text-slate-700'}`}>
								Upload Files
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							className="flex-1 items-center rounded-lg border-2 border-dashed border-gray-300 px-2 py-4"
							onPress={() => handleFileUpload('photo')}
							disabled={isUploading}>
							<Camera size={22} color={isUploading ? '#9CA3AF' : '#64748B'} />
							<Text
								className={`mt-2 text-center text-xs font-medium ${isUploading ? 'text-gray-400' : 'text-slate-700'}`}>
								Take Photo
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							className="flex-1 items-center rounded-lg border-2 border-dashed border-gray-300 px-2 py-4"
							onPress={() => handleFileUpload('document')}
							disabled={isUploading}>
							<FileText size={22} color={isUploading ? '#9CA3AF' : '#64748B'} />
							<Text
								className={`mt-2 text-center text-xs font-medium ${isUploading ? 'text-gray-400' : 'text-slate-700'}`}>
								Documents
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Card>
	);
}
