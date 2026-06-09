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
import { GetProductionPopupDetails } from '../api/dashboardService';
import { PopupAccents } from '../constants/colors';

const { primary: ACCENT, dark: ACCENT_DARK } = PopupAccents.production;
const cache = new Map<number, any>();

export default function ProductionPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, currencyPrecision } = useApp();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [trendData, setTrend] = useState<{ value: number }[]>([]);

  useEffect(() => {
    if (!visible) return;
    if (cache.has(selectedPeriod)) { apply(cache.get(selectedPeriod)); return; }
    setLoading(true);
    GetProductionPopupDetails({ SubsidiaryID: subsidiaryID, FilterType: selectedPeriod })
      .then((d) => { cache.set(selectedPeriod, d); apply(d); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [visible, selectedPeriod]);

  const apply = (d: any) => {
    setData(d);
    setTrend((d?.trend ?? []).map((r: any) => ({ value: n(r?.orderscount) })));
  };

  const fmt = (v: any) => formatNum(n(v), currencyPrecision);
  const s   = data?.summary ?? {};

  const kpis: KpiItem[] = [
    { label: t('MD_KPI_OpenOrders'),    value: n(s?.openorders).toLocaleString(),  primary: true },
    { label: t('MD_KPI_PeriodOrders'),  value: n(s?.monthorders).toLocaleString() },
    { label: t('MD_KPI_OpenValue'),     value: fmt(s?.openordersvalue) },
    { label: t('MD_KPI_AvgCompletion'), value: `${n(s?.avgcompletiondays).toFixed(1)} يوم` },
  ];

  const lateCols: Column[]   = [{ key: 'orderno', label: t('MD_Tbl_OrderNo'), flex: 1 }, { key: 'deliverydate', label: t('MD_Tbl_DeliveryDate'), flex: 1, render: (v) => formatShortDate(v) }, { key: 'dayslate', label: t('MD_Tbl_DaysLate'), flex: 1 }, { key: 'ordervalue', label: t('MD_Tbl_TotalValue'), flex: 1, render: (v) => fmt(v) }];
  const topValCols: Column[] = [{ key: 'orderno', label: t('MD_Tbl_OrderNo'), flex: 1 }, { key: 'ordervalue', label: t('MD_Tbl_TotalValue'), flex: 1, render: (v) => fmt(v) }, { key: 'statusname', label: t('MD_Tbl_Status'), flex: 1 }];
  const statusCols: Column[] = [{ key: 'statusname', label: t('MD_Tbl_Status'), flex: 2 }, { key: 'orderscount', label: t('MD_Tbl_OrdersCount'), flex: 1 }, { key: 'totalvalue', label: t('MD_Tbl_TotalValue'), flex: 1, render: (v) => fmt(v) }];
  const lineCols: Column[]   = [{ key: 'linename', label: t('MD_Tbl_Line'), flex: 2 }, { key: 'dailycapacity', label: t('MD_Tbl_DailyQty'), flex: 1 }, { key: 'workhours', label: t('MD_Tbl_WorkHours'), flex: 1 }];

  return (
    <BasePopup visible={visible} onClose={onClose} title={t('MD_Pop_Production_Title')} subtitle={t('MD_Pop_Production_Sub')} icon="⚙️" accent={ACCENT} accentDark={ACCENT_DARK} loading={loading}>
      <KpiRow items={kpis} accent={ACCENT} />
      {trendData.length > 0 && <SectionCard title={t('MD_Pop_NewOrdersTrend')}><SparkLine data={trendData} color={ACCENT} height={160} /></SectionCard>}
      <SectionCard title={t('MD_Pop_Top5LateOrders')}>{data?.toplate?.length ? <DataTable columns={lateCols} data={data.toplate} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoLateOrders')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_Top5OpenByValue')}>{data?.topbyvalue?.length ? <DataTable columns={topValCols} data={data.topbyvalue} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_OrdersByStatus')}>{data?.bystatus?.length ? <DataTable columns={statusCols} data={data.bystatus} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_ActiveLines')}>{data?.lines?.length ? <DataTable columns={lineCols} data={data.lines} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoActiveLines')} />}</SectionCard>
    </BasePopup>
  );
}
