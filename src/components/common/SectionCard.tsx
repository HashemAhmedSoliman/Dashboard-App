// Reusable section wrapper used inside popups (matches mgr-popup-v2__section)
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  title:    string;
  children: React.ReactNode;
  style?:   ViewStyle;
}

export default function SectionCard({ title, children, style }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[{ backgroundColor: colors.cardBg, borderColor: colors.cardBrd, borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 14 }, style]}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'right', marginBottom: 12 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}
