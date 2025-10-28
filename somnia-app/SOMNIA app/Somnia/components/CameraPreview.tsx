import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { CameraView } from 'expo-camera';
import { COLORS, SIZES, SPACING } from '../constants/theme';

interface CameraPreviewProps {
  cameraRef: React.RefObject<CameraView>;
  isRecording: boolean;
  style?: StyleProp<ViewStyle>; // Accept the 'style' prop
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  cameraRef,
  isRecording,
  style // Use the 'style' prop
}) => {
  return (
    // Apply the incoming 'style' prop to the container
    <View style={[styles.container, style]}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      >
        {/* We only show the overlay *if* we are recording */}
        {isRecording && (
          <View style={styles.overlay}>
            <View style={styles.recordingBadge}>
              <View style={[styles.recordingDot, styles.recordingDotActive]} />
              <Text style={styles.recordingText}>
                Recording Video
              </Text>
            </View>
          </View>
        )}
      </CameraView>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    height: 150,
    margin: SPACING.md,
    borderRadius: SIZES.radiusMedium,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SIZES.radiusLarge,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  recordingDotActive: {
    backgroundColor: COLORS.danger,
  },
  recordingText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
  },
});