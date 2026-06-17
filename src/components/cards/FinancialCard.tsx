import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp }   from '../../context/AppContext';
import BaseCard from './BaseCard';
import { MixedLineChart } from '../common/SparklineChart';
import { formatNum, n } from '../../utils/formatters';
import { GetFinancialSummary, GetFinancialTrend } from '../../api/dashboardService';
import { CardAccents } from '../../constants/colors';

const ACCENT = CardAccents.financial;
const summaryCache = new Map<string, any>();
const trendCache   = new Map<string, any>();

export default function FinancialCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, loadToken, isStale, currencyPrecision } = useApp();

  const [profit,       setProfit]      = useState(0);
  const [prevProfit,   setPrevProfit]  = useState(0);
  const [revenue,      setRevenue]     = useState(0);
  const [expenses,     setExpenses]    = useState(0);
  const [liquidity,    setLiquidity]   = useState(0);
  const [cash,         setCash]        = useState(0);
  const [banks,        setBanks]       = useState(0);
  const [receivables,  setReceivables] = useState(0);
  const [payables,     setPayables]    = useState(0);
  const [trendLabels,  setTrendLabels] = useState<string[]>([]);
  const [trendRev,     setTrendRev]    = useState<number[]>([]);
  const [trendExp,     setTrendExp]    = useState<number[]>([]);
  const [loading,      setLoading]     = useState(false);

  const profitMargin = revenue ? (profit / revenue) * 100 : 0;
  const profitTrend  = prevProfit
    ? { pct: Math.abs(((profit - prevProfit) / Math.abs(prevProfit)) * 100), up: profit >= prevProfit, good: profit >= prevProfit }
    : undefined;

  useEffect(() => {
    const token  = loadToken;
    const filter = { SubsidiaryID: subsidiaryID, FilterType: selectedPeriod };

    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (summaryCache.has(ck) && trendCache.has(ck)) {
      applySum(summaryCache.get(ck));
      applyTrend(trendCache.get(ck));
      return;
    }

    setLoading(true);
    let pending = 2;
    const done = () => { if (!isStale(token) && --pending <= 0) setLoading(false); };

    GetFinancialSummary(filter).then((d) => {
      if (isStale(token)) return;
      const row = Array.isArray(d) ? d[0] : d;
      summaryCache.set(ck, row);
      applySum(row);
    }).catch(() => {}).finally(done);

    GetFinancialTrend(filter).then((d) => {
      if (isStale(token)) return;
      const rows = Array.isArray(d) ? d : [];
      trendCache.set(ck, rows);
      applyTrend(rows);
    }).catch(() => {}).finally(done);
  }, [subsidiaryID, selectedPeriod, loadToken]);

  const applySum = (row: any) => {
    setProfit(n(row?.netprofit)); setPrevProfit(n(row?.prevmonthprofit));
    setRevenue(n(row?.revenue));  setExpenses(n(row?.expenses));
    setLiquidity(n(row?.liquidity)); setCash(n(row?.cashbalance));
    setBanks(n(row?.banksbalance));
    setReceivables(n(row?.totalreceivables)); setPayables(n(row?.totalpayables));
  };

  const applyTrend = (rows: any[]) => {
    setTrendLabels(rows.map((r) => {
      const d = r?.day ? new Date(r.day) : null;
      return d ? `${d.getDate()}/${d.getMonth() + 1}` : '';
    }));
    setTrendRev(rows.map((r) => n(r?.revenue)));
    setTrendExp(rows.map((r) => n(r?.expenses)));
  };

  return (
    <BaseCard
      accent={ACCENT}
      icon="💰"
      cardName={t('MD_Card_Accounting')}
      subLabel={t('MD_ERPModule')}
      kpi={formatNum(profit, currencyPrecision)}
      kpiDesc={`صافي الربح · هامش ${profitMargin.toFixed(1)}%`}
      loading={loading}
      trend={profitTrend}
      compare={profitTrend
        ? `${profitTrend.up ? 'زيادة' : 'انخفاض'} عن الشهر السابق (${formatNum(prevProfit, currencyPrecision)})`
        : undefined}
      legend={[
        { color: '#10b981', label: t('MD_Lgnd_Revenues') },
        { color: '#ef4444', label: t('MD_Lgnd_Expenses') },
      ]}
      chart={trendRev.length > 0
        ? <MixedLineChart
            labels={trendLabels}
            dataset1={{ values: trendRev, color: '#10b981', label: t('MD_Lgnd_Revenues') }}
            dataset2={{ values: trendExp, color: '#ef4444', label: t('MD_Lgnd_Expenses') }}
          />
        : undefined}
      mini={[
        { value: formatNum(liquidity, currencyPrecision), label: t('MD_Cash'), danger: liquidity < 0 },
        { value: formatNum(receivables, currencyPrecision), label: t('MD_Receivables') },
        { value: formatNum(payables, currencyPrecision),    label: t('MD_Payables'),    danger: true },
      ]}
      onPress={onPress}
    />
  );
}
