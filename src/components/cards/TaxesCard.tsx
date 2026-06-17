import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import BaseCard from './BaseCard';
import { SparkLine } from '../common/SparklineChart';
import { formatNum, n } from '../../utils/formatters';
import { GetTaxesSummary, GetTaxesTrend } from '../../api/dashboardService';
import { CardAccents } from '../../constants/colors';

const ACCENT = CardAccents.taxes;
const summaryCache = new Map<string, any>();
const trendCache   = new Map<string, any>();

export default function TaxesCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, loadToken, isStale, currencyPrecision } = useApp();

  const [netPayable,   setNetPayable]   = useState(0);
  const [salesTax,     setSalesTax]     = useState(0);
  const [purchaseTax,  setPurchaseTax]  = useState(0);
  const [effectiveRate,setEffectiveRate]= useState(0);
  const [chartData,    setChartData]    = useState<{ value: number }[]>([]);
  const [loading,      setLoading]      = useState(false);

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

    GetTaxesSummary(filter).then((d) => {
      if (isStale(token)) return;
      summaryCache.set(ck, d);
      applySum(d);
    }).catch(() => {}).finally(done);

    GetTaxesTrend(filter).then((d) => {
      if (isStale(token)) return;
      const rows = Array.isArray(d) ? d : [];
      trendCache.set(ck, rows);
      applyTrend(rows);
    }).catch(() => {}).finally(done);
  }, [subsidiaryID, selectedPeriod, loadToken]);

  const applySum = (d: any) => {
    const s = d?.summary ?? d?.Summary ?? (Array.isArray(d) ? d[0] : d) ?? {};
    setNetPayable(n(s?.netpayable ?? s?.nettaxpayable));
    setSalesTax(n(s?.salestax));
    setPurchaseTax(n(s?.purchasetax));
    setEffectiveRate(n(s?.effectiverate));
  };

  const applyTrend = (rows: any[]) => {
    setChartData(rows.map((r) => ({ value: n(r?.nettax ?? r?.netpayable) })));
  };

  return (
    <BaseCard
      accent={ACCENT}
      icon="🧾"
      cardName={t('MD_Card_Taxes')}
      subLabel={t('MD_ERPModule')}
      kpi={formatNum(netPayable, currencyPrecision)}
      kpiDesc={t('MD_KPI_NetTaxPayable')}
      loading={loading}
      chart={chartData.length > 0 ? <SparkLine data={chartData} color={ACCENT} fill /> : undefined}
      mini={[
        { value: formatNum(salesTax, currencyPrecision),    label: t('MD_SalesTax') },
        { value: formatNum(purchaseTax, currencyPrecision), label: t('MD_PurchaseTaxDeductible') },
        { value: `${effectiveRate.toFixed(1)}%`,            label: t('MD_EffectiveRate') },
      ]}
      onPress={onPress}
    />
  );
}
