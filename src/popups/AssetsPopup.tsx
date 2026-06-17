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
import { GetAssetsPopupDetails } from '../api/dashboardService';
import { PopupAccents } from '../constants/colors';

const { primary: ACCENT, dark: ACCENT_DARK } = PopupAccents.assets;
const cache = new Map<string, any>();

export default function AssetsPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
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
    GetAssetsPopupDetails({ SubsidiaryID: subsidiaryID, FilterType: selectedPeriod })
      .then((d) => { cache.set(ck, d); apply(d); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [visible, selectedPeriod]);

  const apply = (d: any) => {
    setData(d);
    setTrend((d?.trend ?? []).map((r: any) => ({ value: n(r?.depreciationamount) })));
  };

  const fmt = (v: any) => formatNum(n(v), currencyPrecision);
  const s   = data?.summary ?? {};

  const kpis: KpiItem[] = [
    { label: t('MD_KPI_NetAssetValue'),      value: fmt(s?.netbookvalue),           primary: true },
    { label: t('MD_KPI_OriginalCost'),        value: fmt(s?.totaloriginalcost) },
    { label: t('MD_KPI_PeriodDepreciation'), value: fmt(s?.currentmonthdepreciation) },
    { label: t('MD_OpenMaintenance'),        value: n(s?.openmaintenancecount).toLocaleString() },
  ];

  const assetCols: Column[]  = [{ key: 'assetname', label: t('MD_Tbl_Asset'), flex: 2 }, { key: 'netbookvalue', label: t('MD_Tbl_NetValue'), flex: 1, render: (v) => fmt(v) }];
  const depCols: Column[]    = [{ key: 'assetname', label: t('MD_Tbl_Asset'), flex: 2 }, { key: 'depreciationamount', label: t('MD_MonthDepreciation'), flex: 1, render: (v) => fmt(v) }];
  const typeCols: Column[]   = [{ key: 'typename', label: t('MD_Tbl_Type'), flex: 2 }, { key: 'assetscount', label: t('MD_Tbl_AssetsCount'), flex: 1 }, { key: 'netbookvalue', label: t('MD_Tbl_NetValue'), flex: 1, render: (v) => fmt(v) }];
  const maintCols: Column[]  = [{ key: 'assetname', label: t('MD_Tbl_Asset'), flex: 2 }, { key: 'duedate', label: t('MD_Tbl_DueDate'), flex: 1, render: (v) => formatShortDate(v) }, { key: 'expectedcost', label: t('MD_Tbl_ExpectedCost'), flex: 1, render: (v) => fmt(v) }];

  return (
    <BasePopup visible={visible} onClose={onClose} title={t('MD_Pop_Assets_Title')} subtitle={t('MD_Pop_Assets_Sub')} icon="🏢" accent={ACCENT} accentDark={ACCENT_DARK} loading={loading}>
      <KpiRow items={kpis} accent={ACCENT} />
      {trendData.length > 0 && <SectionCard title={t('MD_Pop_DepTrend')}><SparkLine data={trendData} color={ACCENT} height={160} /></SectionCard>}
      <SectionCard title={t('MD_Pop_Top5AssetsByValue')}>{data?.topbyvalue?.length ? <DataTable columns={assetCols} data={data.topbyvalue} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_AssetsAlmostExp')}>{data?.topbydepreciation?.length ? <DataTable columns={depCols} data={data.topbydepreciation} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_AssetsByType')}>{data?.bytype?.length ? <DataTable columns={typeCols} data={data.bytype} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_OpenMaintenance')}>{data?.openmaintenance?.length ? <DataTable columns={maintCols} data={data.openmaintenance} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoOpenMaintenance')} />}</SectionCard>
    </BasePopup>
  );
}
