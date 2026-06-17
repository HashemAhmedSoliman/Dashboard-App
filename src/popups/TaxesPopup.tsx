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
import { GetTaxesPopupDetails } from '../api/dashboardService';
import { PopupAccents } from '../constants/colors';

const { primary: ACCENT, dark: ACCENT_DARK } = PopupAccents.taxes;
const cache = new Map<string, any>();

export default function TaxesPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
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
    GetTaxesPopupDetails({ SubsidiaryID: subsidiaryID, FilterType: selectedPeriod })
      .then((d) => { cache.set(ck, d); apply(d); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [visible, selectedPeriod]);

  const apply = (d: any) => {
    setData(d);
    setTrend((d?.trend ?? []).map((r: any) => ({ value: n(r?.nettaxpayable ?? r?.netpayable) })));
  };

  const fmt = (v: any) => formatNum(n(v), currencyPrecision);
  const s   = data?.summary ?? {};

  const kpis: KpiItem[] = [
    { label: t('MD_KPI_NetTaxPayable'), value: fmt(s?.netpayable ?? s?.nettaxpayable), primary: true },
    { label: t('MD_KPI_SalesTax'),      value: fmt(s?.salestax) },
    { label: t('MD_KPI_PurchaseTax'),   value: fmt(s?.purchasetax) },
    { label: t('MD_EffectiveRate'),      value: `${n(s?.effectiverate).toFixed(1)}%` },
  ];

  const taxTypeCols: Column[] = [{ key: 'taxtype', label: t('MD_Tbl_TaxType'), flex: 2 }, { key: 'percent', label: t('MD_Tbl_Percent'), flex: 1, render: (v) => `${n(v).toFixed(1)}%` }, { key: 'taxamount', label: t('MD_Tbl_TaxAmount'), flex: 1, render: (v) => fmt(v) }];
  const invCols: Column[]     = [{ key: 'invoiceno', label: t('MD_Tbl_InvoiceNo'), flex: 1 }, { key: 'partyname', label: t('MD_Tbl_PartyName'), flex: 2 }, { key: 'taxamount', label: t('MD_Tbl_TaxAmount'), flex: 1, render: (v) => fmt(v) }];
  const partyCols: Column[]   = [{ key: 'name', label: t('MD_Tbl_Name'), flex: 2 }, { key: 'taxamount', label: t('MD_Tbl_TaxAmount'), flex: 1, render: (v) => fmt(v) }];

  return (
    <BasePopup visible={visible} onClose={onClose} title={t('MD_Pop_Taxes_Title')} subtitle={t('MD_Pop_Taxes_Sub')} icon="🧾" accent={ACCENT} accentDark={ACCENT_DARK} loading={loading}>
      <KpiRow items={kpis} accent={ACCENT} />
      {trendData.length > 0 && <SectionCard title={t('MD_Pop_HistoricalTrend')}><SparkLine data={trendData} color={ACCENT} height={160} /></SectionCard>}
      <SectionCard title={t('MD_Pop_SalesTaxByType')}>{data?.salestaxbytype?.length ? <DataTable columns={taxTypeCols} data={data.salestaxbytype} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_PurchaseTaxByType')}>{data?.purchasetaxbytype?.length ? <DataTable columns={taxTypeCols} data={data.purchasetaxbytype} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_Top10TaxInvoices')}>{data?.topinvoices?.length ? <DataTable columns={invCols} data={data.topinvoices} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_TopTaxCustomers')}>{data?.topcustomers?.length ? <DataTable columns={partyCols} data={data.topcustomers} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
      <SectionCard title={t('MD_Pop_TopTaxVendors')}>{data?.topvendors?.length ? <DataTable columns={partyCols} data={data.topvendors} accent={ACCENT} /> : <EmptyState message={t('MD_Empty_NoData')} />}</SectionCard>
    </BasePopup>
  );
}
