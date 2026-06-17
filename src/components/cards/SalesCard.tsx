import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useApp }   from '../../context/AppContext';
import BaseCard from './BaseCard';
import { SparkLine } from '../common/SparklineChart';
import { formatNum, formatDayLabel, n } from '../../utils/formatters';
import { getCardPeriodLabel } from '../../utils/periodLabels';
import { GetNetSalesCurrentMonth, GetNetSalesLast7Days } from '../../api/dashboardService';
import { CardAccents } from '../../constants/colors';

const ACCENT = CardAccents.sales;

const summaryCache = new Map<string, any>();
const trendCache   = new Map<string, any>();

export default function SalesCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { subsidiaryID, selectedPeriod, loadToken, isStale, currencyPrecision } = useApp();

  const [total,    setTotal]    = useState(0);
  const [count,    setCount]    = useState(0);
  const [avg,      setAvg]      = useState(0);
  const [discount, setDiscount] = useState(0);
  const [chartData,setChartData]= useState<{ value: number; label: string }[]>([]);
  const [loading,  setLoading]  = useState(false);

  const label = getCardPeriodLabel(selectedPeriod, {
    month: 'MD_NetSalesMonth', quarter: 'MD_NetSalesQuarter',
    year: 'MD_NetSalesYear', prevYear: 'MD_NetSalesPrevYear',
  }, t);

  useEffect(() => {
    const token = loadToken;
    const filter = { SubsidiaryID: subsidiaryID, FilterType: selectedPeriod };

    const ck = `${subsidiaryID}-${selectedPeriod}`;
    const cachedS = summaryCache.get(ck);
    const cachedT = trendCache.get(ck);
    if (cachedS && cachedT) {
      applySum(cachedS); applyTrend(cachedT); return;
    }

    setLoading(true);

    GetNetSalesCurrentMonth(filter).then((d) => {
      if (isStale(token)) return;
      const row = Array.isArray(d) ? d[0] : d;
      summaryCache.set(ck, row);
      applySum(row);
    }).catch(() => {}).finally(() => { if (!isStale(token)) setLoading(false); });

    GetNetSalesLast7Days(filter).then((d) => {
      if (isStale(token)) return;
      const rows = Array.isArray(d) ? d : [];
      trendCache.set(ck, rows);
      applyTrend(rows);
    }).catch(() => {});
  }, [subsidiaryID, selectedPeriod, loadToken]);

  const applySum = (row: any) => {
    setTotal(n(row?.netsales));
    setCount(n(row?.netinvoicecount ?? row?.salesinvoicecount));
    setAvg(n(row?.avginvoice));
    setDiscount(n(row?.totaldiscounts));
    setLoading(false);
  };

  const applyTrend = (rows: any[]) => {
    setChartData((rows || []).map((r) => ({
      value: n(r?.netsales),
      label: formatDayLabel(r?.periodlabel ?? r?.salesdate),
    })));
  };

  return (
    <BaseCard
      accent={ACCENT}
      icon="🛒"
      cardName={t('MD_Card_Sales')}
      subLabel={t('MD_ERPModule')}
      kpi={formatNum(total, currencyPrecision)}
      kpiDesc={label}
      loading={loading}
      chart={
        chartData.length > 0
          ? <SparkLine data={chartData} color={ACCENT} fill />
          : undefined
      }
      mini={[
        { value: count.toLocaleString(), label: t('MD_InvoicesCount') },
        { value: formatNum(avg, currencyPrecision), label: t('MD_AvgInvoice') },
        { value: formatNum(discount, currencyPrecision), label: t('MD_TotalDiscounts') },
      ]}
      onPress={onPress}
    />
  );
}
