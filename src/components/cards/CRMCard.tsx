import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import BaseCard from './BaseCard';
import { SparkLine } from '../common/SparklineChart';
import { formatNum, n } from '../../utils/formatters';
import { getCardPeriodLabel } from '../../utils/periodLabels';
import { GetCRMDashboard } from '../../api/dashboardService';
import { CardAccents } from '../../constants/colors';

const ACCENT = CardAccents.crm;
const cache = new Map<string, any>();

export default function CRMCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, loadToken, isStale, currencyPrecision } = useApp();

  const [leads,       setLeads]       = useState(0);
  const [newMonth,    setNewMonth]    = useState(0);
  const [expected,    setExpected]    = useState(0);
  const [stale,       setStale]       = useState(0);
  const [chartData,   setChartData]   = useState<{ value: number }[]>([]);
  const [loading,     setLoading]     = useState(false);

  const newLabel = getCardPeriodLabel(selectedPeriod, {
    month: 'MD_LeadsNewMonth', quarter: 'MD_LeadsNewQuarter',
    year: 'MD_LeadsNewYear',   prevYear: 'MD_LeadsPrevYear',
  }, t);

  useEffect(() => {
    const token  = loadToken;
    const filter = { SubsidiaryID: subsidiaryID, FilterType: selectedPeriod };

    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (cache.has(ck)) {
      apply(cache.get(ck)); return;
    }

    setLoading(true);
    GetCRMDashboard(filter).then((d) => {
      if (isStale(token)) return;
      cache.set(ck, d);
      apply(d);
    }).catch(() => {}).finally(() => { if (!isStale(token)) setLoading(false); });
  }, [subsidiaryID, selectedPeriod, loadToken]);

  const apply = (d: any) => {
    const s = d?.summary ?? d?.Summary ?? {};
    setLeads(n(s?.openleadscount));
    setNewMonth(n(s?.newleadscount));
    setExpected(n(s?.totalexpectedvalue));
    setStale(n(s?.staleleadscount));
    const chart = d?.chart ?? d?.Chart ?? [];
    setChartData(chart.map((r: any) => ({ value: n(r?.newleads) })));
    setLoading(false);
  };

  return (
    <BaseCard
      accent={ACCENT}
      icon="👥"
      cardName="CRM"
      subLabel={t('MD_ERPModule')}
      kpi={leads.toLocaleString()}
      kpiDesc={t('MD_OpenLeads')}
      loading={loading}
      chart={chartData.length > 0 ? <SparkLine data={chartData} color={ACCENT} fill /> : undefined}
      mini={[
        { value: newMonth.toLocaleString(),                label: newLabel },
        { value: formatNum(expected, currencyPrecision),   label: t('MD_ExpectedValue') },
        { value: stale.toLocaleString(),                   label: t('MD_StaleLeads'), danger: stale > 0 },
      ]}
      onPress={onPress}
    />
  );
}
