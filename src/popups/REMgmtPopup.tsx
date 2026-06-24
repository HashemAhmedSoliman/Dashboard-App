import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import BasePopup from './BasePopup';
import KpiRow, { KpiItem } from '../components/common/KpiRow';
import SectionCard from '../components/common/SectionCard';
import DataTable, { Column } from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import { MixedLineChart } from '../components/common/SparklineChart';
import { formatNum, formatShortDate, n } from '../utils/formatters';
import { GetRealEstateMgmtPopupDetails } from '../api/dashboardService';
import { PopupAccents } from '../constants/colors';

const { primary: ACCENT, dark: ACCENT_DARK } = PopupAccents.reMgmt;
const cache = new Map<string, any>();

export default function REMgmtPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, currencyPrecision } = useApp();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fetchId = useRef(0);
  // Mixed chart: bar (new contracts) + line (rent amount) — exact from buildReMgmtPopupTrend
  const [trendLbls,  setLbls]  = useState<string[]>([]);
  const [trendCounts,setCounts] = useState<number[]>([]);
  const [trendRents, setRents]  = useState<number[]>([]);

  useEffect(() => {
    if (!visible) return;
    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (cache.has(ck)) { apply(cache.get(ck)); return; }
    setLoading(true);
    const id = ++fetchId.current;
    GetRealEstateMgmtPopupDetails({ SubsidiaryID: subsidiaryID, FilterType: selectedPeriod })
      .then((d) => { cache.set(ck, d); if (fetchId.current !== id) return; apply(d); })
      .catch(() => {}).finally(() => { if (fetchId.current === id) setLoading(false); });
  }, [visible, subsidiaryID, selectedPeriod]);

  const apply = (d: any) => {
    setData(d);
    const rows = d?.trend ?? [];
    setLbls(rows.map((r: any)    => r?.periodlabel ?? ''));
    setCounts(rows.map((r: any)  => n(r?.contractscount)));
    setRents(rows.map((r: any)   => n(r?.rentamount)));
  };

  const fmt = (v: any) => formatNum(n(v), currencyPrecision);
  const s   = data?.summary ?? {};

  const kpis: KpiItem[] = [
    { label: t('MD_REMgmtActiveMonth'),   value: n(s?.activecontractscount).toLocaleString(), primary: true },
    { label: t('MD_NewContractsPeriod'),  value: fmt(s?.monthlyexpectedrevenue) },
    { label: t('MD_ContractsExpiring30'), value: n(s?.expiringin30days).toLocaleString() },
    { label: t('MD_OverdueInvoices'),     value: n(s?.overduebillscount).toLocaleString() },
  ];

  const contractCols: Column[] = [{ key: 'contractno', label: t('MD_Tbl_ContractNo'), flex: 1 }, { key: 'tenantname', label: t('MD_Tbl_Customer'), flex: 2 }, { key: 'rentamount', label: t('MD_Tbl_Amount'), flex: 1, render: (v) => fmt(v) }];
  const expireCols: Column[]   = [{ key: 'contractno', label: t('MD_Tbl_ContractNo'), flex: 1 }, { key: 'tenantname', label: t('MD_Tbl_Customer'), flex: 2 }, { key: 'enddate', label: t('MD_Tbl_ContractEnd'), flex: 1, render: (v) => formatShortDate(v) }];
  const overdueCols: Column[]  = [{ key: 'tenantname', label: t('MD_Tbl_Customer'), flex: 2 }, { key: 'billvalue', label: t('MD_Tbl_Amount'), flex: 1, render: (v) => fmt(v) }, { key: 'duedate', label: t('MD_Tbl_DueDate'), flex: 1, render: (v) => formatShortDate(v) }];
  const realEstateCols: Column[]= [{ key: 'realestatename', label: t('MD_Tbl_Name'), flex: 2 }, { key: 'contractscount', label: t('MD_ActiveContracts'), flex: 1 }, { key: 'rentamount', label: t('MD_Tbl_Amount'), flex: 1, render: (v) => fmt(v) }];

  return (
    <BasePopup visible={visible} onClose={onClose} title={t('MD_Card_RealEstateMgmt')} subtitle={t('MD_REMgmtActiveMonth')} icon="🏗️" accent={ACCENT} accentDark={ACCENT_DARK} loading={loading}>
      <KpiRow items={kpis} accent={ACCENT} />
      {trendCounts.length > 0 && (
        <SectionCard title={t('MD_Pop_HistoricalTrend')}>
          {/* Mixed: bar (contracts) + line (rent) — exact from component.ts */}
          <MixedLineChart labels={trendLbls} dataset1={{ values: trendCounts, color: ACCENT, label: 'عقود جديدة' }} dataset2={{ values: trendRents, color: '#10b981', label: 'إيجار شهري' }} height={160} />
        </SectionCard>
      )}
      <SectionCard title={t('MD_ActiveContracts')}>{data?.topcontracts?.length ? <DataTable columns={contractCols} data={data.topcontracts} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_ExpiringSoon')}>{data?.expiring?.length ? <DataTable columns={expireCols} data={data.expiring} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoExpiringContracts')} />}</SectionCard>
      <SectionCard title={t('MD_OverdueInvoices')}>{data?.overduebills?.length ? <DataTable columns={overdueCols} data={data.overduebills} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Tbl_Name')}>{data?.byrealestate?.length ? <DataTable columns={realEstateCols} data={data.byrealestate} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
    </BasePopup>
  );
}
