// ══════════════════════════════════════════════
// Period label helpers — exact logic from _periodLabel() in component.ts
// ══════════════════════════════════════════════

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
                   'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const MONTHS_EN = ['January','February','March','April','May','June',
                   'July','August','September','October','November','December'];

export const getPeriodLabel = (period: number, lang: 'ar' | 'en'): string => {
  const now     = new Date();
  const months  = lang === 'en' ? MONTHS_EN : MONTHS_AR;
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  switch (period) {
    case 2: return lang === 'en'
      ? `Q${quarter} — ${now.getFullYear()}`
      : `الربع ${quarter} — ${now.getFullYear()}`;
    case 3: return `${now.getFullYear()}`;
    case 4: return `${now.getFullYear() - 1}`;
    default: return `${months[now.getMonth()]} ${now.getFullYear()}`;
  }
};

export const getPeriodRangeLabel = (period: number, lang: 'ar' | 'en'): string => {
  if (lang === 'en') {
    switch (period) {
      case 1: return 'Month to date';
      case 2: return 'Quarter months';
      case 3: return 'Year months';
      case 4: return 'Previous year months';
    }
  }
  switch (period) {
    case 1: return 'الشهر حتى اليوم';
    case 2: return 'شهور الربع الحالي';
    case 3: return 'شهور السنة الحالية';
    case 4: return 'شهور السنة السابقة';
  }
  return '';
};

export const getCardPeriodLabel = (
  period: number,
  keys: { month: string; quarter: string; year: string; prevYear: string },
  t: (key: string) => string
): string => {
  switch (period) {
    case 2: return t(keys.quarter);
    case 3: return t(keys.year);
    case 4: return t(keys.prevYear);
    default: return t(keys.month);
  }
};
