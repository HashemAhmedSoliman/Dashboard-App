import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import BaseCard from './BaseCard';
import { SparkLine } from '../common/SparklineChart';
import { formatNum, n } from '../../utils/formatters';
import { GetProductionSummary, GetProductionTrend } from '../../api/dashboardService';
import { CardAccents } from '../../constants/colors';

const ACCENT = CardAccents.production;
const summaryCache = new Map<string, any>();
const trendCache   = new Map<string, any>();

export default function ProductionCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, loadToken, isStale, currencyPrecision } = useApp();

  const [openOrders,    setOpenOrders]    = useState(0);
  const [monthOrders,   setMonthOrders]   = useState(0);
  const [completed,     setCompleted]     = useState(0);
  const [prevOrders,    setPrevOrders]    = useState(0);
  const [openValue,     setOpenValue]     = useState(0);
  const [lateOrders,    setLateOrders]    = useState(0);
  const [lateValue,     setLateValue]     = useState(0);
  const [avgCompletion, setAvgCompletion] = useState(0);
  const [chartData,     setChartData]     = useState<{ value: number }[]>([]);
  const [loading,       setLoading]       = useState(false);

  const completionRate = monthOrders ? (completed / monthOrders) * 100 : 0;
  const ordersTrend = prevOrders
    ? (() => {
        const diff = monthOrders - prevOrders;
        const pct  = (diff / Math.abs(prevOrders)) * 100;
        return { pct: Math.abs(pct), up: diff >= 0, good: diff >= 0 };
      })()
    : undefined;

  useEffect(() => {
    const token  = loadToken;
    const filter = { SubsidiaryID: subsidiaryID, FilterType: selectedPeriod };

    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (summaryCache.has(ck) && trendCache.has(ck)) {
      applySum(summaryCache.get(ck));
      applyTrend(trendCache.get(ck));
      return;
    }

    setLoading(true);
    let pending = 2;
    const done = () => { if (!isStale(token) && --pending <= 0) setLoading(false); };

    GetProductionSummary(filter).then((d) => {
      if (isStale(token)) return;
      const row = Array.isArray(d) ? d[0] : d;
      summaryCache.set(ck, row);
      applySum(row);
    }).catch(() => {}).finally(done);

    GetProductionTrend(filter).then((d) => {
      if (isStale(token)) return;
      const rows = Array.isArray(d) ? d : [];
      trendCache.set(ck, rows);
      applyTrend(rows);
    }).catch(() => {}).finally(done);
  }, [subsidiaryID, selectedPeriod, loadToken]);

  const applySum = (row: any) => {
    setOpenOrders(n(row?.openorders)); setMonthOrders(n(row?.monthorders));
    setCompleted(n(row?.completedmonth)); setPrevOrders(n(row?.prevmonthorders));
    setOpenValue(n(row?.openordersvalue)); setLateOrders(n(row?.lateorders));
    setLateValue(n(row?.latevalue)); setAvgCompletion(n(row?.avgcompletiondays));
  };

  const applyTrend = (rows: any[]) => {
    setChartData(rows.map((r) => ({ value: n(r?.orderscount) })));
  };

  return (
    <BaseCard
      accent={ACCENT}
      icon="⚙️"
      cardName={t('MD_Card_Production')}
      subLabel={t('MD_ERPModule')}
      // KPI = open orders count (integer, not currency)
      kpi={openOrders.toLocaleString()}
      kpiDesc={`أوامر قيد التنفيذ · تم إغلاق ${completionRate.toFixed(1)}%`}
      loading={loading}
      trend={ordersTrend}
      compare={`من أصل ${monthOrders.toLocaleString()} أمر هذا الشهر`}
      legend={[{ color: ACCENT, label: 'أوامر جديدة' }]}
      chart={chartData.length > 0 ? <SparkLine data={chartData} color={ACCENT} fill /> : undefined}
      mini={[
        { value: formatNum(openValue, currencyPrecision), label: t('MD_OpenOrdersValue') },
        { value: lateOrders.toLocaleString(),             label: t('MD_LateOrders'), danger: lateOrders > 0,
          sub: lateOrders > 0 ? formatNum(lateValue, currencyPrecision) : undefined },
        { value: `${avgCompletion.toFixed(1)} يوم`,       label: t('MD_AvgLeadTime') },
      ]}
      onPress={onPress}
    />
  );
}
