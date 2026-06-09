import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useApp }   from '../../context/AppContext';
import ProfileDrawer from './ProfileDrawer';

interface Props {
  onToggleSettings: () => void;
  onToggleTheme:    () => void;
  onToggleLang:     () => void;
}

export default function DashboardHeader({ onToggleSettings }: Props) {
  const { colors, lang } = useTheme();
  const { userName, visibleCards, cardOrder } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const today = new Date();
  const dateStr = today.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const visibleCount = Object.values(visibleCards).filter(Boolean).length;
  const totalCount   = cardOrder.length;

  return (
    <>
      <View style={[s.container, { backgroundColor: colors.bg, borderBottomColor: colors.cardBrd }]}>
        {/* Top row */}
        <View style={s.topRow}>
          {/* Avatar + greeting — tap to open drawer */}
          <TouchableOpacity style={s.userArea} onPress={() => setDrawerOpen(true)} activeOpacity={0.7}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{(userName || 'م').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={s.greeting}>
              <Text style={[s.name, { color: colors.text }]}>
                {lang === 'ar' ? `أهلاً، ${userName || 'المدير'}` : `Hello, ${userName || 'Manager'}`}
              </Text>
              <Text style={[s.date, { color: colors.textMuted }]}>{dateStr}</Text>
            </View>
          </TouchableOpacity>

          {/* Settings button only */}
          <TouchableOpacity
            style={[s.settingsBtn, { borderColor: colors.cardBrd, backgroundColor: colors.bg }]}
            onPress={onToggleSettings}
          >
            <Text style={{ fontSize: 14 }}>⚙️</Text>
            <View style={s.badge}>
              <Text style={s.badgeText}>{visibleCount}/{totalCount}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Page title */}
        <View style={s.titleRow}>
          <Text style={[s.pageTitle, { color: colors.text }]}>
            {lang === 'ar' ? 'موديولات النظام' : 'System Modules'}
          </Text>
          <Text style={[s.pageSub, { color: colors.textMuted }]}>
            {lang === 'ar'
              ? 'كل كارت بيعرض ملخص موديول — اضغط للتفاصيل'
              : 'Each card shows a module summary — tap for details'}
          </Text>
        </View>
      </View>

      <ProfileDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const s = StyleSheet.create({
  container:  { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1 },
  topRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userArea:   { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  avatar:     { width: 38, height: 38, borderRadius: 19, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  greeting:   { flex: 1 },
  name:       { fontSize: 14, fontWeight: '700' },
  date:       { fontSize: 10, marginTop: 2 },
  settingsBtn:{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  badge:      { backgroundColor: 'rgba(79,70,229,0.2)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText:  { color: '#818cf8', fontSize: 10, fontWeight: '700' },
  titleRow:   {},
  pageTitle:  { fontSize: 18, fontWeight: '800', textAlign: 'right' },
  pageSub:    { fontSize: 11, marginTop: 2, textAlign: 'right' },
});