import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useApp }   from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import { getDailyBrief, DailyBriefItem } from '../../api/aiService';
import { BriefColors } from '../../constants/colors';

const THROTTLE_MINUTES = 240; // 4 hours — matches backend

interface Props {
  onModulePress: (module: string) => void;
}

export default function DailyBrief({ onModulePress }: Props) {
  const { colors, lang } = useTheme();
  const { subsidiaryID }  = useApp();
  const { t } = useTranslation();

  const [items,       setItems]       = useState<DailyBriefItem[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [ageMinutes,  setAgeMinutes]  = useState<number | null>(null);
  const [lastFetch,   setLastFetch]   = useState<Date | null>(null);
  const [showThrottle,setShowThrottle]= useState(false);
  const throttleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isBriefThrottled = (): boolean => {
    if (!lastFetch) return false;
    const diff = (Date.now() - lastFetch.getTime()) / 60000;
    return diff < THROTTLE_MINUTES;
  };

  const briefAgeLabel = (): string => {
    if (ageMinutes == null) return '';
    if (ageMinutes < 1)   return lang === 'ar' ? 'الآن' : 'Just now';
    if (ageMinutes < 60)  return lang === 'ar' ? `منذ ${Math.floor(ageMinutes)} دقيقة` : `${Math.floor(ageMinutes)}m ago`;
    return lang === 'ar' ? `منذ ${Math.floor(ageMinutes / 60)} ساعة` : `${Math.floor(ageMinutes / 60)}h ago`;
  };

  const refreshAvailableIn = (): string => {
    if (!lastFetch) return '';
    const remaining = THROTTLE_MINUTES - (Date.now() - lastFetch.getTime()) / 60000;
    const h = Math.floor(remaining / 60);
    const m = Math.ceil(remaining % 60);
    return lang === 'ar'
      ? `التحديث متاح بعد ${h > 0 ? h + 'س ' : ''}${m}د`
      : `Refresh available in ${h > 0 ? h + 'h ' : ''}${m}m`;
  };

  const fetchBrief = async (force = false) => {
    if (loading) return;
    if (!force && isBriefThrottled()) {
      setShowThrottle(true);
      if (throttleTimer.current) clearTimeout(throttleTimer.current);
      throttleTimer.current = setTimeout(() => setShowThrottle(false), 3000);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resp = await getDailyBrief(subsidiaryID, lang, force);
      if (resp?.success && resp.items?.length) {
        setItems(resp.items);
        setAgeMinutes(resp.ageminutes ?? 0);
        setLastFetch(new Date());
      } else {
        setError(lang === 'ar' ? 'تعذّر تحميل الموجز' : 'Failed to load brief');
      }
    } catch {
      setError(lang === 'ar' ? 'خطأ في الاتصال' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subsidiaryID) fetchBrief();
  }, [subsidiaryID, lang]);

  if (!items.length && !loading && !error) return null;

  const borderColor = (type: DailyBriefItem['type']) => BriefColors[type] ?? BriefColors.info;

  return (
    <LinearGradient
      colors={['rgba(99,102,241,0.08)', 'rgba(99,102,241,0.02)']}
      style={[s.container, { borderColor: 'rgba(99,102,241,0.25)' }]}
    >
      {/* Header */}
      <View style={s.head}>
        <View style={s.titleRow}>
          <Text style={{ fontSize: 18 }}>🌅</Text>
          <Text style={[s.titleText, { color: colors.text }]}>{t('MD_TodaysBrief')}</Text>
          {ageMinutes != null && (
            <Text style={[s.age, { color: colors.textMuted }]}>— {briefAgeLabel()}</Text>
          )}
        </View>

        <View>
          <TouchableOpacity
            style={[
              s.refreshBtn,
              isBriefThrottled() && !loading && s.refreshThrottled,
            ]}
            onPress={() => fetchBrief(true)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 14 }}>{loading ? '⏳' : '↻'}</Text>
            <Text style={[s.refreshTxt, { color: isBriefThrottled() ? '#6e7681' : '#c7d2fe' }]}>
              {t('MD_Refresh')}
            </Text>
          </TouchableOpacity>

          {showThrottle && (
            <View style={[s.throttleMsg, { backgroundColor: colors.cardBg }]}>
              <Text style={[s.throttleTxt, { color: colors.text }]}>
                🔒 {refreshAvailableIn()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Skeleton */}
      {loading && !items.length && (
        <View style={s.items}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[s.skelItem, { backgroundColor: 'rgba(255,255,255,0.02)' }]}>
              <View style={s.skelIcon} />
              <View style={s.skelText} />
            </View>
          ))}
        </View>
      )}

      {/* Error */}
      {!!error && !loading && (
        <Text style={[s.error, { color: '#f59e0b' }]}>⚠️ {error}</Text>
      )}

      {/* Items */}
      {items.length > 0 && (
        <ScrollView style={s.items} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {items.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[
                s.item,
                { borderRightColor: borderColor(item.type), borderRightWidth: 3 },
                !!item.module && s.itemClickable,
              ]}
              onPress={() => item.module && onModulePress(item.module)}
              activeOpacity={item.module ? 0.7 : 1}
              disabled={!item.module}
            >
              <Text style={s.itemIcon}>{item.icon}</Text>
              <Text style={[s.itemText, { color: colors.text }]}>{item.text}</Text>
              {!!item.module && (
                <Text style={[s.arrow, { color: colors.textMuted }]}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: {
    marginHorizontal: 16, marginBottom: 14,
    borderWidth: 1, borderRadius: 14, padding: 14,
  },
  head:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  titleRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleText: { fontSize: 14, fontWeight: '700' },
  age:       { fontSize: 11, fontWeight: '400' },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
  },
  refreshThrottled: {
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  refreshTxt:   { fontSize: 12, fontWeight: '600' },
  throttleMsg: {
    position: 'absolute', top: 38, right: 0, zIndex: 10,
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.45)',
    borderRadius: 8, padding: 8, minWidth: 180,
  },
  throttleTxt:  { fontSize: 12, fontWeight: '600' },
  items:        { maxHeight: 240, gap: 6 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10, marginBottom: 6,
  },
  itemClickable:{ opacity: 1 },
  itemIcon:     { fontSize: 16, flexShrink: 0 },
  itemText:     { flex: 1, fontSize: 13, lineHeight: 20 },
  arrow:        { fontSize: 18, fontWeight: '700' },
  error:        { fontSize: 13, padding: 8 },
  skelItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: 10, marginBottom: 6, height: 42,
  },
  skelIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
  skelText: { flex: 1, height: 12, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)' },
});
