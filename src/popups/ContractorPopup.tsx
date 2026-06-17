import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import BasePopup from './BasePopup';
import KpiRow, { KpiItem } from '../components/common/KpiRow';
import SectionCard from '../components/common/SectionCard';
import DataTable, { Column } from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import { SparkBar } from '../components/common/SparklineChart';
import { formatNum, n } from '../utils/formatters';
import { GetContractingDashboardPopup } from '../api/dashboardService';
import { PopupAccents } from '../constants/colors';

const { primary: ACCENT, dark: ACCENT_DARK } = PopupAccents.contractor;
const cache = new Map<string, any>();

export default function ContractorPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, currencyPrecision } = useApp();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(false);
  // contractor popup chart = by customer (bar), not by time
  const [chartData, setChartData] = useState<{ value: number; label: string }[]>([]);

  useEffect(() => {
    if (!visible) return;
    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (cache.has(ck)) { apply(cache.get(ck)); return; }
    setLoading(true);
    GetContractingDashboardPopup({ SubsidiaryID: subsidiaryID, FilterType: selectedPeriod })
      .then((d) => { cache.set(ck, d); apply(d); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [visible, selectedPeriod]);

  const apply = (d: any) => {
    setData(d);
    // customerchart — by customer name (not time)
    const chart = d?.customerchart ?? [];
    setChartData(chart.map((r: any) => ({ value: n(r?.projectscount), label: r?.customername ?? '' })));
  };

  const fmt = (v: any) => formatNum(n(v), currencyPrecision);
  const s   = data?.summary ?? {};

  const kpis: KpiItem[] = [
    { label: t('MD_KPI_ProjectsInProgress'), value: n(s?.activeprojectscount).toLocaleString(), primary: true },
    { label: t('MD_ActiveProjectsValue'),    value: fmt(s?.activeprojectsvalue) },
    { label: t('MD_KPI_SubcontractorReqs'),  value: n(s?.subrequestscount).toLocaleString() },
    { label: t('MD_KPI_CompletionRate'),     value: `${n(s?.completionrate).toFixed(1)}%` },
  ];

  const projCols: Column[]  = [{ key: 'projectname', label: t('MD_Tbl_Project'), flex: 2 }, { key: 'clientname', label: t('MD_Tbl_Customer'), flex: 1 }, { key: 'completionpercent', label: t('MD_Tbl_CompletionPercent'), flex: 1, render: (v) => `${n(v).toFixed(0)}%` }];
  const itemCols: Column[]  = [{ key: 'itemname', label: t('MD_Tbl_Item'), flex: 2 }, { key: 'plannedqty', label: t('MD_Tbl_PlannedQty'), flex: 1 }, { key: 'totalcost', label: t('MD_Tbl_TotalCost'), flex: 1, render: (v) => fmt(v) }];
  const subCols: Column[]   = [{ key: 'subcontractorname', label: t('MD_Tbl_Subcontractor'), flex: 2 }, { key: 'requestvalue', label: t('MD_Tbl_RequestValue'), flex: 1, render: (v) => fmt(v) }];
  const ccCols: Column[]    = [{ key: 'costcentername', label: t('MD_Tbl_CostCenter'), flex: 2 }, { key: 'budget', label: t('MD_Tbl_Budget'), flex: 1, render: (v) => fmt(v) }, { key: 'actualspent', label: t('MD_Tbl_ActualSpent'), flex: 1, render: (v) => fmt(v) }];

  return (
    <BasePopup visible={visible} onClose={onClose} title={t('MD_Pop_Contracting_Title')} subtitle={t('MD_Pop_Contracting_Sub')} icon="🔨" accent={ACCENT} accentDark={ACCENT_DARK} loading={loading}>
      <KpiRow items={kpis} accent={ACCENT} />
      {chartData.length > 0 && <SectionCard title={t('MD_Pop_CustomerProjects')}><SparkBar data={chartData.map(d => ({ value: d.value, frontColor: ACCENT }))} color={ACCENT} height={140} /></SectionCard>}
      <SectionCard title={t('MD_Pop_ExpiringSoon')}>{data?.activeproj?.length ? <DataTable columns={projCols} data={data.activeproj} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoActiveProjects')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_Top5CostItems')}>{data?.topitems?.length ? <DataTable columns={itemCols} data={data.topitems} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_SubcontractorReqs')}>{data?.subrequests?.length ? <DataTable columns={subCols} data={data.subrequests} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoSubReqs')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_CostCenters')}>{data?.costcenters?.length ? <DataTable columns={ccCols} data={data.costcenters} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
    </BasePopup>
  );
}
