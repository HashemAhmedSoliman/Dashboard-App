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
import { GetInventoryDashboardPopup } from '../api/dashboardService';
import { PopupAccents } from '../constants/colors';

const { primary: ACCENT, dark: ACCENT_DARK } = PopupAccents.inventory;
const cache = new Map<string, any>();

export default function InventoryPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, currencyPrecision } = useApp();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fetchId = useRef(0);
  const [trendIn,  setTrendIn]  = useState<number[]>([]);
  const [trendOut, setTrendOut] = useState<number[]>([]);
  const [trendLbls,setTrendLbls]= useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (cache.has(ck)) { apply(cache.get(ck)); return; }
    setLoading(true);
    const id = ++fetchId.current;
    GetInventoryDashboardPopup({ SubsidiaryID: subsidiaryID, FilterType: selectedPeriod })
      .then((d) => { cache.set(ck, d); if (fetchId.current !== id) return; apply(d); })
      .catch(() => {}).finally(() => { if (fetchId.current === id) setLoading(false); });
  }, [visible, subsidiaryID, selectedPeriod]);

  const apply = (d: any) => {
    setData(d);
    const rows = d?.trend ?? [];
    setTrendLbls(rows.map((r: any) => r?.periodlabel ?? ''));
    setTrendIn(rows.map((r: any)  => n(r?.stockin)));
    setTrendOut(rows.map((r: any) => n(r?.stockout)));
  };

  const fmt = (v: any) => formatNum(n(v), currencyPrecision);
  const s   = data?.summary ?? {};

  const kpis: KpiItem[] = [
    { label: t('MD_KPI_TotalInventoryValue'), value: fmt(s?.totalinventoryvalue), primary: true },
    { label: t('MD_ActiveItems'),             value: n(s?.activeitemscount).toLocaleString() },
    { label: t('MD_KPI_BelowMinStock'),       value: n(s?.belowminimumcount).toLocaleString() },
    { label: t('MD_OutOfStock'),              value: n(s?.outofstockcount).toLocaleString() },
  ];

  const topCols: Column[]   = [{ key: 'itemname', label: t('MD_Tbl_Item'), flex: 2 }, { key: 'totalvalue', label: t('MD_Tbl_Value'), flex: 1, render: (v) => fmt(v) }];
  const storeCols: Column[]  = [{ key: 'storename', label: t('MD_Tbl_Store'), flex: 2 }, { key: 'totalvalue', label: t('MD_Tbl_Value'), flex: 1, render: (v) => fmt(v) }];
  const lowCols: Column[]   = [{ key: 'itemname', label: t('MD_Tbl_Item'), flex: 2 }, { key: 'currentstock', label: t('MD_Tbl_Available'), flex: 1 }, { key: 'minimumstock', label: t('MD_Tbl_MinStock'), flex: 1 }];
  const stockCountCols: Column[] = [
    { key: 'stockcountno', label: t('MD_Tbl_StockCountNo'), flex: 1 },
    { key: 'storename',    label: t('MD_Tbl_Store'),        flex: 2 },
    { key: 'countdate',    label: t('MD_Tbl_Date'),         flex: 1, render: (v) => formatShortDate(v) },
  ];

  return (
    <BasePopup visible={visible} onClose={onClose} title={t('MD_Pop_Inventory_Title')} subtitle={t('MD_Pop_Inventory_Sub')} icon="🏭" accent={ACCENT} accentDark={ACCENT_DARK} loading={loading}>
      <KpiRow items={kpis} accent={ACCENT} />
      {trendIn.length > 0 && (
        <SectionCard title={t('MD_Pop_HistoricalTrend')}>
          <MixedLineChart labels={trendLbls} dataset1={{ values: trendIn, color: ACCENT, label: 'وارد' }} dataset2={{ values: trendOut, color: ACCENT_DARK, label: 'صادر' }} height={160} />
        </SectionCard>
      )}
      <SectionCard title={t('MD_Pop_LowStockItems')}>{data?.belowmin?.length ? <DataTable columns={lowCols} data={data.belowmin} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoLowStock')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_Top5AssetsByValue')}>{data?.topbyvalue?.length ? <DataTable columns={topCols} data={data.topbyvalue} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_StockByStore')}>{data?.storedistrib?.length ? <DataTable columns={storeCols} data={data.storedistrib} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_LastStockCounts')}>{data?.recentstocktk?.length ? <DataTable columns={stockCountCols} data={data.recentstocktk} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoStockCounts')} />}</SectionCard>
    </BasePopup>
  );
}
