import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import BaseCard from './BaseCard';
import { SparkLine } from '../common/SparklineChart';
import { formatNum, n } from '../../utils/formatters';
import { GetAssetsSummary, GetAssetsDepreciationTrend } from '../../api/dashboardService';
import { CardAccents } from '../../constants/colors';

const ACCENT = CardAccents.assets;
const summaryCache = new Map<string, any>();
const trendCache   = new Map<string, any>();

export default function AssetsCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, loadToken, isStale, currencyPrecision } = useApp();

  const [netBookValue,   setNetBookValue]   = useState(0);
  const [originalCost,   setOriginalCost]   = useState(0);
  const [accumulatedDep, setAccumulatedDep] = useState(0);
  const [count,          setCount]          = useState(0);
  const [monthDep,       setMonthDep]       = useState(0);
  const [prevMonthDep,   setPrevMonthDep]   = useState(0);
  const [openMaint,      setOpenMaint]      = useState(0);
  const [chartData,      setChartData]      = useState<{ value: number }[]>([]);
  const [loading,        setLoading]        = useState(false);

  // Depreciation ratio
  const depRatio = originalCost ? (accumulatedDep / originalCost) * 100 : 0;

  // Trend: depreciation up = BAD (inverted)
  const depTrend = prevMonthDep
    ? (() => {
        const diff = monthDep - prevMonthDep;
        const pct  = (diff / Math.abs(prevMonthDep)) * 100;
        const up   = diff >= 0;
        return { pct: Math.abs(pct), up, good: !up }; // good = depreciation DECREASING
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

    GetAssetsSummary(filter).then((d) => {
      if (isStale(token)) return;
      const row = Array.isArray(d) ? d[0] : d;
      summaryCache.set(ck, row);
      applySum(row);
    }).catch(() => {}).finally(done);

    GetAssetsDepreciationTrend(filter).then((d) => {
      if (isStale(token)) return;
      const rows = Array.isArray(d) ? d : [];
      trendCache.set(ck, rows);
      applyTrend(rows);
    }).catch(() => {}).finally(done);
  }, [subsidiaryID, selectedPeriod, loadToken]);

  const applySum = (row: any) => {
    setNetBookValue(n(row?.netbookvalue));
    setOriginalCost(n(row?.totaloriginalcost));
    setAccumulatedDep(n(row?.accumulateddepreciation));
    setCount(n(row?.assetscount));
    setMonthDep(n(row?.currentmonthdepreciation));
    setPrevMonthDep(n(row?.prevmonthdepreciation));
    setOpenMaint(n(row?.openmaintenancecount));
  };

  const applyTrend = (rows: any[]) => {
    setChartData(rows.map((r) => ({ value: n(r?.depreciationamount) })));
  };

  return (
    <BaseCard
      accent={ACCENT}
      icon="🏢"
      cardName={t('MD_Card_Assets')}
      subLabel={t('MD_ERPModule')}
      kpi={formatNum(netBookValue, currencyPrecision)}
      kpiDesc={`صافي قيمة الأصول · تم إهلاك ${depRatio.toFixed(1)}%`}
      loading={loading}
      trend={depTrend}
      compare={`من أصل ${formatNum(originalCost, currencyPrecision)}`}
      legend={[{ color: ACCENT, label: t('MD_Lgnd_Depreciation') }]}
      chart={chartData.length > 0 ? <SparkLine data={chartData} color={ACCENT} fill /> : undefined}
      mini={[
        { value: count.toLocaleString(),                          label: t('MD_ActiveAssets') },
        { value: formatNum(monthDep, currencyPrecision),          label: t('MD_MonthDepreciation') },
        { value: openMaint.toLocaleString(),                      label: t('MD_OpenMaintenance'), danger: openMaint > 0 },
      ]}
      onPress={onPress}
    />
  );
}
