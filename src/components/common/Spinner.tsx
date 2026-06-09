import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  size?:    'small' | 'large';
  color?:   string;
  label?:   string;
  overlay?: boolean;
}

export default function Spinner({ size = 'large', color, label, overlay }: Props) {
  const { colors } = useTheme();
  const c = color ?? '#4f46e5';

  if (overlay) {
    return (
      <View style={[s.overlay, { backgroundColor: 'rgba(22,27,34,0.78)' }]}>
        <ActivityIndicator size={size} color={c} />
        {label ? <Text style={[s.label, { color: colors.textMuted }]}>{label}</Text> : null}
      </View>
    );
  }

  return (
    <View style={s.center}>
      <ActivityIndicator size={size} color={c} />
      {label ? <Text style={[s.label, { color: colors.textMuted }]}>{label}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    zIndex: 5,
    gap: 10,
  },
  center:  { justifyContent: 'center', alignItems: 'center', padding: 20, gap: 10 },
  label:   { fontSize: 11, fontWeight: '500' },
});
