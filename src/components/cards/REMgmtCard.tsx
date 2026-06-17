import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import BaseCard from './BaseCard';
import { SparkLine } from '../common/SparklineChart';
import { formatNum, n } from '../../utils/formatters';
import { getCardPeriodLabel } from '../../utils/periodLabels';
import { GetRealEstateMgmtDashboard } from '../../api/dashboardService';
import { CardAccents } from '../../constants/colors';

const ACCENT = CardAccents.reMgmt;
const cache = new Map<string, any>();

export default function REMgmtCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, loadToken, isStale, currencyPrecision } = useApp();

  const [activeContracts, setActiveContracts] = useState(0);
  const [monthlyRevenue,  setMonthlyRevenue]  = useState(0);
  const [expiring30,      setExpiring30]      = useState(0);
  const [overdueBills,    setOverdueBills]    = useState(0);
  const [chartData,       setChartData]       = useState<{ value: number }[]>([]);
  const [loading,         setLoading]         = useState(false);

  const cardLabel = getCardPeriodLabel(selectedPeriod, {
    month: 'MD_REMgmtActiveMonth', quarter: 'MD_REMgmtActiveQuarter',
    year: 'MD_REMgmtActiveYear',   prevYear: 'MD_REMgmtActivePrevYear',
  }, t);

  useEffect(() => {
    const token  = loadToken;
    const filter = { SubsidiaryID: subsidiaryID, FilterType: selectedPeriod };
    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (cache.has(ck)) { apply(cache.get(ck)); return; }
    setLoading(true);
    GetRealEstateMgmtDashboard(filter).then((d) => {
      if (isStale(token)) return;
      cache.set(ck, d);
      apply(d);
    }).catch(() => {}).finally(() => { if (!isStale(token)) setLoading(false); });
  }, [subsidiaryID, selectedPeriod, loadToken]);

  const apply = (d: any) => {
    const s = d?.summary ?? {};
    setActiveContracts(n(s?.activecontractscount));
    setMonthlyRevenue(n(s?.monthlyexpectedrevenue));
    setExpiring30(n(s?.expiringin30days));
    setOverdueBills(n(s?.overduebillscount));
    const chart = d?.chart ?? [];
    setChartData(chart.map((r: any) => ({ value: n(r?.contractscount) })));
    setLoading(false);
  };

  return (
    <BaseCard
      accent={ACCENT}
      icon="🏗️"
      cardName={t('MD_Card_RealEstateMgmt')}
      subLabel={t('MD_ERPModule')}
      kpi={activeContracts.toLocaleString()}
      kpiDesc={cardLabel}
      loading={loading}
      chart={chartData.length > 0 ? <SparkLine data={chartData} color={ACCENT} fill /> : undefined}
      mini={[
        { value: formatNum(monthlyRevenue, currencyPrecision), label: t('MD_NewContractsPeriod') },
        { value: expiring30.toLocaleString(),                  label: t('MD_ContractsExpiring30'), danger: expiring30 > 0 },
        { value: overdueBills.toLocaleString(),                label: t('MD_OverdueInvoices'),     danger: overdueBills > 0 },
      ]}
      onPress={onPress}
    />
  );
}
