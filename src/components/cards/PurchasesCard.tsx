import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp }   from '../../context/AppContext';
import BaseCard from './BaseCard';
import { SparkLine } from '../common/SparklineChart';
import { formatNum, formatDayLabel, n } from '../../utils/formatters';
import { getCardPeriodLabel } from '../../utils/periodLabels';
import { GetNetPurchasesCurrentMonth, GetNetPurchasesLast7Days } from '../../api/dashboardService';
import { CardAccents } from '../../constants/colors';

const ACCENT = CardAccents.purchases;
// purchases uses rose-300 (#fda4af) for chart line — not rose-400 (#fb7185)
// matches buildPurchasesSparkline() in component.ts
const CHART_COLOR = '#fda4af';

const summaryCache = new Map<number, any>();
const trendCache   = new Map<number, any>();

export default function PurchasesCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, loadToken, isStale, currencyPrecision } = useApp();

  const [total,    setTotal]    = useState(0);
  const [invoices, setInvoices] = useState(0);
  const [returns,  setReturns]  = useState(0);
  const [vendors,  setVendors]  = useState(0);
  const [chartData,setChartData]= useState<{ value: number }[]>([]);
  const [loading,  setLoading]  = useState(false);

  const label = getCardPeriodLabel(selectedPeriod, {
    month: 'MD_NetPurchasesMonth', quarter: 'MD_NetPurchasesQuarter',
    year: 'MD_NetPurchasesYear',   prevYear: 'MD_NetPurchasesPrevYear',
  }, t);

  useEffect(() => {
    const token  = loadToken;
    const filter = { SubsidiaryID: subsidiaryID, FilterType: selectedPeriod };

    if (summaryCache.has(selectedPeriod) && trendCache.has(selectedPeriod)) {
      applySum(summaryCache.get(selectedPeriod));
      applyTrend(trendCache.get(selectedPeriod));
      return;
    }

    setLoading(true);
    GetNetPurchasesCurrentMonth(filter).then((d) => {
      if (isStale(token)) return;
      const row = Array.isArray(d) ? d[0] : d;
      summaryCache.set(selectedPeriod, row);
      applySum(row);
    }).catch(() => {}).finally(() => { if (!isStale(token)) setLoading(false); });

    GetNetPurchasesLast7Days(filter).then((d) => {
      if (isStale(token)) return;
      const rows = Array.isArray(d) ? d : [];
      trendCache.set(selectedPeriod, rows);
      applyTrend(rows);
    }).catch(() => {});
  }, [subsidiaryID, selectedPeriod, loadToken]);

  const applySum = (row: any) => {
    setTotal(n(row?.netpurchases));
    setInvoices(n(row?.invoicecount));
    setReturns(n(row?.totalreturns));
    setVendors(n(row?.activevendors));
    setLoading(false);
  };

  const applyTrend = (rows: any[]) => {
    setChartData((rows || []).map((r) => ({ value: n(r?.netpurchases) })));
  };

  return (
    <BaseCard
      accent={ACCENT}
      icon="📦"
      cardName={t('MD_Card_Purchases')}
      subLabel={t('MD_ERPModule')}
      kpi={formatNum(total, currencyPrecision)}
      kpiDesc={label}
      loading={loading}
      // purchases: fill=false, transparent background (exact match from component.ts)
      chart={chartData.length > 0 ? <SparkLine data={chartData} color={CHART_COLOR} fill={false} /> : undefined}
      mini={[
        { value: invoices.toLocaleString(), label: t('MD_InvoicesCount') },
        { value: formatNum(returns, currencyPrecision), label: t('MD_TotalReturns') },
        { value: vendors.toLocaleString(), label: t('MD_ActiveVendors') },
      ]}
      onPress={onPress}
    />
  );
}
