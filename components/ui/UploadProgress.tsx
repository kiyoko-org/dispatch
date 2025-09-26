import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { FileUploadProgress } from '../../lib/types';

interface UploadProgressProps {
  progress: FileUploadProgress;
  fileName?: string;
  showDetails?: boolean;
}

export function UploadProgress({ progress, fileName, showDetails = true }: UploadProgressProps) {
  return (
    <View className="rounded-lg border border-gray-200 bg-white p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-900">
          {fileName ? `Uploading ${fileName}` : 'Uploading...'}
        </Text>
        <Text className="text-sm text-gray-500">{progress.percentage}%</Text>
      </View>

      <View className="mb-2 h-2 w-full rounded-full bg-gray-200">
        <View
          className="h-2 rounded-full bg-blue-600"
          style={{ width: `${progress.percentage}%` }}
        />
      </View>

      {showDetails && (
        <Text className="text-xs text-gray-500">
          {formatBytes(progress.loaded)} of {formatBytes(progress.total)}
        </Text>
      )}
    </View>
  );
}

interface MultipleUploadProgressProps {
  progresses: (FileUploadProgress & { fileName?: string })[];
  title?: string;
}

export function MultipleUploadProgress({
  progresses,
  title = 'Uploading Files',
}: MultipleUploadProgressProps) {
  const totalProgress =
    progresses.length > 0
      ? progresses.reduce((sum, p) => sum + p.percentage, 0) / progresses.length
      : 0;

  return (
    <View className="rounded-lg border border-gray-200 bg-white p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-500">{Math.round(totalProgress)}%</Text>
      </View>

      <View className="mb-3 h-2 w-full rounded-full bg-gray-200">
        <View className="h-2 rounded-full bg-blue-600" style={{ width: `${totalProgress}%` }} />
      </View>

      {progresses.map((progress, index) => (
        <View key={index} className="mb-2">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-xs text-gray-600">
              {progress.fileName || `File ${index + 1}`}
            </Text>
            <Text className="text-xs text-gray-500">{progress.percentage}%</Text>
          </View>
          <View className="h-1 w-full rounded-full bg-gray-100">
            <View
              className="h-1 rounded-full bg-blue-400"
              style={{ width: `${progress.percentage}%` }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

interface UploadStatusProps {
  status: 'uploading' | 'success' | 'error' | 'cancelled';
  message?: string;
  progress?: FileUploadProgress;
}

export function UploadStatus({ status, message, progress }: UploadStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'cancelled':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'cancelled':
        return '⚠';
      case 'uploading':
        return '⟳';
      default:
        return '○';
    }
  };

  return (
    <View className="flex-row items-center rounded-lg bg-gray-50 p-3">
      <Text className={`mr-2 text-lg ${getStatusColor()}`}>{getStatusIcon()}</Text>
      <View className="flex-1">
        <Text className={`text-sm font-medium ${getStatusColor()}`}>
          {message || getStatusMessage(status)}
        </Text>
        {progress && status === 'uploading' && (
          <Text className="mt-1 text-xs text-gray-500">{progress.percentage}% complete</Text>
        )}
      </View>
      {status === 'uploading' && progress && <ActivityIndicator size="small" color="#3B82F6" />}
    </View>
  );
}

function getStatusMessage(status: UploadStatusProps['status']): string {
  switch (status) {
    case 'success':
      return 'Upload completed successfully';
    case 'error':
      return 'Upload failed';
    case 'cancelled':
      return 'Upload cancelled';
    case 'uploading':
      return 'Uploading...';
    default:
      return 'Unknown status';
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
