import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Animated, TouchableWithoutFeedback, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useApp }   from '../../context/AppContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ visible, onClose }: Props) {
  const { colors, isDark, lang, toggleTheme, toggleLang } = useTheme();
  const { userName, subsidiaryID, logout } = useApp();
  const navigation = useNavigation<any>();
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleLogout = () => {
    onClose();
    setTimeout(() => {
      Alert.alert('تسجيل الخروج', 'هل تريد تسجيل الخروج؟', [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'خروج', style: 'destructive', onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ]);
    }, 300);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      {/* Drawer panel */}
      <Animated.View
        style={[s.drawer, { backgroundColor: colors.cardBg, borderColor: colors.cardBrd },
          { transform: [{ translateX: slideAnim }] }]}
      >
        {/* User info */}
        <View style={[s.userSection, { borderBottomColor: colors.cardBrd }]}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{(userName || 'م').charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[s.userName, { color: colors.text }]}>{userName || 'المدير'}</Text>
          <Text style={[s.subId, { color: colors.textMuted }]}>
            {lang === 'ar' ? `الفرع: ${subsidiaryID}` : `Branch: ${subsidiaryID}`}
          </Text>
        </View>

        {/* Options */}
        <View style={s.options}>
          {/* Dark mode toggle */}
          <TouchableOpacity
            style={[s.row, { borderBottomColor: colors.cardBrd }]}
            onPress={toggleTheme}
          >
            <Text style={{ fontSize: 22 }}>{isDark ? '🌙' : '☀️'}</Text>
            <View style={s.rowText}>
              <Text style={[s.rowTitle, { color: colors.text }]}>
                {isDark
                  ? (lang === 'ar' ? 'الوضع الداكن' : 'Dark Mode')
                  : (lang === 'ar' ? 'الوضع الفاتح' : 'Light Mode')}
              </Text>
              <Text style={[s.rowSub, { color: colors.textMuted }]}>
                {lang === 'ar' ? 'اضغط للتغيير' : 'Tap to switch'}
              </Text>
            </View>
            <View style={[s.pill, { backgroundColor: isDark ? '#4f46e5' : colors.cardBrd }]}>
              <Text style={[s.pillText, { color: isDark ? '#fff' : colors.textMuted }]}>
                {isDark ? (lang === 'ar' ? 'مفعّل' : 'ON') : (lang === 'ar' ? 'معطّل' : 'OFF')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Language toggle */}
          <TouchableOpacity
            style={[s.row, { borderBottomColor: colors.cardBrd }]}
            onPress={toggleLang}
          >
            <Text style={{ fontSize: 22 }}>🌐</Text>
            <View style={s.rowText}>
              <Text style={[s.rowTitle, { color: colors.text }]}>
                {lang === 'ar' ? 'اللغة' : 'Language'}
              </Text>
              <Text style={[s.rowSub, { color: colors.textMuted }]}>
                {lang === 'ar' ? 'العربية — اضغط للإنجليزية' : 'English — tap for Arabic'}
              </Text>
            </View>
            <View style={[s.pill, { backgroundColor: '#4f46e5' }]}>
              <Text style={[s.pillText, { color: '#fff' }]}>
                {lang === 'ar' ? 'ع' : 'EN'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={[s.logoutBtn]} onPress={handleLogout}>
          <Text style={{ fontSize: 20 }}>🚪</Text>
          <Text style={s.logoutText}>
            {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawer: {
    position: 'absolute', top: 0, bottom: 0, right: 0,
    width: 280, borderLeftWidth: 1,
    paddingTop: 60,
  },
  userSection: {
    alignItems: 'center', paddingVertical: 24,
    paddingHorizontal: 20, borderBottomWidth: 1, marginBottom: 8,
  },
  avatar:     { width: 64, height: 64, borderRadius: 32, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 28 },
  userName:   { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  subId:      { fontSize: 12 },
  options:    { flex: 1, paddingHorizontal: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1, gap: 12,
  },
  rowText:    { flex: 1 },
  rowTitle:   { fontSize: 14, fontWeight: '600' },
  rowSub:     { fontSize: 11, marginTop: 2 },
  pill:       { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  pillText:   { fontSize: 11, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    margin: 16, padding: 16, borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
});