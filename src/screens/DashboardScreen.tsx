import React, { useEffect, useRef, useState } from 'react';
import {
  View, ScrollView, StyleSheet, SafeAreaView,
  RefreshControl, TextInput, TouchableOpacity, Text,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp }   from '../context/AppContext';
import { useTranslation } from 'react-i18next';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import PeriodFilter    from '../components/dashboard/PeriodFilter';
import CardSettings    from '../components/dashboard/CardSettings';
import DailyBrief      from '../components/brief/DailyBrief';
import AIChat          from '../components/ai/AIChat';

import SalesCard       from '../components/cards/SalesCard';
import PurchasesCard   from '../components/cards/PurchasesCard';
import InventoryCard   from '../components/cards/InventoryCard';
import FinancialCard   from '../components/cards/FinancialCard';
import AssetsCard      from '../components/cards/AssetsCard';
import ProductionCard  from '../components/cards/ProductionCard';
import CRMCard         from '../components/cards/CRMCard';
import ContractsCard   from '../components/cards/ContractsCard';
import ContractorCard  from '../components/cards/ContractorCard';
import TaxesCard       from '../components/cards/TaxesCard';
import REMarketingCard from '../components/cards/REMarketingCard';
import REMgmtCard      from '../components/cards/REMgmtCard';
import HRCard          from '../components/cards/HRCard';

// Popups
import SalesPopup       from '../popups/SalesPopup';
import PurchasesPopup   from '../popups/PurchasesPopup';
import InventoryPopup   from '../popups/InventoryPopup';
import FinancialPopup   from '../popups/FinancialPopup';
import AssetsPopup      from '../popups/AssetsPopup';
import ProductionPopup  from '../popups/ProductionPopup';
import CRMPopup         from '../popups/CRMPopup';
import ContractsPopup   from '../popups/ContractsPopup';
import ContractorPopup  from '../popups/ContractorPopup';
import TaxesPopup       from '../popups/TaxesPopup';
import REMarketingPopup from '../popups/REMarketingPopup';
import REMgmtPopup      from '../popups/REMgmtPopup';
import HRPopup          from '../popups/HRPopup';

type PopupKey =
  'sales' | 'purchases' | 'inventory' | 'financial' | 'assets' | 'production' |
  'crm' | 'contracts' | 'contractor' | 'taxes' | 'reMarketing' | 'reMgmt' | 'hr' | null;

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { isCardVisible, cardOrder, cardMatch, setCardSearchTerm,
          cardSearchTerm, loadUserPrefs, subsidiaryID, bumpToken } = useApp();
  const { t } = useTranslation();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiOpen,       setAiOpen]       = useState(false);
  const [openPopup,    setOpenPopup]    = useState<PopupKey>(null);
  const [refreshing,   setRefreshing]   = useState(false);

  useEffect(() => {
    if (subsidiaryID) loadUserPrefs();
  }, [subsidiaryID]);

  const onRefresh = () => {
    setRefreshing(true);
    bumpToken();
    setTimeout(() => setRefreshing(false), 500);
  };

  const openPopupFor = (key: PopupKey) => setOpenPopup(key);
  const closePopup   = () => setOpenPopup(null);

  // Brief module click → open matching popup
  const handleBriefModule = (module: string) => {
    const map: Record<string, PopupKey> = {
      sales: 'sales', purchases: 'purchases', inventory: 'inventory',
      financial: 'financial', assets: 'assets', production: 'production',
      crm: 'crm', contracts: 'contracts', contractor: 'contractor',
      taxes: 'taxes', reMarketing: 'reMarketing', reMgmt: 'reMgmt', hr: 'hr',
    };
    const key = map[module];
    if (key) setOpenPopup(key);
  };

  // Render a card by key — respects visibility + search
  const renderCard = (key: string) => {
    if (!isCardVisible(key)) return null;

    switch (key) {
      case 'sales':       return cardMatch('المبيعات')           ? <SalesCard       key={key} onPress={() => openPopupFor('sales')} /> : null;
      case 'purchases':   return cardMatch('المشتريات')          ? <PurchasesCard   key={key} onPress={() => openPopupFor('purchases')} /> : null;
      case 'inventory':   return cardMatch('المخازن والأصناف')   ? <InventoryCard   key={key} onPress={() => openPopupFor('inventory')} /> : null;
      case 'financial':   return cardMatch('الحسابات')           ? <FinancialCard   key={key} onPress={() => openPopupFor('financial')} /> : null;
      case 'assets':      return cardMatch('الأصول')             ? <AssetsCard      key={key} onPress={() => openPopupFor('assets')} /> : null;
      case 'production':  return cardMatch('الإنتاج')            ? <ProductionCard  key={key} onPress={() => openPopupFor('production')} /> : null;
      case 'crm':         return cardMatch('CRM')                ? <CRMCard         key={key} onPress={() => openPopupFor('crm')} /> : null;
      case 'contracts':   return cardMatch('العقود')             ? <ContractsCard   key={key} onPress={() => openPopupFor('contracts')} /> : null;
      case 'contractor':  return cardMatch('المقاولات')          ? <ContractorCard  key={key} onPress={() => openPopupFor('contractor')} /> : null;
      case 'taxes':       return cardMatch('الضرائب')            ? <TaxesCard       key={key} onPress={() => openPopupFor('taxes')} /> : null;
      case 'reMarketing': return cardMatch('التسويق العقاري')    ? <REMarketingCard key={key} onPress={() => openPopupFor('reMarketing')} /> : null;
      case 'reMgmt':      return cardMatch('إدارة العقارات')     ? <REMgmtCard      key={key} onPress={() => openPopupFor('reMgmt')} /> : null;
      case 'hr':          return cardMatch('شؤون الموظفين')      ? <HRCard          key={key} onPress={() => openPopupFor('hr')} /> : null;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <DashboardHeader
        onToggleSettings={() => setSettingsOpen(true)}
        onToggleTheme={() => {}}
        onToggleLang={() => {}}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4f46e5"
            colors={['#4f46e5']}
          />
        }
      >
        {/* Period filter */}
        <PeriodFilter />

        {/* Card search */}
        <View style={[s.searchRow, { backgroundColor: colors.bg }]}>
          <View style={[s.searchBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBrd }]}>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>🔍</Text>
            <TextInput
              style={[s.searchInput, { color: colors.text }]}
              value={cardSearchTerm}
              onChangeText={setCardSearchTerm}
              placeholder={t('MD_SearchModule')}
              placeholderTextColor={colors.textMuted}
              textAlign="right"
            />
            {cardSearchTerm ? (
              <TouchableOpacity onPress={() => setCardSearchTerm('')}>
                <Text style={[s.clearBtn, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Daily Brief */}
        <DailyBrief onModulePress={handleBriefModule} />

        {/* Cards — in user-defined order */}
        <View style={s.cardList}>
          {cardOrder.map((key) => renderCard(key))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Card Settings bottom sheet */}
      <CardSettings visible={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* AI Chat floating button + panel */}
      <TouchableOpacity style={s.fab} onPress={() => setAiOpen(true)} activeOpacity={0.85}>
        <View style={s.fabInner}>
          <Text style={{ fontSize: 20 }}>🤖</Text>
          <Text style={s.fabText}>{t('MD_AskAssistant')}</Text>
        </View>
      </TouchableOpacity>

      <AIChat visible={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Popups */}
      <SalesPopup       visible={openPopup === 'sales'}       onClose={closePopup} />
      <PurchasesPopup   visible={openPopup === 'purchases'}   onClose={closePopup} />
      <InventoryPopup   visible={openPopup === 'inventory'}   onClose={closePopup} />
      <FinancialPopup   visible={openPopup === 'financial'}   onClose={closePopup} />
      <AssetsPopup      visible={openPopup === 'assets'}      onClose={closePopup} />
      <ProductionPopup  visible={openPopup === 'production'}  onClose={closePopup} />
      <CRMPopup         visible={openPopup === 'crm'}         onClose={closePopup} />
      <ContractsPopup   visible={openPopup === 'contracts'}   onClose={closePopup} />
      <ContractorPopup  visible={openPopup === 'contractor'}  onClose={closePopup} />
      <TaxesPopup       visible={openPopup === 'taxes'}       onClose={closePopup} />
      <REMarketingPopup visible={openPopup === 'reMarketing'} onClose={closePopup} />
      <REMgmtPopup      visible={openPopup === 'reMgmt'}      onClose={closePopup} />
      <HRPopup          visible={openPopup === 'hr'}          onClose={closePopup} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1 },
  scrollContent:{ paddingBottom: 20 },
  searchRow:   { paddingHorizontal: 16, marginBottom: 12 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 12 },
  clearBtn:    { fontSize: 11 },
  cardList:    { paddingHorizontal: 16 },
  fab: {
    position: 'absolute', bottom: 24, left: 16,
    borderRadius: 30, overflow: 'hidden', elevation: 8,
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  fabInner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 18, paddingVertical: 13,
    backgroundColor: '#8b5cf6',
  },
  fabText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
