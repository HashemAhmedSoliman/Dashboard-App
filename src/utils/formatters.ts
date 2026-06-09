// ══════════════════════════════════════════════
// Formatters — exact logic from component.ts
// ══════════════════════════════════════════════

/** Format number with precision, no currency symbol */
export const formatNum = (val: number | undefined | null, precision = 2): string => {
  const n = +(val ?? 0);
  if (isNaN(n)) return '0';
  // Abbreviate large numbers for card display
  if (Math.abs(n) >= 1_000_000) {
    return (n / 1_000_000).toFixed(precision) + 'م';
  }
  if (Math.abs(n) >= 1_000) {
    return n.toLocaleString('en-US', { maximumFractionDigits: precision });
  }
  return n.toFixed(precision);
};

/** Full number with commas, no abbreviation */
export const formatNumFull = (val: number | undefined | null, precision = 2): string => {
  const n = +(val ?? 0);
  if (isNaN(n)) return '0';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
};

/** Date: dd/MM/yy — matches formatShortDateFull in component.ts */
export const formatShortDate = (d: any): string => {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yy = String(dt.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

/** Day label: dd/MM — matches formatDayLabel in component.ts */
export const formatDayLabel = (d: any): string => {
  if (!d && d !== 0) return '';
  if (typeof d === 'string' && isNaN(new Date(d).getTime())) return d;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d ?? '');
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
};

/** Percentage with 1 decimal */
export const formatPct = (val: number | undefined | null): string => {
  const n = +(val ?? 0);
  return `${n.toFixed(1)}%`;
};

/** Safe number — coerce falsy to 0 */
export const n = (val: any): number => +(val ?? 0);
