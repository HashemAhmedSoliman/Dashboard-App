import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import BaseCard from './BaseCard';
import { SparkLine } from '../common/SparklineChart';
import { formatNum, n } from '../../utils/formatters';
import { getCardPeriodLabel } from '../../utils/periodLabels';
import { GetContractsDashboard } from '../../api/dashboardService';
import { CardAccents } from '../../constants/colors';

const ACCENT = CardAccents.contracts;
const cache = new Map<string, any>();

export default function ContractsCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, loadToken, isStale, currencyPrecision } = useApp();

  const [activeValue, setActiveValue] = useState(0);
  const [active,      setActive]      = useState(0);
  const [newContracts,setNewContracts]= useState(0);
  const [expiring,    setExpiring]    = useState(0);
  const [chartData,   setChartData]   = useState<{ value: number }[]>([]);
  const [loading,     setLoading]     = useState(false);

  const newLabel = getCardPeriodLabel(selectedPeriod, {
    month: 'MD_ContractsNewMonth', quarter: 'MD_ContractsNewQuarter',
    year: 'MD_ContractsNewYear',   prevYear: 'MD_ContractsPrevYear',
  }, t);

  useEffect(() => {
    const token  = loadToken;
    const filter = { SubsidiaryID: subsidiaryID, FilterType: selectedPeriod };
    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (cache.has(ck)) { apply(cache.get(ck)); return; }
    setLoading(true);
    GetContractsDashboard(filter).then((d) => {
      cache.set(ck, d);
      if (isStale(token)) return;
      apply(d);
    }).catch(() => {}).finally(() => { if (!isStale(token)) setLoading(false); });
  }, [subsidiaryID, selectedPeriod, loadToken]);

  const apply = (d: any) => {
    const s = d?.summary ?? {};
    setActiveValue(n(s?.activecontractsvalue));
    setActive(n(s?.activecontractscount));
    setNewContracts(n(s?.newcontractscount));
    setExpiring(n(s?.expiringin30days));
    const chart = d?.chart ?? [];
    setChartData(chart.map((r: any) => ({ value: n(r?.contractscount ?? r?.newcontracts) })));
    setLoading(false);
  };

  return (
    <BaseCard
      accent={ACCENT}
      icon="📄"
      cardName={t('MD_Card_Contracts')}
      subLabel={t('MD_ERPModule')}
      kpi={formatNum(activeValue, currencyPrecision)}
      kpiDesc={t('MD_ActiveContractsValue')}
      loading={loading}
      chart={chartData.length > 0 ? <SparkLine data={chartData} color={ACCENT} fill /> : undefined}
      mini={[
        { value: active.toLocaleString(),      label: t('MD_ActiveContracts') },
        { value: newContracts.toLocaleString(), label: newLabel },
        { value: expiring.toLocaleString(),     label: t('MD_ExpiresIn30'), danger: expiring > 0 },
      ]}
      onPress={onPress}
    />
  );
}
