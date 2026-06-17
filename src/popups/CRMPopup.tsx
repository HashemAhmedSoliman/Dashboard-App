import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import BasePopup from './BasePopup';
import KpiRow, { KpiItem } from '../components/common/KpiRow';
import SectionCard from '../components/common/SectionCard';
import DataTable, { Column } from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import { SparkLine } from '../components/common/SparklineChart';
import { formatNum, formatShortDate, n } from '../utils/formatters';
import { GetCRMDashboardPopup } from '../api/dashboardService';
import { PopupAccents } from '../constants/colors';

const { primary: ACCENT, dark: ACCENT_DARK } = PopupAccents.crm;
const cache = new Map<string, any>();

export default function CRMPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, currencyPrecision } = useApp();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [trendData, setTrend] = useState<{ value: number }[]>([]);

  useEffect(() => {
    if (!visible) return;
    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (cache.has(ck)) { apply(cache.get(ck)); return; }
    setLoading(true);
    GetCRMDashboardPopup({ SubsidiaryID: subsidiaryID, FilterType: selectedPeriod })
      .then((d) => { cache.set(ck, d); apply(d); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [visible, selectedPeriod]);

  const apply = (d: any) => {
    setData(d);
    setTrend((d?.trend ?? []).map((r: any) => ({ value: n(r?.newleads) })));
  };

  const fmt = (v: any) => formatNum(n(v), currencyPrecision);
  const s   = data?.summary ?? {};
  const convRate = n(s?.opportunitiescount) && n(s?.newleadscount)
    ? Math.round((n(s.opportunitiescount) / n(s.newleadscount)) * 100) : 0;

  const kpis: KpiItem[] = [
    { label: t('MD_KPI_ActiveLeads'),    value: n(s?.openleadscount).toLocaleString(),  primary: true },
    { label: t('MD_LeadsNewMonth'),      value: n(s?.newleadscount).toLocaleString() },
    { label: t('MD_KPI_ConversionRate'), value: `${convRate}%` },
    { label: t('MD_ExpectedValue'),      value: fmt(s?.totalexpectedvalue) },
  ];

  const pipelineCols: Column[]  = [{ key: 'stagename', label: t('MD_Tbl_Stage'), flex: 2 }, { key: 'leadscount', label: t('MD_Tbl_LeadsCount'), flex: 1 }, { key: 'expectedvalue', label: t('MD_Tbl_ExpectedValueM'), flex: 1, render: (v) => fmt(v) }];
  const sourceCols: Column[]    = [{ key: 'sourcename', label: t('MD_Tbl_Source'), flex: 2 }, { key: 'leadscount', label: t('MD_Tbl_LeadsCount'), flex: 1 }];
  const activityCols: Column[]  = [{ key: 'leadname', label: t('MD_Tbl_Lead'), flex: 2 }, { key: 'activitytype', label: t('MD_Tbl_Activity'), flex: 1 }, { key: 'appointmentdate', label: t('MD_Tbl_Appointment'), flex: 1, render: (v) => formatShortDate(v) }];

  return (
    <BasePopup visible={visible} onClose={onClose} title="CRM" subtitle={t('MD_Pop_PipelineByStage')} icon="👥" accent={ACCENT} accentDark={ACCENT_DARK} loading={loading}>
      <KpiRow items={kpis} accent={ACCENT} />
      {trendData.length > 0 && <SectionCard title={t('MD_Pop_HistoricalTrend')}><SparkLine data={trendData} color={ACCENT} height={160} /></SectionCard>}
      <SectionCard title={t('MD_Pop_PipelineByStage')}>{data?.pipeline?.length ? <DataTable columns={pipelineCols} data={data.pipeline} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_TopLeadSources')}>{data?.topsources?.length ? <DataTable columns={sourceCols} data={data.topsources} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_TodayActivities')}>{data?.activities?.length ? <DataTable columns={activityCols} data={data.activities} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoActivities')} />}</SectionCard>
    </BasePopup>
  );
}
