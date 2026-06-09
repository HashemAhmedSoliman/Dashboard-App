// ══════════════════════════════════════════════
// Colors — exact match from manager-dashboard.component.scss
// ══════════════════════════════════════════════

export const DarkColors = {
  bg:         '#0d1117',
  cardBg:     '#161b22',
  cardBrd:    '#21262d',
  text:       '#e6edf3',
  textMuted:  '#8b949e',
  rowBorder:  'rgba(255,255,255,0.04)',
  rowHover:   'rgba(255,255,255,0.03)',
};

export const LightColors = {
  bg:         '#f4f6fb',
  cardBg:     '#ffffff',
  cardBrd:    '#e2e8f0',
  text:       '#1e293b',
  textMuted:  '#64748b',
  rowBorder:  'rgba(15,23,42,0.06)',
  rowHover:   'rgba(15,23,42,0.04)',
};

// Accent per card — exact from component HTML [style.--accent]
export const CardAccents: Record<string, string> = {
  sales:       '#facc15',
  purchases:   '#fb7185',
  inventory:   '#2dd4bf',
  financial:   '#10b981',
  assets:      '#8b5cf6',
  production:  '#ec4899',
  crm:         '#a78bfa',
  contracts:   '#06b6d4',
  contractor:  '#f97316',
  taxes:       '#84cc16',
  reMarketing: '#f43f5e',
  reMgmt:      '#14b8a6',
  hr:          '#22c55e',
};

// Popup theme colors — exact from SCSS per-popup overrides
export const PopupAccents: Record<string, { primary: string; dark: string }> = {
  sales:       { primary: '#facc15', dark: '#ca8a04' },
  purchases:   { primary: '#fb7185', dark: '#e11d48' },
  inventory:   { primary: '#2dd4bf', dark: '#0d9488' },
  financial:   { primary: '#10b981', dark: '#047857' },
  assets:      { primary: '#3b82f6', dark: '#1d4ed8' },
  production:  { primary: '#ec4899', dark: '#be185d' },
  crm:         { primary: '#a78bfa', dark: '#7c3aed' },
  contracts:   { primary: '#06b6d4', dark: '#0891b2' },
  contractor:  { primary: '#f97316', dark: '#c2410c' },
  taxes:       { primary: '#84cc16', dark: '#4d7c0f' },
  reMarketing: { primary: '#f43f5e', dark: '#e11d48' },
  reMgmt:      { primary: '#14b8a6', dark: '#0d9488' },
  hr:          { primary: '#84cc16', dark: '#4d7c0f' },
};

// Shared semantic colors
export const Semantic = {
  primary:    '#4f46e5',
  aiAccent:   '#8b5cf6',
  aiAccent2:  '#6366f1',
  success:    '#10b981',
  successAlt: '#22c55e',
  danger:     '#ef4444',
  warning:    '#f59e0b',
  info:       '#6366f1',
};

// Chart tooltip — exact values from TS component
export const ChartTooltip = {
  background: '#161b22',
  border:     '#21262d',
  titleColor: '#e6edf3',
  bodyColor:  '#e6edf3',
  tickColor:  '#8b949e',
  gridColor:  'rgba(255,255,255,0.04)',
};

// Brief item border colors
export const BriefColors = {
  positive: '#22c55e',
  warning:  '#f59e0b',
  urgent:   '#ef4444',
  info:     '#6366f1',
};
