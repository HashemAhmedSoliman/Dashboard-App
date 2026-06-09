// Card catalog — exact order & keys from cardCatalog in component.ts
export const CARD_CATALOG = [
  { key: 'sales',       labelAr: 'المبيعات',             icon: '🛒', i18nKey: 'MD_Card_Sales' },
  { key: 'purchases',   labelAr: 'المشتريات',            icon: '📦', i18nKey: 'MD_Card_Purchases' },
  { key: 'inventory',   labelAr: 'المخازن والأصناف',     icon: '🏭', i18nKey: 'MD_Card_Inventory' },
  { key: 'financial',   labelAr: 'الحسابات',             icon: '💰', i18nKey: 'MD_Card_Accounting' },
  { key: 'assets',      labelAr: 'الأصول',               icon: '🏢', i18nKey: 'MD_Card_Assets' },
  { key: 'production',  labelAr: 'الإنتاج وأوامر الشغل', icon: '⚙️', i18nKey: 'MD_Card_Production' },
  { key: 'crm',         labelAr: 'CRM',                  icon: '👥', i18nKey: 'MD_Card_CRM' },
  { key: 'contracts',   labelAr: 'العقود',               icon: '📄', i18nKey: 'MD_Card_Contracts' },
  { key: 'contractor',  labelAr: 'تقارير المقاولات',     icon: '🔨', i18nKey: 'MD_Card_Contractor' },
  { key: 'taxes',       labelAr: 'الضرائب',              icon: '🧾', i18nKey: 'MD_Card_Taxes' },
  { key: 'reMarketing', labelAr: 'التسويق العقاري',      icon: '🏘️', i18nKey: 'MD_Card_RealEstateMkt' },
  { key: 'reMgmt',      labelAr: 'إدارة العقارات',       icon: '🏗️', i18nKey: 'MD_Card_RealEstateMgmt' },
  { key: 'hr',          labelAr: 'شؤون الموظفين',        icon: '👤', i18nKey: 'MD_Card_HR' },
] as const;

export type CardKey = typeof CARD_CATALOG[number]['key'];
