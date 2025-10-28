// components/HeartRateChart.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeartRateData } from '../types';
import { COLORS, SIZES, SPACING } from '../constants/theme';

interface HeartRateChartProps {
  heartRate: HeartRateData;
  bloodOxygen?: {
    average: number;
    min: number;
    desaturations: number;
  };
}

export const HeartRateChart: React.FC<HeartRateChartProps> = ({ 
  heartRate, 
  bloodOxygen 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>❤️ Heart & Oxygen Metrics</Text>
      
      {/* Heart Rate */}
      <View style={styles.metricRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Average HR</Text>
          <Text style={[styles.metricValue, { color: COLORS.chartHeartRate }]}>
            {heartRate.average}
          </Text>
          <Text style={styles.metricUnit}>bpm</Text>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>HRV</Text>
          <Text style={[styles.metricValue, { color: COLORS.primary }]}>
            {heartRate.variability}
          </Text>
          <Text style={styles.metricUnit}>ms</Text>
        </View>
      </View>

      {/* Range */}
      <View style={styles.rangeContainer}>
        <Text style={styles.rangeLabel}>HR Range:</Text>
        <View style={styles.rangeBar}>
          <View style={styles.rangeIndicator} />
        </View>
        <Text style={styles.rangeText}>
          {heartRate.min} - {heartRate.max} bpm
        </Text>
      </View>

      {/* Blood Oxygen */}
      {bloodOxygen && (
        <>
          <View style={styles.divider} />
          <View style={styles.metricRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Avg SpO2</Text>
              <Text style={[styles.metricValue, { color: COLORS.chartSpO2 }]}>
                {bloodOxygen.average}
              </Text>
              <Text style={styles.metricUnit}>%</Text>
            </View>
            
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Desaturations</Text>
              <Text style={[
                styles.metricValue, 
                { color: bloodOxygen.desaturations > 5 ? COLORS.danger : COLORS.success }
              ]}>
                {bloodOxygen.desaturations}
              </Text>
              <Text style={styles.metricUnit}>events</Text>
            </View>
          </View>

          {bloodOxygen.desaturations > 5 && (
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                ⚠️ {bloodOxygen.desaturations} oxygen desaturation events detected. This correlates with apnea episodes.
              </Text>
            </View>
          )}
        </>
      )}

      {/* Irregular beats warning */}
      {heartRate.irregularBeats > 0 && (
        <View style={[styles.warning, { borderLeftColor: COLORS.chartHeartRate }]}>
          <Text style={[styles.warningText, { color: COLORS.chartHeartRate }]}>
            💓 {heartRate.irregularBeats} irregular heartbeats detected. Consider consulting a cardiologist if this persists.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusLarge,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  title: {
    fontSize: SIZES.fontLarge,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0f1428',
    padding: SPACING.md,
    borderRadius: SIZES.radiusSmall,
    marginHorizontal: SPACING.xs,
  },
  metricLabel: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  metricUnit: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  rangeContainer: {
    marginBottom: SPACING.md,
  },
  rangeLabel: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  rangeBar: {
    height: 8,
    backgroundColor: '#0f1428',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  rangeIndicator: {
    height: '100%',
    width: '70%',
    backgroundColor: COLORS.chartHeartRate,
    marginLeft: '15%',
  },
  rangeText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: SPACING.md,
  },
  warning: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: SPACING.md,
    borderRadius: SIZES.radiusSmall,
    marginTop: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  warningText: {
    color: COLORS.danger,
    fontSize: SIZES.fontSmall,
    lineHeight: 18,
  },
});