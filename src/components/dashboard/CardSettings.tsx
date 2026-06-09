import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Switch, Modal,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useApp }   from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import { CARD_CATALOG } from '../../constants/cardConfig';

interface Props {
  visible:  boolean;
  onClose:  () => void;
}

export default function CardSettings({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const { visibleCards, toggleCardVisibility, selectAllCards, hideAllCards, saveUserPrefs } = useApp();
  const { t } = useTranslation();

  const handleClose = async () => {
    await saveUserPrefs();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={handleClose} />
      <View style={[s.sheet, { backgroundColor: colors.cardBg, borderColor: colors.cardBrd }]}>

        {/* Header */}
        <View style={[s.header, { borderBottomColor: colors.cardBrd }]}>
          <Text style={[s.title, { color: colors.text }]}>{t('MD_PickCards')}</Text>
          <View style={s.actions}>
            <TouchableOpacity style={[s.actionBtn, { borderColor: colors.cardBrd }]} onPress={selectAllCards}>
              <Text style={[s.actionTxt, { color: colors.textMuted }]}>{t('MD_All')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, { borderColor: colors.cardBrd }]} onPress={hideAllCards}>
              <Text style={[s.actionTxt, { color: colors.textMuted }]}>{t('MD_None')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card list */}
        <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
          {CARD_CATALOG.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[s.item, { borderBottomColor: colors.cardBrd }]}
              onPress={() => toggleCardVisibility(c.key)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 18 }}>{c.icon}</Text>
              <Text style={[s.itemLabel, { color: colors.text }]}>{c.labelAr}</Text>
              <Switch
                value={visibleCards[c.key] !== false}
                onValueChange={() => toggleCardVisibility(c.key)}
                trackColor={{ true: '#4f46e5', false: colors.cardBrd }}
                thumbColor="#fff"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Done button */}
        <TouchableOpacity style={s.doneBtn} onPress={handleClose}>
          <Text style={s.doneTxt}>تم</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, maxHeight: '80%',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1,
  },
  title:     { fontSize: 15, fontWeight: '700' },
  actions:   { flexDirection: 'row', gap: 8 },
  actionBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  actionTxt: { fontSize: 11 },
  list:      { maxHeight: 420 },
  item: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    gap: 12, borderBottomWidth: 1,
  },
  itemLabel: { flex: 1, fontSize: 14, textAlign: 'right' },
  doneBtn:   { margin: 16, backgroundColor: '#4f46e5', borderRadius: 10, padding: 14, alignItems: 'center' },
  doneTxt:   { color: '#fff', fontSize: 15, fontWeight: '700' },
});
