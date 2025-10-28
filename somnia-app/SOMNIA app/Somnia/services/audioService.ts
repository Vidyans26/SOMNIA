// services/audioService.ts
import { Audio } from 'expo-av';

export const audioService = {
  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Audio permission error:', error);
      return false;
    }
  },

  async startRecording(): Promise<Audio.Recording | null> {
    try {
      // REQUEST PERMISSION FIRST - This was missing!
      console.log('SOMNIA: Requesting audio permission...');
      const hasPermission = await this.requestPermission();
      
      if (!hasPermission) {
        console.error('SOMNIA: Audio permission denied');
        throw new Error('Missing audio recording permissions.');
      }

      console.log('SOMNIA: Permission granted, setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      console.log('SOMNIA: Creating recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      console.log('SOMNIA: Audio recording started successfully ✅');
      return recording;
    } catch (error) {
      console.error('SOMNIA: Failed to start audio recording:', error);
      throw error; // Re-throw so the UI can handle it
    }
  },

  async stopRecording(recording: Audio.Recording): Promise<string | null> {
    try {
      if (!recording) {
        console.warn('SOMNIA: No recording to stop');
        return null;
      }

      console.log('SOMNIA: Stopping recording...');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('SOMNIA: Audio recording stopped, URI:', uri);
      return uri;
    } catch (error) {
      console.error('SOMNIA: Failed to stop audio recording:', error);
      return null;
    }
  },
};