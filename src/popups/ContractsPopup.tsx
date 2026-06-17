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
import { GetContractsDashboardPopup } from '../api/dashboardService';
import { PopupAccents } from '../constants/colors';

const { primary: ACCENT, dark: ACCENT_DARK } = PopupAccents.contracts;
const cache = new Map<string, any>();

export default function ContractsPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
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
    GetContractsDashboardPopup({ SubsidiaryID: subsidiaryID, FilterType: selectedPeriod })
      .then((d) => { cache.set(ck, d); apply(d); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [visible, selectedPeriod]);

  const apply = (d: any) => {
    setData(d);
    setTrend((d?.trend ?? []).map((r: any) => ({ value: n(r?.contractscount) })));
  };

  const fmt = (v: any) => formatNum(n(v), currencyPrecision);
  const s   = data?.summary ?? {};

  const kpis: KpiItem[] = [
    { label: t('MD_KPI_ActiveContractsNow'), value: n(s?.activecontractscount).toLocaleString(), primary: true },
    { label: t('MD_KPI_ContractsValueM'),    value: fmt(s?.activecontractsvalue) },
    { label: t('MD_KPI_ExpiresIn30'),        value: n(s?.expiringin30days).toLocaleString() },
    { label: t('MD_KPI_ContractsExpiring60'),value: n(s?.expiringin60days).toLocaleString() },
  ];

  const expireCols: Column[] = [{ key: 'contractno', label: t('MD_Tbl_ContractNo'), flex: 1 }, { key: 'clientname', label: t('MD_Tbl_Customer'), flex: 2 }, { key: 'enddate', label: t('MD_Tbl_ContractEnd'), flex: 1, render: (v) => formatShortDate(v) }, { key: 'contractvalue', label: t('MD_Tbl_ContractValue'), flex: 1, render: (v) => fmt(v) }];
  const taskCols: Column[]   = [{ key: 'taskname', label: t('MD_Tbl_Title'), flex: 2 }, { key: 'duedate', label: t('MD_Tbl_DueDate'), flex: 1, render: (v) => formatShortDate(v) }, { key: 'taskscount', label: t('MD_Tbl_TasksCount'), flex: 1 }];
  const licenseCols: Column[]= [{ key: 'licensename', label: t('MD_Tbl_License'), flex: 2 }, { key: 'authority', label: t('MD_Tbl_Authority'), flex: 1 }, { key: 'expirydate', label: t('MD_Tbl_ExpiryDate'), flex: 1, render: (v) => formatShortDate(v) }];

  return (
    <BasePopup visible={visible} onClose={onClose} title={t('MD_Pop_Contracts_Title')} subtitle={t('MD_Pop_Contracts_Sub')} icon="📄" accent={ACCENT} accentDark={ACCENT_DARK} loading={loading}>
      <KpiRow items={kpis} accent={ACCENT} />
      {trendData.length > 0 && <SectionCard title={t('MD_Pop_HistoricalTrend')}><SparkLine data={trendData} color={ACCENT} height={160} /></SectionCard>}
      <SectionCard title={t('MD_Pop_ExpiringSoon')}>{data?.expiring?.length ? <DataTable columns={expireCols} data={data.expiring} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoExpiringContracts')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_ContractTasks')}>{data?.tasks?.length ? <DataTable columns={taskCols} data={data.tasks} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_CompanyLicenses')}>{data?.licenses?.length ? <DataTable columns={licenseCols} data={data.licenses} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoLicenses')} />}</SectionCard>
    </BasePopup>
  );
}
