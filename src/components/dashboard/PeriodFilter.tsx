import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useApp }   from '../../context/AppContext';
import { useTranslation } from 'react-i18next';

export default function PeriodFilter() {
  const { colors } = useTheme();
  const { selectedPeriod, selectPeriod } = useApp();
  const { t } = useTranslation();

  const periods = [
    { value: 1, label: t('MD_ThisMonth') },
    { value: 2, label: t('MD_ThisQuarter') },
    { value: 3, label: t('MD_CurrentYear') },
    { value: 4, label: t('MD_PreviousYear') },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.row}
      style={{ paddingHorizontal: 16, marginBottom: 12 }}
    >
      {periods.map((p) => {
        const active = selectedPeriod === p.value;
        return (
          <TouchableOpacity
            key={p.value}
            style={[
              s.btn,
              { borderColor: active ? '#4f46e5' : colors.cardBrd, backgroundColor: active ? '#4f46e5' : colors.cardBg },
            ]}
            onPress={() => selectPeriod(p.value)}
            activeOpacity={0.7}
          >
            <Text style={[s.label, { color: active ? '#fff' : colors.textMuted }]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  btn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  label: { fontSize: 12, fontWeight: '600' },
});
