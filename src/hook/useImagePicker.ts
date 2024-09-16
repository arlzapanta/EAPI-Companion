import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

interface UseImagePickerOptions {
  onPhotoCaptured?: (base64: string, location: { latitude: number; longitude: number }) => void;
}

export const useImagePicker = ({ onPhotoCaptured }: UseImagePickerOptions = {}) => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleImagePicker = async () => {
    // Request permission to access the camera
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      console.warn('Camera permission is required');
      return;
    }

    // Request permission to access location
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') {
      console.warn('Location permission is required');
      return;
    }

    // Open camera and capture image
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const base64Image = result.assets[0].base64 || null;
      setImageBase64(base64Image);

      // Get current location
      const locationResult = await Location.getCurrentPositionAsync({});
      const currentLocation = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };
      setLocation(currentLocation);

      // Execute the callback function if provided
      if (onPhotoCaptured && base64Image && currentLocation) {
        console.log("Triggering callback with base64Image and location");
        onPhotoCaptured(base64Image, currentLocation);
      }
    }
  };

  return { imageBase64, location, handleImagePicker };
};
