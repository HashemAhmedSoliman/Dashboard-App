import apiClient from './apiClient';

export interface DashboardFilter {
  SubsidiaryID: number;
  FilterType: number; // 1=Month | 2=Quarter | 3=Year | 4=PrevYear
}

// ── Helper
const post = (endpoint: string, filter: DashboardFilter) =>
  apiClient.post(`/ManagerDashboard/${endpoint}`, filter).then((r) => r.data);

const get = (endpoint: string, params?: Record<string, any>) =>
  apiClient.get(`/ManagerDashboard/${endpoint}`, { params }).then((r) => r.data);

// ══════════════════════════════════════════════
// Sales
// ══════════════════════════════════════════════
export const GetNetSalesCurrentMonth       = (f: DashboardFilter) => post('GetNetSalesCurrentMonth', f);
export const GetNetSalesLast7Days          = (f: DashboardFilter) => post('GetNetSalesLast7Days', f);
export const GetNetSalesPopupDetails       = (f: DashboardFilter) => post('GetNetSalesPopupDetails', f);

// ══════════════════════════════════════════════
// Purchases
// ══════════════════════════════════════════════
export const GetNetPurchasesCurrentMonth   = (f: DashboardFilter) => post('GetNetPurchasesCurrentMonth', f);
export const GetNetPurchasesLast7Days      = (f: DashboardFilter) => post('GetNetPurchasesLast7Days', f);
export const GetNetPurchasesPopupDetails   = (f: DashboardFilter) => post('GetNetPurchasesPopupDetails', f);

// ══════════════════════════════════════════════
// Inventory
// ══════════════════════════════════════════════
export const GetInventoryDashboardCurrentMonth = (f: DashboardFilter) => post('GetInventoryDashboardCurrentMonth', f);
export const GetInventoryMovementLast7Days     = (f: DashboardFilter) => post('GetInventoryMovementLast7Days', f);
export const GetInventoryDashboardPopup        = (f: DashboardFilter) => post('GetInventoryDashboardPopup', f);

// ══════════════════════════════════════════════
// Financial
// ══════════════════════════════════════════════
export const GetFinancialSummary           = (f: DashboardFilter) => post('GetFinancialSummary', f);
export const GetFinancialTrend             = (f: DashboardFilter) => post('GetFinancialTrend', f);
export const GetFinancialPopupDetails      = (f: DashboardFilter) => post('GetFinancialPopupDetails', f);

// ══════════════════════════════════════════════
// Assets
// ══════════════════════════════════════════════
export const GetAssetsSummary              = (f: DashboardFilter) => post('GetAssetsSummary', f);
export const GetAssetsDepreciationTrend    = (f: DashboardFilter) => post('GetAssetsDepreciationTrend', f);
export const GetAssetsPopupDetails         = (f: DashboardFilter) => post('GetAssetsPopupDetails', f);

// ══════════════════════════════════════════════
// Production
// ══════════════════════════════════════════════
export const GetProductionSummary          = (f: DashboardFilter) => post('GetProductionSummary', f);
export const GetProductionTrend            = (f: DashboardFilter) => post('GetProductionTrend', f);
export const GetProductionPopupDetails     = (f: DashboardFilter) => post('GetProductionPopupDetails', f);

// ══════════════════════════════════════════════
// Taxes
// ══════════════════════════════════════════════
export const GetTaxesSummary               = (f: DashboardFilter) => post('GetTaxesSummary', f);
export const GetTaxesTrend                 = (f: DashboardFilter) => post('GetTaxesTrend', f);
export const GetTaxesPopupDetails          = (f: DashboardFilter) => post('GetTaxesPopupDetails', f);

// ══════════════════════════════════════════════
// CRM
// ══════════════════════════════════════════════
export const GetCRMDashboard               = (f: DashboardFilter) => post('GetCRMDashboard', f);
export const GetCRMDashboardPopup          = (f: DashboardFilter) => post('GetCRMDashboardPopup', f);

// ══════════════════════════════════════════════
// Contracts
// ══════════════════════════════════════════════
export const GetContractsDashboard         = (f: DashboardFilter) => post('GetContractsDashboard', f);
export const GetContractsDashboardPopup    = (f: DashboardFilter) => post('GetContractsDashboardPopup', f);

// ══════════════════════════════════════════════
// Contracting (المقاولات)
// ══════════════════════════════════════════════
export const GetContractingDashboard       = (f: DashboardFilter) => post('GetContractingDashboard', f);
export const GetContractingDashboardPopup  = (f: DashboardFilter) => post('GetContractingDashboardPopup', f);

// ══════════════════════════════════════════════
// Real Estate Marketing
// ══════════════════════════════════════════════
export const GetRealEstateMarketingDashboard     = (f: DashboardFilter) => post('GetRealEstateMarketingDashboard', f);
export const GetRealEstateMarketingPopupDetails  = (f: DashboardFilter) => post('GetRealEstateMarketingPopupDetails', f);

// ══════════════════════════════════════════════
// Real Estate Management
// ══════════════════════════════════════════════
export const GetRealEstateMgmtDashboard    = (f: DashboardFilter) => post('GetRealEstateMgmtDashboard', f);
export const GetRealEstateMgmtPopupDetails = (f: DashboardFilter) => post('GetRealEstateMgmtPopupDetails', f);

// ══════════════════════════════════════════════
// HR
// ══════════════════════════════════════════════
export const GetHRDashboard                = (f: DashboardFilter) => post('GetHRDashboard', f);
export const GetHRDashboardPayroll         = (f: DashboardFilter) => post('GetHRDashboardPayroll', f);
export const GetHRDashboardPopup           = (f: DashboardFilter) => post('GetHRDashboardPopup', f);

// ══════════════════════════════════════════════
// User Preferences
// ══════════════════════════════════════════════
export const GetUserPrefs  = () => get('GetUserPrefs');
export const SaveUserPrefs = (visibleCards: string) =>
  apiClient.post('/ManagerDashboard/SaveUserPrefs', { VisibleCards: visibleCards }).then((r) => r.data);

// ══════════════════════════════════════════════
// Auth
// ══════════════════════════════════════════════
export const Login = (username: string, password: string, domain?: string) =>
  apiClient.post('/users/Login', { username, password, domain }).then((r) => r.data);

export const GetSubsidiaryByUser = () =>
  apiClient.get('/Fallback/SubsidaryByUserID').then((r) => r.data);
