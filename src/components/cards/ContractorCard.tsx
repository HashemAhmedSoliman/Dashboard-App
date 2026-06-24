import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import BaseCard from './BaseCard';
import { SparkLine } from '../common/SparklineChart';
import { formatNum, n } from '../../utils/formatters';
import { getCardPeriodLabel } from '../../utils/periodLabels';
import { GetContractingDashboard } from '../../api/dashboardService';
import { CardAccents } from '../../constants/colors';

const ACCENT = CardAccents.contractor;
const cache = new Map<string, any>();

export default function ContractorCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, loadToken, isStale, currencyPrecision } = useApp();

  const [activeValue,setActiveValue]= useState(0);
  const [projects,   setProjects]   = useState(0);
  const [newMonth,   setNewMonth]   = useState(0);
  const [expiring30, setExpiring30] = useState(0);
  const [chartData,  setChartData]  = useState<{ value: number }[]>([]);
  const [loading,    setLoading]    = useState(false);

  const newLabel = getCardPeriodLabel(selectedPeriod, {
    month: 'MD_ProjectsNewMonth', quarter: 'MD_ProjectsNewQuarter',
    year: 'MD_ProjectsNewYear',   prevYear: 'MD_ProjectsPrevYear',
  }, t);

  useEffect(() => {
    const token  = loadToken;
    const filter = { SubsidiaryID: subsidiaryID, FilterType: selectedPeriod };
    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (cache.has(ck)) { apply(cache.get(ck)); return; }
    setLoading(true);
    GetContractingDashboard(filter).then((d) => {
      cache.set(ck, d);
      if (isStale(token)) return;
      apply(d);
    }).catch(() => {}).finally(() => { if (!isStale(token)) setLoading(false); });
  }, [subsidiaryID, selectedPeriod, loadToken]);

  const apply = (d: any) => {
    const s = d?.summary ?? {};
    setActiveValue(n(s?.activeprojectsvalue));
    setProjects(n(s?.activeprojectscount));
    setNewMonth(n(s?.newprojectscount));
    setExpiring30(n(s?.expiringin30days));
    const chart = d?.chart ?? [];
    setChartData(chart.map((r: any) => ({ value: n(r?.projectscount ?? r?.newprojects) })));
    setLoading(false);
  };

  return (
    <BaseCard
      accent={ACCENT}
      icon="🔨"
      cardName={t('MD_Card_Contractor')}
      subLabel={t('MD_ERPModule')}
      kpi={formatNum(activeValue, currencyPrecision)}
      kpiDesc={t('MD_ActiveProjectsValue')}
      loading={loading}
      chart={chartData.length > 0 ? <SparkLine data={chartData} color={ACCENT} fill /> : undefined}
      mini={[
        { value: projects.toLocaleString(),  label: t('MD_ActiveProjects') },
        { value: newMonth.toLocaleString(),  label: newLabel },
        { value: expiring30.toLocaleString(),label: t('MD_ExpiresIn30'), danger: expiring30 > 0 },
      ]}
      onPress={onPress}
    />
  );
}
