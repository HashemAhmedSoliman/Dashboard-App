import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import BasePopup from './BasePopup';
import KpiRow, { KpiItem } from '../components/common/KpiRow';
import SectionCard from '../components/common/SectionCard';
import DataTable, { Column } from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import { SparkBar } from '../components/common/SparklineChart';
import { formatNum, formatShortDate, n } from '../utils/formatters';
import { GetHRDashboardPopup } from '../api/dashboardService';
import { PopupAccents } from '../constants/colors';

const { primary: ACCENT, dark: ACCENT_DARK } = PopupAccents.hr;
const cache = new Map<string, any>();

export default function HRPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, currencyPrecision } = useApp();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deptChart, setDeptChart] = useState<{ value: number; frontColor: string }[]>([]);

  useEffect(() => {
    if (!visible) return;
    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (cache.has(ck)) { apply(cache.get(ck)); return; }
    setLoading(true);
    GetHRDashboardPopup({ SubsidiaryID: subsidiaryID, FilterType: selectedPeriod })
      .then((d) => { cache.set(ck, d); apply(d); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [visible, selectedPeriod]);

  const apply = (d: any) => {
    setData(d);
    const chart = d?.deptchart ?? [];
    setDeptChart(chart.map((r: any) => ({ value: n(r?.employeescount), frontColor: '#84cc16' })));
  };

  const fmt = (v: any) => formatNum(n(v), currencyPrecision);
  const s   = data?.summary ?? {};

  const kpis: KpiItem[] = [
    { label: t('MD_KPI_ActiveEmployees'), value: n(s?.totalemployees).toLocaleString(),  primary: true },
    { label: t('MD_KPI_TotalPayroll'),    value: fmt(s?.totalpayroll) },
    { label: t('MD_KPI_PeriodHires'),     value: n(s?.newhirescount).toLocaleString() },
    { label: t('MD_ExpiresIn30'),         value: n(s?.expiringcontractscount).toLocaleString() },
  ];

  const deptCols: Column[]    = [{ key: 'deptname', label: t('MD_Tbl_Department'), flex: 2 }, { key: 'employeescount', label: t('MD_Tbl_EmployeesCount'), flex: 1 }, { key: 'avgsalary', label: t('MD_Tbl_AvgSalary'), flex: 1, render: (v) => fmt(v) }];
  const hireCols: Column[]    = [{ key: 'employeename', label: t('MD_Tbl_Employee'), flex: 2 }, { key: 'jobtitle', label: t('MD_Tbl_JobTitle'), flex: 1 }, { key: 'hiringdate', label: t('MD_Tbl_HiringDate'), flex: 1, render: (v) => formatShortDate(v) }];
  const expireCols: Column[]  = [{ key: 'employeename', label: t('MD_Tbl_Employee'), flex: 2 }, { key: 'contractend', label: t('MD_Tbl_ContractEnd'), flex: 1, render: (v) => formatShortDate(v) }, { key: 'daysremaining', label: t('MD_Tbl_DaysRemaining'), flex: 1 }];
  const payrollCols: Column[] = [{ key: 'description', label: t('MD_Tbl_Title'), flex: 2 }, { key: 'amount', label: t('MD_Tbl_Amount'), flex: 1, render: (v) => fmt(v) }];

  return (
    <BasePopup visible={visible} onClose={onClose} title={t('MD_Pop_HR_Title')} subtitle={t('MD_Pop_HR_Sub')} icon="👤" accent={ACCENT} accentDark={ACCENT_DARK} loading={loading}>
      <KpiRow items={kpis} accent={ACCENT} />
      {deptChart.length > 0 && <SectionCard title={t('MD_Pop_DeptDistribution')}><SparkBar data={deptChart} color={ACCENT} height={140} /></SectionCard>}
      <SectionCard title={t('MD_Pop_DeptTable')}>{data?.depttable?.length ? <DataTable columns={deptCols} data={data.depttable} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_NewHires')}>{data?.newhires?.length ? <DataTable columns={hireCols} data={data.newhires} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoNewHires')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_ExpiringContracts')}>{data?.expiring?.length ? <DataTable columns={expireCols} data={data.expiring} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoExpiringContracts')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_PayrollSummary')}>{data?.payrollsummary?.length ? <DataTable columns={payrollCols} data={data.payrollsummary} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
    </BasePopup>
  );
}
