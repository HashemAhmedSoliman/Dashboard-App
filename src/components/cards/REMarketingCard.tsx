import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import BaseCard from './BaseCard';
import { SparkLine } from '../common/SparklineChart';
import { formatNum, n } from '../../utils/formatters';
import { getCardPeriodLabel } from '../../utils/periodLabels';
import { GetRealEstateMarketingDashboard } from '../../api/dashboardService';
import { CardAccents } from '../../constants/colors';

const ACCENT = CardAccents.reMarketing;
const cache = new Map<string, any>();

export default function REMarketingCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, loadToken, isStale, currencyPrecision } = useApp();

  const [salesValue, setSalesValue] = useState(0);
  const [soldUnits,  setSoldUnits]  = useState(0);
  const [available,  setAvailable]  = useState(0);
  const [avgPrice,   setAvgPrice]   = useState(0);
  const [chartData,  setChartData]  = useState<{ value: number }[]>([]);
  const [loading,    setLoading]    = useState(false);

  const salesLabel = getCardPeriodLabel(selectedPeriod, {
    month: 'MD_REMktSalesMonth', quarter: 'MD_REMktSalesQuarter',
    year: 'MD_REMktSalesYear',   prevYear: 'MD_REMktSalesPrevYear',
  }, t);

  useEffect(() => {
    const token  = loadToken;
    const filter = { SubsidiaryID: subsidiaryID, FilterType: selectedPeriod };
    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (cache.has(ck)) { apply(cache.get(ck)); return; }
    setLoading(true);
    GetRealEstateMarketingDashboard(filter).then((d) => {
      cache.set(ck, d);
      if (isStale(token)) return;
      apply(d);
    }).catch(() => {}).finally(() => { if (!isStale(token)) setLoading(false); });
  }, [subsidiaryID, selectedPeriod, loadToken]);

  const apply = (d: any) => {
    const s = d?.summary ?? {};
    setSalesValue(n(s?.totalsalesvalue));
    setSoldUnits(n(s?.soldunitscount));
    setAvailable(n(s?.availableunitscount));
    setAvgPrice(n(s?.avgsoldunitprice));
    const chart = d?.chart ?? [];
    setChartData(chart.map((r: any) => ({ value: n(r?.newcontractscount) })));
    setLoading(false);
  };

  return (
    <BaseCard
      accent={ACCENT}
      icon="🏘️"
      cardName={t('MD_Card_RealEstateMkt')}
      subLabel={t('MD_ERPModule')}
      kpi={formatNum(salesValue, currencyPrecision)}
      kpiDesc={salesLabel}
      loading={loading}
      chart={chartData.length > 0 ? <SparkLine data={chartData} color={ACCENT} fill /> : undefined}
      mini={[
        { value: soldUnits.toLocaleString(),            label: t('MD_SoldUnits') },
        { value: available.toLocaleString(),            label: t('MD_AvailableForSale') },
        { value: formatNum(avgPrice, currencyPrecision),label: t('MD_AvgUnitPrice') },
      ]}
      onPress={onPress}
    />
  );
}
