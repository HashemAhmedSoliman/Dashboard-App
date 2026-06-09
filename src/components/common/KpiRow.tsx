// Popup KPI row (matches mgr-popup-v2__kpis grid)
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface KpiItem {
  label:   string;
  value:   string;
  primary?: boolean;
  change?:  { pct: number; up: boolean };
}

export default function KpiRow({ items, accent }: { items: KpiItem[]; accent: string }) {
  const { colors } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {items.map((kpi, i) => (
          <View
            key={i}
            style={[
              styles.box,
              { backgroundColor: colors.cardBg, borderColor: kpi.primary ? accent + '66' : colors.cardBrd },
              kpi.primary && { backgroundColor: accent + '12' },
            ]}
          >
            <Text style={[styles.label, { color: colors.textMuted }]}>{kpi.label}</Text>
            <Text style={[styles.val, { color: kpi.primary ? accent : colors.text }]}>
              {kpi.value}
            </Text>
            {kpi.change && (
              <Text style={[styles.chg, { color: kpi.change.up ? '#22c55e' : '#ef4444' }]}>
                {kpi.change.up ? '▲' : '▼'} {kpi.change.pct.toFixed(1)}%
              </Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  box:   { width: 150, borderWidth: 1, borderRadius: 12, padding: 14 },
  label: { fontSize: 11, marginBottom: 8, textAlign: 'right' },
  val:   { fontSize: 22, fontWeight: '900', textAlign: 'right', letterSpacing: -0.5 },
  chg:   { fontSize: 11, fontWeight: '700', marginTop: 4, textAlign: 'right' },
});
