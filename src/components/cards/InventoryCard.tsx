import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import BaseCard from './BaseCard';
import { SparkBar } from '../common/SparklineChart';
import { formatNum, n } from '../../utils/formatters';
import { GetInventoryDashboardCurrentMonth, GetInventoryMovementLast7Days } from '../../api/dashboardService';
import { CardAccents } from '../../constants/colors';

const ACCENT = CardAccents.inventory;
const movementCache = new Map<string, any>();

export default function InventoryCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, loadToken, isStale, currencyPrecision } = useApp();

  const [value,    setValue]    = useState(0);
  const [active,   setActive]   = useState(0);
  const [belowMin, setBelowMin] = useState(0);
  const [zero,     setZero]     = useState(0);
  // inventory uses Bar chart (wارد/صادر)
  const [chartData,setChartData]= useState<{ value: number; frontColor: string }[]>([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    const token  = loadToken;
    const filter = { SubsidiaryID: subsidiaryID, FilterType: selectedPeriod };
    setLoading(true);

    GetInventoryDashboardCurrentMonth(filter).then((d) => {
      if (isStale(token)) return;
      const row = Array.isArray(d) ? d[0] : d;
      setValue(n(row?.totalinventoryvalue));
      setActive(n(row?.activeitemscount));
      setBelowMin(n(row?.belowminimumcount));
      setZero(n(row?.outofstockcount));
      setLoading(false);
    }).catch(() => { if (!isStale(token)) setLoading(false); });

    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (movementCache.has(ck)) {
      applyMovement(movementCache.get(ck)); return;
    }

    GetInventoryMovementLast7Days(filter).then((d) => {
      const rows = Array.isArray(d) ? d : [];
      movementCache.set(ck, rows);
      if (isStale(token)) return;
      applyMovement(rows);
    }).catch(() => {});
  }, [subsidiaryID, selectedPeriod, loadToken]);

  const applyMovement = (rows: any[]) => {
    // alternate in/out bars per day — teal for in, darker for out
    const bars: { value: number; frontColor: string }[] = [];
    rows.forEach((r) => {
      bars.push({ value: n(r?.stockin),  frontColor: '#2dd4bf' });
      bars.push({ value: n(r?.stockout), frontColor: '#0d9488' });
    });
    setChartData(bars);
  };

  return (
    <BaseCard
      accent={ACCENT}
      icon="🏭"
      cardName={t('MD_Card_Inventory')}
      subLabel={t('MD_ERPModule')}
      kpi={formatNum(value, currencyPrecision)}
      kpiDesc={t('MD_TotalInventoryValue')}
      loading={loading}
      chart={chartData.length > 0 ? <SparkBar data={chartData} color={ACCENT} /> : undefined}
      mini={[
        { value: active.toLocaleString(),   label: t('MD_ActiveItems') },
        { value: belowMin.toLocaleString(), label: t('MD_ReachedMinStock'), danger: belowMin > 0 },
        { value: zero.toLocaleString(),     label: t('MD_OutOfStock'),      danger: zero > 0 },
      ]}
      onPress={onPress}
    />
  );
}
