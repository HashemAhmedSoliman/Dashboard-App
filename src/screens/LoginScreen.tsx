import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Animated, Image, ScrollView,
} from 'react-native';
import Svg, { Rect, Polyline, G } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp }   from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { setAuthToken } from '../api/apiClient';
import { Login, GetSubsidiaryByUser } from '../api/dashboardService';
import { RootStackParamList } from '../navigation/AppNavigator';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);
const AnimatedG        = Animated.createAnimatedComponent(G);

type Nav = StackNavigationProp<RootStackParamList, 'Login'>;

const ACCENT = '#38bdf8';
const ACCENT_LIGHT = '#e0f2fe';
const BG = '#f0f9ff';

// ── Animated stock chart logo — memo لمنع إعادة الرسم ────────────────────
const StockLogo = React.memo(function StockLogo() {
  // الخط + رأس السهم في animation واحدة متصلة (dasharray = طول الخط الكلي)
  const dash    = useRef(new Animated.Value(170)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = () => {
      dash.setValue(170);
      fadeOut.setValue(1);
      Animated.sequence([
        Animated.timing(dash,    { toValue: 0,   duration: 2200, useNativeDriver: false }),
        Animated.delay(700),
        Animated.timing(fadeOut, { toValue: 0,   duration: 220,  useNativeDriver: false }),
        Animated.delay(250),
      ]).start(() => loop());
    };
    loop();
  }, []);

  return (
    <View style={logo.wrap}>
      <Svg viewBox="0 -26 104 94" width={110} height={82}>
        {/* ── أعمدة ثابتة دائماً ── */}
        <Rect x="2"  y="58" width="10" height="10" rx="2" fill={ACCENT} fillOpacity={0.22}/>
        <Rect x="16" y="50" width="10" height="18" rx="2" fill={ACCENT} fillOpacity={0.35}/>
        <Rect x="30" y="40" width="10" height="28" rx="2" fill={ACCENT} fillOpacity={0.48}/>
        <Rect x="44" y="30" width="10" height="38" rx="2" fill={ACCENT} fillOpacity={0.62}/>
        <Rect x="58" y="18" width="10" height="50" rx="2" fill={ACCENT} fillOpacity={0.82}/>

        {/* ── خط متحرك يرسم نفسه ── */}
        {/* خط + رأس السهم كـ polyline واحدة — animation واحدة متصلة */}
        <AnimatedG transform="translate(-14, -16)" opacity={fadeOut}>
          <AnimatedPolyline
            points="5,53 15,40 25,46 35,33 45,39 55,26 65,32 75,19 85,25 95,8 83,8 95,8 95,20"
            stroke={ACCENT} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            fill="none"
            strokeDasharray="170"
            strokeDashoffset={dash}
          />
        </AnimatedG>
      </Svg>
    </View>
  );
});

const logo = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 8 },
});

// ── Input field component ─────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, secure = false, dir = 'rtl', dark = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; secure?: boolean; dir?: string; dark?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const shadow = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.parallel([
      Animated.spring(scale,  { toValue: 1.015, useNativeDriver: false, tension: 200, friction: 10 }),
      Animated.timing(shadow, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.parallel([
      Animated.spring(scale,  { toValue: 1, useNativeDriver: false, tension: 200, friction: 10 }),
      Animated.timing(shadow, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const shadowOpacity = shadow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] });
  const shadowRadius  = shadow.interpolate({ inputRange: [0, 1], outputRange: [0, 14] });

  const inputAlign = dir === 'rtl' ? 'right' : 'left';
  const labelAlign = dir === 'rtl' ? 'left' : 'right';

  const bgFocused   = dark ? '#0c2a40' : '#fff';
  const bgUnfocused = dark ? '#0e2233' : '#e0f2fe';
  const textColor   = dark ? '#7dd3fc' : '#0369a1';
  const labelColor  = dark ? '#2e6a8a' : '#64748b';

  return (
    <View style={f.wrap}>
      <Text style={[f.label, { textAlign: labelAlign, color: labelColor }]}>{label}</Text>
      <Animated.View style={[f.box, {
        transform: [{ scale }],
        shadowOpacity,
        shadowRadius,
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 4 },
        elevation: focused ? 6 : 0,
        backgroundColor: focused ? bgFocused : bgUnfocused,
      }]}>
        <TextInput
          style={[f.input, { textAlign: inputAlign, color: textColor }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={dark ? '#1e5a7a' : '#7dd3fc'}
          secureTextEntry={secure}
          autoCapitalize="none"
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </Animated.View>
    </View>
  );
}

const f = StyleSheet.create({
  wrap:  { marginBottom: 18 },
  label: { fontSize: 11, marginBottom: 7 },
  box:   { borderRadius: 12, overflow: 'hidden' },
  input: { padding: 15, fontSize: 14 },
});

// ── Main LoginScreen ──────────────────────────────────────────────────────
export default function LoginScreen() {
  const { setAuth }         = useApp();
  const { lang, toggleLang, theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const navigation           = useNavigation<Nav>();
  const isAr = lang === 'ar';

  const [company,  setCompany]  = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  // Card entrance
  const cardY = useRef(new Animated.Value(40)).current;
  const cardO = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardY, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(cardO, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      const resp = await Login(username.trim(), password.trim(), company.trim() || undefined);
      if (resp?.result === true && resp?.token) {
        await setAuthToken(resp.token);
        try {
          const subs = await GetSubsidiaryByUser();
          const subId = Array.isArray(subs) && subs.length > 0 ? (subs[0].id ?? subs[0].Id ?? 0) : 0;
          setAuth(subId, resp.user?.userName ?? resp.user?.name ?? resp.user?.Name ?? username);
        } catch {
          setAuth(0, resp.user?.userName ?? resp.user?.name ?? username);
        }
        navigation.replace('Dashboard');
      } else {
        Alert.alert('خطأ', resp?.msg ?? 'بيانات الدخول غير صحيحة');
      }
    } catch {
      Alert.alert('خطأ في الاتصال', 'تعذّر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const dir = isAr ? 'rtl' : 'ltr';

  const rootBg   = isDark ? '#07111a' : BG;
  const cardBg   = isDark ? '#0d1f2d' : '#fff';
  const titleC   = isDark ? '#bae6fd' : '#0c4a6e';
  const dividerC = isDark ? 'rgba(56,189,248,0.2)' : ACCENT_LIGHT;

  return (
    <View style={[s.root, { backgroundColor: rootBg }]}>

      {/* ── لوجو الشركة في الخلفية — شفاف ── */}
      <Image
        source={require('../../assets/logo.png') as any}
        style={s.bgLogo}
        resizeMode="contain"
      />

      {/* ── زر الدارك مود — يسار ── */}
      <TouchableOpacity style={s.themeBtn} onPress={toggleTheme}>
        <Text style={s.langText}>{isDark ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>

      {/* ── زر تغيير اللغة — يمين ── */}
      <TouchableOpacity style={s.langBtn} onPress={toggleLang}>
        <Text style={s.langText}>{isAr ? 'EN' : 'ع'}</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.inner}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <Animated.View style={[s.card, {
          backgroundColor: cardBg,
          transform: [{ translateY: cardY }],
          opacity: cardO,
        }]}>
          <StockLogo />

          <Text style={[s.title, { color: titleC }]}>Manager Dashboard</Text>
          <Text style={s.sub}>{isAr ? 'لوحة تحكم المدير' : 'ERP Manager Dashboard'}</Text>

          <View style={[s.divider, { backgroundColor: dividerC }]} />

          <Field
            label={isAr ? 'اسم الشركة (اختياري)' : 'Company (optional)'}
            value={company}
            onChange={setCompany}
            placeholder={isAr ? 'أدخل اسم الشركة' : 'Enter company name'}
            dir={dir}
            dark={isDark}
          />
          <Field
            label={isAr ? 'اسم المستخدم' : 'Username'}
            value={username}
            onChange={setUsername}
            placeholder={isAr ? 'أدخل اسم المستخدم' : 'Enter username'}
            dir={dir}
            dark={isDark}
          />
          <Field
            label={isAr ? 'كلمة المرور' : 'Password'}
            value={password}
            onChange={setPassword}
            placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter password'}
            secure
            dir={dir}
            dark={isDark}
          />

          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>{isAr ? 'تسجيل الدخول' : 'Sign In'}</Text>
            }
          </TouchableOpacity>
        </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: BG },
  inner: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  bgLogo: {
    position: 'absolute',
    width: 320, height: 320,
    alignSelf: 'center',
    top: '50%', marginTop: -160,
    opacity: 0.04,
    tintColor: '#8b5cf6',
  },
  langBtn: {
    position: 'absolute',
    top: 56, right: 20,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    zIndex: 10,
  },
  themeBtn: {
    position: 'absolute',
    top: 56, left: 20,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    zIndex: 10,
  },
  langText: { color: ACCENT, fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 32,
    paddingBottom: 36,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 12,
  },
  title:   { fontSize: 20, fontWeight: '800', color: '#0c4a6e', textAlign: 'center', marginTop: 4 },
  sub:     { fontSize: 12, color: '#38bdf8', textAlign: 'center', marginTop: 3, marginBottom: 6 },
  divider: { height: 1, backgroundColor: ACCENT_LIGHT, marginVertical: 20 },
  btn: {
    marginTop: 12,
    backgroundColor: ACCENT,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});