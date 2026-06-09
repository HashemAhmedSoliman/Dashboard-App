import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Dimensions, Animated, NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// ─── Shared Arrow Logo ───────────────────────────────────────────────────────
function ArrowLogo({ color = '#4f46e5' }: { color?: string }) {
  const arrows = [useRef(new Animated.Value(0)).current,
                  useRef(new Animated.Value(0)).current,
                  useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const anims = arrows.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(anim, { toValue: -8, duration: 600, useNativeDriver: true }),
          Animated.timing(anim, { toValue:  8, duration: 600, useNativeDriver: true }),
          Animated.timing(anim, { toValue:  0, duration: 600, useNativeDriver: true }),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', height: 48 }}>
      {arrows.map((anim, i) => (
        <Animated.Text key={i} style={{ fontSize: 22, color, transform: [{ translateY: anim }] }}>
          {i === 1 ? '↓' : '↑'}
        </Animated.Text>
      ))}
    </View>
  );
}

// ─── Bar Chart Logo ────────────────────────────────────────────────────────
function BarLogo({ color = '#4f46e5' }: { color?: string }) {
  const heights = [useRef(new Animated.Value(24)).current,
                   useRef(new Animated.Value(36)).current,
                   useRef(new Animated.Value(16)).current,
                   useRef(new Animated.Value(28)).current];

  useEffect(() => {
    const targets = [36, 20, 32, 16];
    const anims = heights.map((h, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(h, { toValue: targets[i], duration: 700, useNativeDriver: false }),
          Animated.timing(h, { toValue: 24 - i * 2, duration: 700, useNativeDriver: false }),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'flex-end', height: 48, justifyContent: 'center' }}>
      {heights.map((h, i) => (
        <Animated.View key={i} style={{
          width: 10, borderRadius: 3,
          backgroundColor: color,
          opacity: 0.7 + i * 0.08,
          height: h,
        }} />
      ))}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DESIGN 1 — Pure Minimal Float
// ══════════════════════════════════════════════════════════════════════════════
function Design1() {
  const cardY = useRef(new Animated.Value(40)).current;
  const cardO = useRef(new Animated.Value(0)).current;
  const shadowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardY, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(cardO, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shadowPulse, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(shadowPulse, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const shadowRadius = shadowPulse.interpolate({ inputRange: [0, 1], outputRange: [12, 28] });
  const shadowOpacity = shadowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.18] });

  return (
    <View style={[s.page, { backgroundColor: '#f1f5f9' }]}>
      <Text style={s.designLabel}>١ — Pure Minimal</Text>
      <Animated.View style={[s1.card, {
        transform: [{ translateY: cardY }], opacity: cardO,
        shadowRadius, shadowOpacity,
      }]}>
        <ArrowLogo color="#4f46e5" />
        <Text style={s1.title}>Manager Dashboard</Text>
        <Text style={s1.sub}>لوحة تحكم المدير</Text>
        <View style={s1.divider} />
        <Text style={s1.label}>الدومين</Text>
        <View style={s1.underlineInput}><Text style={s1.placeholder}>مثال: sismatix</Text></View>
        <Text style={s1.label}>اسم المستخدم</Text>
        <View style={s1.underlineInput}><Text style={s1.placeholder}>أدخل اسم المستخدم</Text></View>
        <Text style={s1.label}>كلمة المرور</Text>
        <View style={s1.underlineInput}><Text style={s1.placeholder}>••••••••</Text></View>
        <TouchableOpacity style={s1.btn}>
          <Text style={s1.btnText}>تسجيل الدخول</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s1 = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 28, width: width - 48,
    shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20, elevation: 10,
  },
  title:    { fontSize: 20, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginTop: 8 },
  sub:      { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 16 },
  divider:  { height: 1, backgroundColor: '#f1f5f9', marginBottom: 20 },
  label:    { fontSize: 11, color: '#94a3b8', textAlign: 'right', marginBottom: 4, marginTop: 12 },
  underlineInput: {
    borderBottomWidth: 1.5, borderBottomColor: '#e2e8f0',
    paddingBottom: 8, alignItems: 'flex-end',
  },
  placeholder: { color: '#cbd5e1', fontSize: 14 },
  btn: {
    marginTop: 24, backgroundColor: '#4f46e5',
    borderRadius: 12, padding: 15, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

// ══════════════════════════════════════════════════════════════════════════════
// DESIGN 2 — Soft Glow Float (dot background)
// ══════════════════════════════════════════════════════════════════════════════
function Design2() {
  const cardY = useRef(new Animated.Value(40)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardY, { toValue: 0, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2500, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2500, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1], outputRange: ['rgba(99,102,241,0.08)', 'rgba(99,102,241,0.22)'],
  });

  return (
    <View style={[s.page, { backgroundColor: '#f0f4ff' }]}>
      {/* Dot pattern */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: 12 }).map((_, row) =>
          Array.from({ length: 8 }).map((__, col) => (
            <View key={`${row}-${col}`} style={{
              position: 'absolute', width: 3, height: 3, borderRadius: 2,
              backgroundColor: '#c7d2fe',
              top: row * 55 + 20, left: col * 48 + 20,
            }} />
          ))
        )}
      </View>
      <Text style={s.designLabel}>٢ — Soft Glow</Text>
      <Animated.View style={[s2.card, { transform: [{ translateY: cardY }], shadowColor: glowColor as any }]}>
        <BarLogo color="#6366f1" />
        <Text style={s2.title}>Manager Dashboard</Text>
        <Text style={s2.sub}>لوحة تحكم المدير</Text>
        {[' الدومين', ' اسم المستخدم', ' كلمة المرور'].map((label, i) => (
          <View key={i} style={s2.fieldRow}>
            <View style={s2.dot} />
            <View style={s2.fieldInner}>
              <Text style={s2.fieldLabel}>{label}</Text>
              <Text style={s2.fieldPlaceholder}>
                {i === 2 ? '••••••••' : i === 0 ? 'sismatix' : 'أدخل...'}
              </Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={s2.btn}>
          <Text style={s2.btnText}>تسجيل الدخول  →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s2 = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    width: width - 48,
    shadowOffset: { width: 0, height: 8 }, shadowRadius: 30, elevation: 14,
  },
  title:    { fontSize: 19, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginTop: 8 },
  sub:      { fontSize: 12, color: '#a5b4fc', textAlign: 'center', marginBottom: 20 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  dot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: '#818cf8', marginLeft: 10 },
  fieldInner: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#e0e7ff', paddingBottom: 6 },
  fieldLabel: { fontSize: 10, color: '#a5b4fc', textAlign: 'right' },
  fieldPlaceholder: { fontSize: 14, color: '#c7d2fe', textAlign: 'right' },
  btn: {
    marginTop: 20, backgroundColor: '#6366f1',
    borderRadius: 14, padding: 15, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

// ══════════════════════════════════════════════════════════════════════════════
// DESIGN 3 — Floating Glass
// ══════════════════════════════════════════════════════════════════════════════
function Design3() {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const cardO = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardO, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -7, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue:  7, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient colors={['#667eea', '#764ba2', '#5b4fcf']} style={s.page}>
      <Text style={[s.designLabel, { color: 'rgba(255,255,255,0.7)' }]}>٣ — Floating Glass</Text>
      <Animated.View style={[s3.card, {
        opacity: cardO,
        transform: [{ translateY: floatAnim }],
      }]}>
        <ArrowLogo color="#fff" />
        <Text style={s3.title}>Manager Dashboard</Text>
        <Text style={s3.sub}>لوحة تحكم المدير</Text>
        <View style={s3.divider} />
        {['الدومين', 'اسم المستخدم', 'كلمة المرور'].map((label, i) => (
          <View key={i} style={s3.inputWrap}>
            <Text style={s3.placeholder}>
              {i === 2 ? '••••••••' : `أدخل ${label}`}
            </Text>
          </View>
        ))}
        <TouchableOpacity style={s3.btn}>
          <Text style={s3.btnText}>تسجيل الدخول</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const s3 = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 24, padding: 28,
    width: width - 48,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowRadius: 40, shadowOpacity: 0.3, elevation: 20,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center', marginTop: 8 },
  sub:   { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 16 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 16 },
  inputWrap: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12, padding: 13, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'flex-end',
  },
  placeholder: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  btn: {
    marginTop: 16, backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 14, padding: 15, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

// ══════════════════════════════════════════════════════════════════════════════
// SHOWCASE — swipeable
// ══════════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  page:        { width, height, justifyContent: 'center', alignItems: 'center' },
  designLabel: { position: 'absolute', top: 60, fontSize: 13, color: '#94a3b8', fontWeight: '600' },
  dotRow:      { flexDirection: 'row', gap: 8, position: 'absolute', bottom: 40 },
  dot:         { width: 8, height: 8, borderRadius: 4 },
});

export default function LoginShowcase() {
  const [page, setPage] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = Math.round(e.nativeEvent.contentOffset.x / width);
    setPage(p);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        <Design1 />
        <Design2 />
        <Design3 />
      </ScrollView>

      {/* Page dots */}
      <View style={[s.dotRow, { bottom: 40, alignSelf: 'center', position: 'absolute' }]}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[s.dot, {
            backgroundColor: page === i ? '#4f46e5' : '#cbd5e1',
            width: page === i ? 20 : 8,
          }]} />
        ))}
      </View>
    </View>
  );
}