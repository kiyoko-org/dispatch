import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { IFilePickerService } from '../types';

/**
 * File Picker Service
 * Provides a unified interface for picking different types of files
 */
export class ExpoFilePickerService implements IFilePickerService {
  /**
   * Pick a single image from the photo library
   */
  async pickImage(
    options: {
      allowsEditing?: boolean;
      aspect?: [number, number];
      quality?: number;
    } = {}
  ): Promise<string | null> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Permission to access photo library is required to select images.'
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 1,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      return null;
    }
  }

  /**
   * Pick a document from the device
   */
  async pickDocument(
    options: {
      type?: string[];
    } = {}
  ): Promise<string | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: options.type || ['*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && 'uri' in result) {
        return result.uri as string;
      }

      return null;
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
      return null;
    }
  }

  /**
   * Pick multiple images from the photo library
   */
  async pickMultipleImages(
    options: {
      maxCount?: number;
    } = {}
  ): Promise<string[]> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Permission to access photo library is required to select images.'
        );
        return [];
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: options.maxCount ?? 10,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        return result.assets.map((asset) => asset.uri);
      }

      return [];
    } catch (error) {
      console.error('Error picking multiple images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
      return [];
    }
  }

  /**
   * Take a photo using the camera
   */
  async takePhoto(
    options: {
      allowsEditing?: boolean;
      aspect?: [number, number];
      quality?: number;
    } = {}
  ): Promise<string | null> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Permission to access camera is required to take photos.'
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 1,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  }

  /**
   * Record audio (placeholder - would need expo-av for actual implementation)
   */
  async recordAudio(
    options: {
      maxDuration?: number;
    } = {}
  ): Promise<string | null> {
    // This is a placeholder implementation
    // In a real implementation, you would use expo-av to record audio
    Alert.alert(
      'Not Implemented',
      'Audio recording is not yet implemented. This would require expo-av integration.'
    );
    return null;
  }
}
