import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface Column {
  key:      string;
  label:    string;
  flex?:    number;
  numeric?: boolean;
  accent?:  boolean; // highlight with accent color
  render?:  (val: any, row: any) => string;
}

interface Props {
  columns: Column[];
  data:    any[];
  accent?: string;
  maxHeight?: number;
}

export default function DataTable({ columns, data, accent = '#f59e0b', maxHeight = 300 }: Props) {
  const { colors } = useTheme();
  const s = styles(colors, accent);

  if (!data?.length) return null;

  return (
    <ScrollView style={{ maxHeight }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[s.th, { flex: col.flex ?? 1 }]}
            numberOfLines={1}
          >
            {col.label}
          </Text>
        ))}
      </View>

      {/* Rows */}
      {data.map((row, i) => (
        <View
          key={i}
          style={[s.row, i < data.length - 1 && s.rowBorder]}
        >
          {columns.map((col) => {
            const raw = row[col.key];
            const val = col.render ? col.render(raw, row) : (raw ?? '—');
            return (
              <Text
                key={col.key}
                style={[
                  s.td,
                  { flex: col.flex ?? 1 },
                  col.numeric && s.tdNum,
                  col.accent  && { color: accent, fontWeight: '600' },
                ]}
                numberOfLines={1}
              >
                {String(val)}
              </Text>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = (colors: any, accent: string) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBrd,
    marginBottom: 4,
  },
  th: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rowBorder ?? 'rgba(255,255,255,0.04)',
  },
  td: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  tdNum: {
    fontWeight: '600',
  },
});
