// Base card shell — matches .mgr-card in SCSS exactly
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Spinner from '../common/Spinner';

interface MiniStat {
  value:   string;
  label:   string;
  danger?: boolean;
  sub?:    string;  // small red sub-text (e.g. late orders value)
}

interface TrendBadge {
  pct:   number;
  up:    boolean;
  good?: boolean;  // up=good (sales) vs up=bad (depreciation)
  label?: string;
}

interface Props {
  accent:    string;
  icon:      string;
  cardName:  string;
  subLabel:  string;  // 'MD_ERPModule'
  kpi:       string;
  kpiDesc:   string;
  mini:      MiniStat[];
  loading?:  boolean;
  trend?:    TrendBadge;
  compare?:  string;
  legend?:   { color: string; label: string }[];
  chart?:    React.ReactNode;
  onPress:   () => void;
  style?:    ViewStyle;
}

export default function BaseCard({
  accent, icon, cardName, subLabel, kpi, kpiDesc, mini,
  loading, trend, compare, legend, chart, onPress, style,
}: Props) {
  const { colors } = useTheme();

  const trendColor = trend
    ? ((trend.good ?? trend.up) ? '#10b981' : '#ef4444')
    : '#10b981';

  return (
    <TouchableOpacity
      style={[
        s.card,
        { backgroundColor: colors.cardBg, borderColor: colors.cardBrd },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Left accent stripe */}
      <View style={[s.stripe, { backgroundColor: accent }]} />

      {/* Loading overlay */}
      {loading && <Spinner overlay color={accent} label="جارٍ التحميل..." />}

      {/* Arrow indicator */}
      <Text style={[s.nav, { color: colors.textMuted }]}>‹</Text>

      {/* Badge: icon + name */}
      <View style={s.badge}>
        <View style={[s.iconBox, { backgroundColor: accent + '22' }]}>
          <Text style={{ fontSize: 20 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.cardName, { color: colors.text }]} numberOfLines={1}>
            {cardName}
          </Text>
          <Text style={[s.cardSub, { color: colors.textMuted }]}>{subLabel}</Text>
        </View>
      </View>

      {/* KPI */}
      <View style={s.kpiRow}>
        <Text style={[s.kpi, { color: accent }]}>{kpi}</Text>
        {trend && (
          <View style={[s.trendBadge, { backgroundColor: trendColor + '20' }]}>
            <Text style={[s.trendArrow, { color: trendColor }]}>
              {trend.up ? '▲' : '▼'}
            </Text>
            <Text style={[s.trendPct, { color: trendColor }]}>
              {trend.pct.toFixed(1)}%
            </Text>
            {trend.label && (
              <Text style={[s.trendLabel, { color: trendColor }]}>{trend.label}</Text>
            )}
          </View>
        )}
      </View>

      {/* KPI description */}
      <Text style={[s.kpiDesc, { color: colors.textMuted }]}>{kpiDesc}</Text>

      {/* Compare label */}
      {compare ? <Text style={[s.compare, { color: colors.textMuted }]}>{compare}</Text> : null}

      {/* Legend */}
      {legend?.length ? (
        <View style={s.legend}>
          {legend.map((l, i) => (
            <View key={i} style={s.legendItem}>
              <View style={[s.dot, { backgroundColor: l.color }]} />
              <Text style={[s.legendLabel, { color: colors.textMuted }]}>{l.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Sparkline chart */}
      {chart ? <View style={s.chart}>{chart}</View> : null}

      {/* Mini stats row */}
      <View style={[s.miniRow, { borderTopColor: colors.cardBrd }]}>
        {mini.map((m, i) => (
          <View key={i} style={s.mini}>
            <Text
              style={[s.miniVal, { color: m.danger ? '#ef4444' : colors.text }]}
              numberOfLines={1}
            >
              {m.value}
            </Text>
            <Text style={[s.miniLbl, { color: colors.textMuted }]} numberOfLines={1}>
              {m.label}
            </Text>
            {m.sub ? (
              <Text style={[s.miniSub, { color: '#ef4444' }]}>{m.sub}</Text>
            ) : null}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    borderWidth: 1, borderRadius: 14, padding: 16,
    marginBottom: 12, position: 'relative', overflow: 'hidden',
  },
  stripe: {
    position: 'absolute', top: 0, right: 0,
    width: 3, height: '100%', borderTopRightRadius: 14, borderBottomRightRadius: 14,
  },
  nav:      { position: 'absolute', top: 14, left: 14, fontSize: 18, opacity: 0.5 },
  badge:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, paddingLeft: 20 },
  iconBox:  { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardName: { fontSize: 13, fontWeight: '700', textAlign: 'right' },
  cardSub:  { fontSize: 10, marginTop: 1, textAlign: 'right' },
  kpiRow:   { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 3 },
  kpi:      { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  trendBadge:{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  trendArrow:{ fontSize: 9 },
  trendPct:  { fontSize: 11, fontWeight: '700' },
  trendLabel:{ fontSize: 9, fontWeight: '500', opacity: 0.85 },
  kpiDesc:  { fontSize: 11, marginBottom: 8, textAlign: 'right' },
  compare:  { fontSize: 10, marginBottom: 8, textAlign: 'right', fontStyle: 'italic' },
  legend:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  legendItem:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot:      { width: 7, height: 7, borderRadius: 4 },
  legendLabel:{ fontSize: 10 },
  chart:    { height: 60, marginBottom: 12 },
  miniRow:  { flexDirection: 'row', borderTopWidth: 1, paddingTop: 10, marginTop: 4 },
  mini:     { flex: 1, alignItems: 'center' },
  miniVal:  { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  miniLbl:  { fontSize: 9, marginTop: 2, textAlign: 'center' },
  miniSub:  { fontSize: 10, fontWeight: '600', marginTop: 3 },
});
