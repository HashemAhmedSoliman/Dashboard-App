// Base popup shell — full-screen modal, matches mgr-popup--v2 in SCSS
import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Modal, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface Props {
  visible:    boolean;
  onClose:    () => void;
  title:      string;
  subtitle:   string;
  icon:       string;
  accent:     string;
  accentDark: string;
  loading?:   boolean;
  children:   React.ReactNode;
}

export default function BasePopup({
  visible, onClose, title, subtitle, icon,
  accent, accentDark, loading, children,
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]}>

        {/* Header */}
        <LinearGradient
          colors={[accent + '30', accent + '08']}
          style={[s.header, { borderBottomColor: accent + '55' }]}
        >
          <View style={s.headerLeft}>
            <LinearGradient colors={[accent, accentDark]} style={s.iconBox}>
              <Text style={{ fontSize: 22 }}>{icon}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[s.title, { color: colors.text }]} numberOfLines={1}>
                {title}
              </Text>
              <Text style={[s.sub, { color: colors.textMuted }]} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[s.closeBtn, { borderColor: colors.cardBrd }]}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[s.closeTxt, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Body */}
        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color={accent} />
            <Text style={[s.loadingTxt, { color: colors.textMuted }]}>
              {t('MD_LoadingData')}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={s.body}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        )}

      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconBox:    { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  title:      { fontSize: 20, fontWeight: '800', textAlign: 'right' },
  sub:        { fontSize: 12, marginTop: 3, textAlign: 'right' },
  closeBtn:   { width: 36, height: 36, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  closeTxt:   { fontSize: 13 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingTxt: { fontSize: 13 },
  body:       { padding: 16, paddingBottom: 40 },
});
