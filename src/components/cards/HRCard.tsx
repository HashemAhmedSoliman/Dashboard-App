import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import BaseCard from './BaseCard';
import { SparkBar } from '../common/SparklineChart';
import { formatNum, n } from '../../utils/formatters';
import { getCardPeriodLabel } from '../../utils/periodLabels';
import { GetHRDashboard, GetHRDashboardPayroll } from '../../api/dashboardService';
import { CardAccents } from '../../constants/colors';

const ACCENT = CardAccents.hr; // #22c55e
const cache        = new Map<string, any>();
const payrollCache = new Map<string, number>();

export default function HRCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { subsidiaryID, selectedPeriod, loadToken, isStale, currencyPrecision } = useApp();

  const [employees,  setEmployees]  = useState(0);
  const [newHires,   setNewHires]   = useState(0);
  const [payroll,    setPayroll]    = useState(0);
  const [contracts,  setContracts]  = useState(0); // expiring contracts
  const [chartData,  setChartData]  = useState<{ value: number; frontColor: string }[]>([]);
  const [loading,    setLoading]    = useState(false);

  const hiresLabel = getCardPeriodLabel(selectedPeriod, {
    month: 'MD_HiresMonth', quarter: 'MD_HiresQuarter',
    year: 'MD_HiresYear',   prevYear: 'MD_HiresPrevYear',
  }, t);
  const payrollLabel = getCardPeriodLabel(selectedPeriod, {
    month: 'MD_NetPayrollMonth', quarter: 'MD_NetPayrollQuarter',
    year: 'MD_NetPayrollYear',   prevYear: 'MD_NetPayrollPrevYear',
  }, t);

  useEffect(() => {
    const token  = loadToken;
    const filter = { SubsidiaryID: subsidiaryID, FilterType: selectedPeriod };

    const ck = `${subsidiaryID}-${selectedPeriod}`;
    if (cache.has(ck)) {
      apply(cache.get(ck));
    } else {
      setLoading(true);
      GetHRDashboard(filter).then((d) => {
        if (isStale(token)) return;
        cache.set(ck, d);
        apply(d);
      }).catch(() => {}).finally(() => { if (!isStale(token)) setLoading(false); });
    }

    // Payroll is a separate slow call
    if (payrollCache.has(ck)) {
      setPayroll(payrollCache.get(ck) ?? 0);
    } else {
      GetHRDashboardPayroll(filter).then((d) => {
        if (isStale(token)) return;
        const rows = Array.isArray(d) ? d : [];
        const total = rows.reduce((acc: number, r: any) => acc + n(r?.netpayroll ?? r?.NetPayroll), 0);
        payrollCache.set(ck, total);
        setPayroll(total);
      }).catch(() => {});
    }
  }, [subsidiaryID, selectedPeriod, loadToken]);

  const apply = (d: any) => {
    const s = d?.summary ?? {};
    setEmployees(n(s?.totalemployees));
    setNewHires(n(s?.newhirescount));
    setContracts(n(s?.expiringcontractscount));
    const chart = d?.chart ?? [];
    // HR chart: bar chart of dept distribution (green)
    setChartData(chart.map((r: any) => ({
      value: n(r?.employeescount),
      frontColor: '#22c55e',
    })));
    setLoading(false);
  };

  return (
    <BaseCard
      accent={ACCENT}
      icon="👤"
      cardName={t('MD_Card_HR')}
      subLabel={t('MD_ERPModule')}
      kpi={employees.toLocaleString()}
      kpiDesc={t('MD_ActiveEmployee')}
      loading={loading}
      chart={chartData.length > 0 ? <SparkBar data={chartData} color={ACCENT} /> : undefined}
      mini={[
        { value: newHires.toLocaleString(),               label: hiresLabel },
        { value: formatNum(payroll, currencyPrecision),   label: payrollLabel },
        { value: contracts.toLocaleString(),              label: t('MD_ExpiresIn30'), danger: contracts > 0 },
      ]}
      onPress={onPress}
    />
  );
}
