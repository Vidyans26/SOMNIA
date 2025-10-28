// components/PositionChart.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SleepPositions } from '../types';
import { COLORS, SIZES, SPACING } from '../constants/theme';

interface PositionChartProps {
  positions: SleepPositions;
}

export const PositionChart: React.FC<PositionChartProps> = ({ positions }) => {
  const renderBar = (label: string, emoji: string, percentage: number, color: string) => (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{emoji} {label}</Text>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: `${percentage}%`, backgroundColor: color }]}>
          <Text style={styles.barText}>{percentage}%</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Position Breakdown</Text>
      
      {renderBar('Back', '🛏️', positions.back, COLORS.chartBack)}
      {renderBar('Side', '🧘', positions.side, COLORS.chartSide)}
      {renderBar('Stomach', '😴', positions.stomach, COLORS.chartStomach)}

      {positions.back > 50 && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ You spent {positions.back}% of time on your back. This can worsen sleep apnea. Try side sleeping.
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
  barRow: {
    marginBottom: SPACING.md,
  },
  barLabel: {
    fontSize: SIZES.fontMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  barContainer: {
    height: 30,
    backgroundColor: '#0f1428',
    borderRadius: SIZES.radiusSmall,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    justifyContent: 'center',
    paddingLeft: SPACING.sm,
    minWidth: 60,
  },
  barText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontSmall,
    fontWeight: 'bold',
  },
  warning: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: SPACING.md,
    borderRadius: SIZES.radiusSmall,
    marginTop: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.chartBack,
  },
  warningText: {
    color: COLORS.chartBack,
    fontSize: SIZES.fontSmall,
    lineHeight: 18,
  },
});