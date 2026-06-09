import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import BasePopup from './BasePopup';
import KpiRow, { KpiItem } from '../components/common/KpiRow';
import SectionCard from '../components/common/SectionCard';
import DataTable, { Column } from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import { SparkLine } from '../components/common/SparklineChart';
import { formatNum, n } from '../utils/formatters';
import { GetNetPurchasesPopupDetails } from '../api/dashboardService';
import { PopupAccents } from '../constants/colors';

const { primary: ACCENT, dark: ACCENT_DARK } = PopupAccents.purchases;
const cache = new Map<number, any>();

export default function PurchasesPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, currencyPrecision } = useApp();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [trendData, setTrend] = useState<{ value: number }[]>([]);

  useEffect(() => {
    if (!visible) return;
    if (cache.has(selectedPeriod)) { setData(cache.get(selectedPeriod)); buildTrend(cache.get(selectedPeriod)); return; }
    setLoading(true);
    GetNetPurchasesPopupDetails({ SubsidiaryID: subsidiaryID, FilterType: selectedPeriod })
      .then((d) => { cache.set(selectedPeriod, d); setData(d); buildTrend(d); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [visible, selectedPeriod]);

  const buildTrend = (d: any) => setTrend((d?.trend ?? []).map((r: any) => ({ value: n(r?.netpurchases) })));
  const fmt = (v: any) => formatNum(n(v), currencyPrecision);
  const s   = data?.summary ?? {};

  const kpis: KpiItem[] = [
    { label: t('MD_NetPurchasesMonth'),  value: fmt(s?.netpurchases),    primary: true },
    { label: t('MD_InvoicesCount'),      value: n(s?.invoicecount).toLocaleString() },
    { label: t('MD_TotalReturns'),       value: fmt(s?.totalreturns) },
    { label: t('MD_ActiveVendors'),      value: n(s?.activevendors).toLocaleString() },
  ];

  const vendorCols: Column[]  = [{ key: 'vendorname', label: t('MD_Tbl_Vendor'), flex: 2 }, { key: 'netpurchases', label: t('MD_Tbl_Value'), flex: 1, numeric: true, render: (v) => fmt(v) }];
  const itemCols: Column[]    = [{ key: 'itemname', label: t('MD_Tbl_Item'), flex: 2 }, { key: 'quantity', label: t('MD_Tbl_Qty'), flex: 1 }, { key: 'netpurchases', label: t('MD_Tbl_Value'), flex: 1, numeric: true, render: (v) => fmt(v) }];
  const poStatusCols: Column[]= [{ key: 'statusname', label: t('MD_Tbl_Status'), flex: 2 }, { key: 'count', label: t('MD_Tbl_Count'), flex: 1 }, { key: 'amount', label: t('MD_Tbl_Amount'), flex: 1, render: (v) => fmt(v) }];
  const taxCols: Column[]     = [{ key: 'description', label: t('MD_Tbl_Type'), flex: 2 }, { key: 'amount', label: t('MD_Tbl_Amount'), flex: 1, render: (v) => fmt(v) }];

  return (
    <BasePopup visible={visible} onClose={onClose} title={t('MD_Pop_Purchases_Title')} subtitle={t('MD_Pop_Purchases_Sub')} icon="📦" accent={ACCENT} accentDark={ACCENT_DARK} loading={loading}>
      <KpiRow items={kpis} accent={ACCENT} />
      {trendData.length > 0 && <SectionCard title={t('MD_Pop_HistoricalTrend')}><SparkLine data={trendData} color={ACCENT} height={160} /></SectionCard>}
      <SectionCard title={t('MD_Pop_Top5Vendors')}>{data?.topvendors?.length ? <DataTable columns={vendorCols} data={data.topvendors} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_Top5PurchasedItems')}>{data?.topitems?.length ? <DataTable columns={itemCols} data={data.topitems} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_POStatus')}>{data?.postatus?.length ? <DataTable columns={poStatusCols} data={data.postatus} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_TaxDiscountSummary')}>{data?.taxsummary?.length ? <DataTable columns={taxCols} data={data.taxsummary} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
    </BasePopup>
  );
}
