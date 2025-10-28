// components/MetricCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';

interface MetricCardProps {
  emoji: string;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  emoji,
  label,
  value,
  subtext,
  color = COLORS.primary,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {emoji} {label}
      </Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
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
  label: {
    fontSize: SIZES.fontMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  value: {
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  subtext: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});