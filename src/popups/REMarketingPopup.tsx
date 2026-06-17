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
import { GetRealEstateMarketingPopupDetails } from '../api/dashboardService';
import { PopupAccents } from '../constants/colors';

const { primary: ACCENT, dark: ACCENT_DARK } = PopupAccents.reMarketing;
const cache = new Map<string, any>();

export default function REMarketingPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
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
    GetRealEstateMarketingPopupDetails({ SubsidiaryID: subsidiaryID, FilterType: selectedPeriod })
      .then((d) => { cache.set(ck, d); apply(d); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [visible, selectedPeriod]);

  const apply = (d: any) => {
    setData(d);
    setTrend((d?.trend ?? []).map((r: any) => ({ value: n(r?.salesvalue ?? r?.contractsvalue) })));
  };

  const fmt = (v: any) => formatNum(n(v), currencyPrecision);
  const s   = data?.summary ?? {};

  const kpis: KpiItem[] = [
    { label: t('MD_REMktSalesMonth'),    value: fmt(s?.totalsalesvalue),     primary: true },
    { label: t('MD_SoldUnits'),          value: n(s?.soldunitscount).toLocaleString() },
    { label: t('MD_AvailableForSale'),   value: n(s?.availableunitscount).toLocaleString() },
    { label: t('MD_AvgUnitPrice'),       value: fmt(s?.avgsoldunitprice) },
  ];

  const soldCols: Column[]  = [{ key: 'unitname', label: t('MD_Tbl_Name'), flex: 2 }, { key: 'salevalue', label: t('MD_Tbl_Value'), flex: 1, render: (v) => fmt(v) }];
  const custCols: Column[]  = [{ key: 'customername', label: t('MD_Tbl_Customer'), flex: 2 }, { key: 'unitsbought', label: t('MD_SoldUnits'), flex: 1 }, { key: 'totalvalue', label: t('MD_Tbl_Value'), flex: 1, render: (v) => fmt(v) }];
  const catCols: Column[]   = [{ key: 'categoryname', label: t('MD_Tbl_Type'), flex: 2 }, { key: 'unitssold', label: t('MD_SoldUnits'), flex: 1 }, { key: 'totalvalue', label: t('MD_Tbl_Value'), flex: 1, render: (v) => fmt(v) }];
  const availCols: Column[] = [{ key: 'unitname', label: t('MD_Tbl_Name'), flex: 2 }, { key: 'categoryname', label: t('MD_Tbl_Type'), flex: 1 }, { key: 'price', label: t('MD_AvgUnitPrice'), flex: 1, render: (v) => fmt(v) }];

  return (
    <BasePopup visible={visible} onClose={onClose} title={t('MD_Card_RealEstateMkt')} subtitle={t('MD_REMktSalesMonth')} icon="🏘️" accent={ACCENT} accentDark={ACCENT_DARK} loading={loading}>
      <KpiRow items={kpis} accent={ACCENT} />
      {trendData.length > 0 && <SectionCard title={t('MD_Pop_HistoricalTrend')}><SparkLine data={trendData} color={ACCENT} height={160} /></SectionCard>}
      <SectionCard title={t('MD_Pop_Top5Customers')}>{data?.topsold?.length ? <DataTable columns={soldCols} data={data.topsold} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_Top5Customers')}>{data?.topcustomers?.length ? <DataTable columns={custCols} data={data.topcustomers} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Tbl_Type')}>{data?.bycategory?.length ? <DataTable columns={catCols} data={data.bycategory} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_AvailableForSale')}>{data?.available?.length ? <DataTable columns={availCols} data={data.available} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
    </BasePopup>
  );
}
