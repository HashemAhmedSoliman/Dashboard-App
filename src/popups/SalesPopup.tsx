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
import { GetNetSalesPopupDetails } from '../api/dashboardService';
import { PopupAccents } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const { primary: ACCENT, dark: ACCENT_DARK } = PopupAccents.sales;
const cache = new Map<string, any>();

export default function SalesPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  useTheme();
  const { subsidiaryID, selectedPeriod, currencyPrecision } = useApp();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState<{ value: number; label?: string }[]>([]);

  useEffect(() => {
    if (!visible) return;
    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (cache.has(ck)) {
      setData(cache.get(ck));
      buildTrend(cache.get(ck));
      return;
    }
    setLoading(true);
    GetNetSalesPopupDetails({ SubsidiaryID: subsidiaryID, FilterType: selectedPeriod })
      .then((d) => { cache.set(ck, d); setData(d); buildTrend(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible, selectedPeriod]);

  const buildTrend = (d: any) => {
    const rows = d?.trend ?? [];
    setTrendData(rows.map((r: any) => ({
      value: n(r?.netsales),
      label: r?.periodlabel ? String(r.periodlabel).substring(0, 6) : '',
    })));
  };

  const s   = data?.summary   ?? {};
  const fmt = (v: any) => formatNum(n(v), currencyPrecision);

  // avginvoice = netsales / invoicecount (not returned in popup summary)
  const avgInvoice = s?.invoicecount > 0 ? n(s?.netsales) / n(s?.invoicecount) : 0;

  const kpis: KpiItem[] = [
    { label: t('MD_NetSalesMonth'),  value: fmt(s?.netsales),                    primary: true },
    { label: t('MD_InvoicesCount'),  value: n(s?.invoicecount).toLocaleString() },
    { label: t('MD_AvgInvoice'),     value: fmt(avgInvoice) },
    { label: t('MD_TotalDiscounts'), value: fmt(s?.totaldiscounts) },
  ];

  const customerCols: Column[] = [
    { key: 'customername', label: t('MD_Tbl_Customer'), flex: 2 },
    { key: 'netsales',     label: t('MD_Tbl_Revenue'),  flex: 1, numeric: true, render: (v) => fmt(v) },
  ];
  const salespeopleCols: Column[] = [
    { key: 'employeename', label: t('MD_Tbl_Salesperson'), flex: 2 },
    { key: 'netsales',     label: t('MD_Tbl_Revenue'),     flex: 1, numeric: true, render: (v) => fmt(v) },
  ];
  const itemCols: Column[] = [
    { key: 'itemname',  label: t('MD_Tbl_Item'),    flex: 2 },
    { key: 'totalqty',  label: t('MD_Tbl_Qty'),     flex: 1, numeric: true },
    { key: 'netvalue',  label: t('MD_Tbl_Revenue'), flex: 1, numeric: true, render: (v) => fmt(v) },
  ];
  const taxCols: Column[] = [
    { key: 'name',  label: t('MD_Tbl_Type'),   flex: 2 },
    { key: 'value', label: t('MD_Tbl_Amount'), flex: 1, numeric: true, render: (v) => fmt(v) },
  ];
  const paymentCols: Column[] = [
    { key: 'paymentstatus', label: t('MD_Tbl_Type'),   flex: 2 },
    { key: 'totalvalue',    label: t('MD_Tbl_Amount'), flex: 1, numeric: true, render: (v) => fmt(v) },
  ];

  return (
    <BasePopup
      visible={visible} onClose={onClose}
      title={t('MD_Pop_Sales_Title')} subtitle={t('MD_Pop_Sales_Sub')}
      icon="🛒" accent={ACCENT} accentDark={ACCENT_DARK} loading={loading}
    >
      <KpiRow items={kpis} accent={ACCENT} />

      {/* Trend chart */}
      {trendData.length > 0 && (
        <SectionCard title={t('MD_Pop_HistoricalTrend')}>
          <SparkLine data={trendData} color={ACCENT} height={160} showLabels />
        </SectionCard>
      )}

      {/* Top Customers */}
      <SectionCard title={t('MD_Pop_Top5Customers')}>
        {data?.topcustomers?.length
          ? <DataTable columns={customerCols} data={data.topcustomers} accent={ACCENT} />
          : <EmptyState message={t('MD_Empty_NoData')} />}
      </SectionCard>

      {/* Top Salespeople */}
      <SectionCard title={t('MD_Pop_Top5Salespeople')}>
        {data?.topsalespeople?.length
          ? <DataTable columns={salespeopleCols} data={data.topsalespeople} accent={ACCENT} />
          : <EmptyState message={t('MD_Empty_NoData')} />}
      </SectionCard>

      {/* Top Items */}
      <SectionCard title={t('MD_Pop_Top5SoldItems')}>
        {data?.topitems?.length
          ? <DataTable columns={itemCols} data={data.topitems} accent={ACCENT} />
          : <EmptyState message={t('MD_Empty_NoData')} />}
      </SectionCard>

      {/* Tax Summary */}
      <SectionCard title={t('MD_Pop_TaxDiscountSummary')}>
        {data?.taxsummary?.length
          ? <DataTable columns={taxCols} data={data.taxsummary} accent={ACCENT} />
          : <EmptyState message={t('MD_Empty_NoData')} />}
      </SectionCard>

      {/* Payment Status */}
      <SectionCard title={t('MD_Pop_PaymentStatus')}>
        {data?.paymentstatus?.length
          ? <DataTable columns={paymentCols} data={data.paymentstatus} accent={ACCENT} />
          : <EmptyState message={t('MD_Empty_NoData')} />}
      </SectionCard>
    </BasePopup>
  );
}
