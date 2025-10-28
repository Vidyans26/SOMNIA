import { Camera } from 'expo-camera';
import { CameraView } from 'expo-camera';

export const videoService = {
  async requestPermission(): Promise<boolean> {
    try {
      console.log('Requesting camera permission...');
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log('Camera permission status:', status);
      return status === 'granted';
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  },

  async startRecording(cameraRef: React.RefObject<CameraView>): Promise<boolean> {
    try {
      // For now, just verify the camera is ready
      if (!cameraRef.current) {
        console.warn('Camera ref is not available yet');
        return false;
      }

      console.log('Camera preview is active ✅');
      // Actual recording will be implemented later
      // For now, the camera just shows a live preview
      return true;
    } catch (error) {
      console.error('Failed to start video recording:', error);
      return false;
    }
  },

  async stopRecording(cameraRef: React.RefObject<CameraView>): Promise<string | null> {
    try {
      console.log('Camera preview stopped');
      return null;
    } catch (error) {
      console.error('Failed to stop video recording:', error);
      return null;
    }
  },
};