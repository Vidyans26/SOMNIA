import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { MonitoringSettings } from '../types';
import { COLORS, SIZES, SPACING } from '../constants/theme';

interface SettingsPanelProps {
  settings: MonitoringSettings;
  onVideoToggle: (value: boolean) => void;
  onWearableToggle: (value: boolean) => void;
  onConnectWearable: () => void;
  onRequestVideoPermission: () => void;
  cameraPermission: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onVideoToggle,
  onWearableToggle,
  onConnectWearable,
  onRequestVideoPermission,
  cameraPermission,
}) => {
  return (
    <View style={styles.container}>
      {/* Video Setting */}
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>📹 Video Monitoring</Text>
          <Text style={styles.settingDescription}>
            Track sleep position and movements
          </Text>
        </View>
        <Switch
          value={settings.videoEnabled}
          onValueChange={onVideoToggle}
          trackColor={{ false: COLORS.cardBorder, true: COLORS.primary }}
          thumbColor={settings.videoEnabled ? COLORS.textPrimary : COLORS.textSecondary}
        />
      </View>

      {settings.videoEnabled && !cameraPermission && (
        <View style={styles.permissionWarning}>
          <Text style={styles.warningText}>
            ⚠️ Camera permission required
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={onRequestVideoPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Wearable Setting */}
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>⌚ Wearable Device</Text>
          <Text style={styles.settingDescription}>
            {settings.wearableConnected 
              ? `Connected: ${settings.wearableDeviceName}`
              : 'Monitor heart rate and SpO2'}
          </Text>
        </View>
        <Switch
          value={settings.wearableEnabled}
          onValueChange={onWearableToggle}
          trackColor={{ false: COLORS.cardBorder, true: COLORS.primary }}
          thumbColor={settings.wearableEnabled ? COLORS.textPrimary : COLORS.textSecondary}
        />
      </View>

      {settings.wearableEnabled && !settings.wearableConnected && (
        <TouchableOpacity 
          style={styles.connectButton}
          onPress={onConnectWearable}
        >
          <Text style={styles.connectButtonText}>🔍 Connect Device</Text>
        </TouchableOpacity>
      )}

      {/* Info Note */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
    💡      <Text style={styles.infoBold}>Battery Usage:</Text>{'\n'}
                • Audio only: ~15% per 8 hours{'\n'}
                • Audio + Video: ~25% per 8 hours{'\n'}
                • Audio + Video + Wearable: ~30% per 8 hours{'\n'}
                {'\n'}
            <Text style={styles.infoBold}>SOMNIA Tip:</Text> Keep phone plugged in for best results
        </Text>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    margin: SPACING.md,
    padding: SPACING.xl,
    borderRadius: SIZES.radiusMedium,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: SIZES.fontLarge,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: SPACING.md,
  },
  permissionWarning: {
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
    padding: SPACING.md,
    borderRadius: SIZES.radiusSmall,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  warningText: {
    color: COLORS.warning,
    fontSize: SIZES.fontSmall,
    marginBottom: SPACING.sm,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SIZES.radiusSmall,
    alignSelf: 'flex-start',
  },
  permissionButtonText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontSmall,
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: SIZES.radiusSmall,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  connectButtonText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#151933',
    padding: SPACING.md,
    borderRadius: SIZES.radiusSmall,
    marginTop: SPACING.sm,
  },
  infoText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  infoBold: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
});