import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function EmptyState({ message }: { message: string }) {
  const { colors } = useTheme();
  return (
    <View style={s.wrap}>
      <Text style={[s.text, { color: colors.textMuted }]}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingVertical: 20, alignItems: 'center' },
  text: { fontSize: 12 },
});
