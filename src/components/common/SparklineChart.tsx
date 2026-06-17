import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../../context/ThemeContext';

const W = Dimensions.get('window').width;

interface LineProps {
  data:        { value: number; label?: string }[];
  color:       string;
  fill?:       boolean;
  height?:     number;
  showLabels?: boolean;
}

interface BarProps {
  data:    { value: number; label?: string; frontColor?: string }[];
  color:   string;
  height?: number;
  width?:  number;
}

export function SparkLine({ data, color, fill = true, height = 60, showLabels = false }: LineProps) {
  const { colors } = useTheme();

  if (!data?.length) return <View style={{ height }} />;

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const formatYLabel = (v: string) => {
    const n = parseFloat(v);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
    return `${Math.round(n)}`;
  };

  return (
    <LineChart
      data={data}
      height={height}
      width={showLabels ? W - 120 : W - 80}
      color={color}
      thickness={2}
      hideDataPoints={false}
      dataPointsColor={color}
      dataPointsRadius={showLabels ? 4 : 3}
      startFillColor={fill ? color + '55' : 'transparent'}
      endFillColor={fill ? color + '00' : 'transparent'}
      startOpacity={fill ? 0.4 : 0}
      endOpacity={fill ? 0 : 0}
      areaChart={fill}
      hideYAxisText={!showLabels}
      hideAxesAndRules={!showLabels}
      yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
      xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 9 }}
      yAxisColor={colors.rowBorder}
      xAxisColor={colors.rowBorder}
      noOfSections={4}
      maxValue={maxVal * 1.15}
      formatYLabel={showLabels ? formatYLabel : undefined}
      curved
      animateOnDataChange
      animationDuration={300}
    />
  );
}

export function SparkBar({ data, color, height = 60, width }: BarProps) {
  useTheme();

  if (!data?.length) return <View style={{ height }} />;

  const barData = data.map((d) => ({
    ...d,
    frontColor: d.frontColor ?? color,
  }));

  return (
    <BarChart
      data={barData}
      height={height}
      width={width ?? (W - 80)}
      barWidth={Math.max(6, Math.floor((W - 120) / data.length) - 4)}
      barBorderRadius={2}
      hideYAxisText
      hideAxesAndRules
      yAxisThickness={0}
      xAxisThickness={0}
      noOfSections={3}
      maxValue={Math.max(...data.map((d) => d.value)) * 1.2 || 1}
      animationDuration={300}
    />
  );
}

// Mixed chart for financial (revenue + expenses lines)
interface MixedProps {
  labels:   string[];
  dataset1: { values: number[]; color: string; label: string };
  dataset2: { values: number[]; color: string; label: string };
  height?:  number;
}

export function MixedLineChart({ labels, dataset1, dataset2, height = 60 }: MixedProps) {
  if (!dataset1.values?.length) return <View style={{ height }} />;

  const data1 = dataset1.values.map((v, i) => ({ value: v, label: labels[i] ?? '' }));
  const data2 = dataset2.values.map((v, i) => ({ value: v, label: labels[i] ?? '' }));

  return (
    <LineChart
      data={data1}
      data2={data2}
      height={height}
      width={W - 80}
      color={dataset1.color}
      color2={dataset2.color}
      thickness={2}
      thickness2={2}
      hideDataPoints
      hideYAxisText
      hideAxesAndRules
      curved
      animateOnDataChange
    />
  );
}
