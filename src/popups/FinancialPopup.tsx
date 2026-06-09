import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import BasePopup from './BasePopup';
import KpiRow, { KpiItem } from '../components/common/KpiRow';
import SectionCard from '../components/common/SectionCard';
import DataTable, { Column } from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import { MixedLineChart } from '../components/common/SparklineChart';
import { formatNum, n } from '../utils/formatters';
import { GetFinancialPopupDetails } from '../api/dashboardService';
import { PopupAccents } from '../constants/colors';

const { primary: ACCENT, dark: ACCENT_DARK } = PopupAccents.financial;
const cache = new Map<number, any>();

export default function FinancialPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, currencyPrecision } = useApp();
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading]= useState(false);
  const [trendRev, setRev]  = useState<number[]>([]);
  const [trendExp, setExp]  = useState<number[]>([]);
  const [trendLbls,setLbls] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    if (cache.has(selectedPeriod)) { apply(cache.get(selectedPeriod)); return; }
    setLoading(true);
    GetFinancialPopupDetails({ SubsidiaryID: subsidiaryID, FilterType: selectedPeriod })
      .then((d) => { cache.set(selectedPeriod, d); apply(d); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [visible, selectedPeriod]);

  const apply = (d: any) => {
    setData(d);
    const rows = d?.trend ?? [];
    setLbls(rows.map((r: any) => r?.periodlabel ?? ''));
    setRev(rows.map((r: any) => n(r?.revenue)));
    setExp(rows.map((r: any) => n(r?.expenses)));
  };

  const fmt = (v: any) => formatNum(n(v), currencyPrecision);
  const s   = data?.summary ?? {};

  const kpis: KpiItem[] = [
    { label: t('MD_KPI_NetProfit'),  value: fmt(s?.netprofit),        primary: true },
    { label: t('MD_KPI_Revenues'),   value: fmt(s?.revenue) },
    { label: t('MD_KPI_Expenses'),   value: fmt(s?.expenses) },
    { label: t('MD_Cash'),           value: fmt(s?.liquidity) },
  ];

  const acctCols: Column[]   = [{ key: 'accountname', label: t('MD_Tbl_AccountName'), flex: 2 }, { key: 'amount', label: t('MD_Tbl_Amount'), flex: 1, render: (v) => fmt(v) }];
  const partyCols: Column[]  = [{ key: 'name', label: t('MD_Tbl_Name'), flex: 2 }, { key: 'balance', label: t('MD_Tbl_Balance'), flex: 1, render: (v) => fmt(v) }];
  const cashCols: Column[]   = [{ key: 'name', label: t('MD_Tbl_Name'), flex: 2 }, { key: 'type', label: t('MD_Tbl_Type'), flex: 1 }, { key: 'balance', label: t('MD_Tbl_Balance'), flex: 1, render: (v) => fmt(v) }];

  return (
    <BasePopup visible={visible} onClose={onClose} title={t('MD_Pop_Financial_Title')} subtitle={t('MD_Pop_Financial_Sub')} icon="💰" accent={ACCENT} accentDark={ACCENT_DARK} loading={loading}>
      <KpiRow items={kpis} accent={ACCENT} />
      {trendRev.length > 0 && (
        <SectionCard title={t('MD_Pop_RevExpTrend')}>
          <MixedLineChart labels={trendLbls} dataset1={{ values: trendRev, color: ACCENT, label: t('MD_Lgnd_Revenues') }} dataset2={{ values: trendExp, color: '#ef4444', label: t('MD_Lgnd_Expenses') }} height={160} />
        </SectionCard>
      )}
      <SectionCard title={t('MD_Pop_Top5RevenueAccts')}>{data?.toprevenueaccounts?.length ? <DataTable columns={acctCols} data={data.toprevenueaccounts} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_Top5ExpenseAccts')}>{data?.topexpenseaccounts?.length ? <DataTable columns={acctCols} data={data.topexpenseaccounts} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_Top5Receivables')}>{data?.topcustomers?.length ? <DataTable columns={partyCols} data={data.topcustomers} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_Top5Payables')}>{data?.topvendors?.length ? <DataTable columns={partyCols} data={data.topvendors} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_CashDistribution')}>{data?.cashandbanks?.length ? <DataTable columns={cashCols} data={data.cashandbanks} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
    </BasePopup>
  );
}
