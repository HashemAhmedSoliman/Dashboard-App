import React, {
  createContext, useContext, useState, useCallback, useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CARD_CATALOG, CardKey } from '../constants/cardConfig';

interface AppContextValue {
  // Auth
  subsidiaryID: number;
  userName: string;
  setAuth: (id: number, name: string) => void;
  logout: () => void;

  // Period filter — 1=Month | 2=Quarter | 3=Year | 4=PrevYear
  selectedPeriod: number;
  selectPeriod: (p: number) => void;

  // Race condition token
  loadToken: number;
  bumpToken: () => number;
  isStale: (token: number) => boolean;

  // Card visibility & order
  visibleCards: Record<string, boolean>;
  cardOrder: string[];
  toggleCardVisibility: (key: string) => void;
  selectAllCards: () => void;
  hideAllCards: () => void;
  isCardVisible: (key: string) => boolean;
  reorderCards: (from: number, to: number) => void;
  loadUserPrefs: () => Promise<void>;
  saveUserPrefs: () => Promise<void>;

  // Search
  cardSearchTerm: string;
  setCardSearchTerm: (t: string) => void;
  cardMatch: (label: string) => boolean;

  // Currency precision
  currencyPrecision: number;
}

const AppContext = createContext<AppContextValue>({} as AppContextValue);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subsidiaryID, setSubsidiaryID] = useState(0);
  const [userName,     setUserName]     = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const loadTokenRef = useRef(0);
  const [_tokenTick, setTokenTick] = useState(0); // force re-renders on token bump

  const defaultVisible = Object.fromEntries(CARD_CATALOG.map((c) => [c.key, true]));
  const defaultOrder   = CARD_CATALOG.map((c) => c.key);

  const [visibleCards,    setVisibleCards]    = useState<Record<string, boolean>>(defaultVisible);
  const [cardOrder,       setCardOrder]       = useState<string[]>(defaultOrder);
  const [cardSearchTerm,  setCardSearchTerm]  = useState('');
  const currencyPrecision = 2;

  const setAuth = useCallback((id: number, name: string) => {
    setSubsidiaryID(id);
    setUserName(name);
  }, []);

  const logout = useCallback(async () => {
    const { clearAuthToken } = await import('../api/apiClient');
    await clearAuthToken();
    setSubsidiaryID(0);
    setUserName('');
  }, []);

  const bumpToken = useCallback((): number => {
    loadTokenRef.current += 1;
    setTokenTick((t) => t + 1);
    return loadTokenRef.current;
  }, []);

  const isStale = useCallback((token: number) => token !== loadTokenRef.current, []);

  const selectPeriod = useCallback((p: number) => {
    setSelectedPeriod(p);
    bumpToken();
  }, [bumpToken]);

  const saveUserPrefs = useCallback(async () => {
    const prefs = { visibleCards, cardOrder };
    await AsyncStorage.setItem('user_prefs', JSON.stringify(prefs));
    // Also save to server (imported lazily to avoid circular deps)
    try {
      const { SaveUserPrefs } = await import('../api/dashboardService');
      await SaveUserPrefs(JSON.stringify(prefs));
    } catch (_) {}
  }, [visibleCards, cardOrder]);

  const loadUserPrefs = useCallback(async () => {
    // Load from server first
    try {
      const { GetUserPrefs } = await import('../api/dashboardService');
      const resp = await GetUserPrefs();
      const raw  = resp?.visiblecards ?? resp?.visibleCards ?? null;
      if (raw) {
        const parsed = JSON.parse(raw);
        const vis    = parsed.visibleCards ?? parsed;
        const newVis = { ...defaultVisible };
        for (const c of CARD_CATALOG) {
          if (vis[c.key] !== undefined) newVis[c.key] = vis[c.key];
        }
        setVisibleCards(newVis);
        if (Array.isArray(parsed.cardOrder)) {
          const known = CARD_CATALOG.map((c) => c.key);
          const saved = (parsed.cardOrder as string[]).filter((k) => known.includes(k as CardKey));
          for (const k of known) { if (!saved.includes(k)) saved.push(k); }
          setCardOrder(saved);
        }
        return;
      }
    } catch (_) {}
    // Fallback: local storage
    try {
      const local = await AsyncStorage.getItem('user_prefs');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.visibleCards) setVisibleCards(parsed.visibleCards);
        if (parsed.cardOrder)    setCardOrder(parsed.cardOrder);
      }
    } catch (_) {}
  }, [defaultVisible]);

  const toggleCardVisibility = useCallback(async (key: string) => {
    setVisibleCards((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // fire-and-forget save
      AsyncStorage.setItem('user_prefs', JSON.stringify({ visibleCards: next, cardOrder }));
      return next;
    });
  }, [cardOrder]);

  const selectAllCards = useCallback(() => {
    const all = Object.fromEntries(CARD_CATALOG.map((c) => [c.key, true]));
    setVisibleCards(all);
  }, []);

  const hideAllCards = useCallback(() => {
    const none = Object.fromEntries(CARD_CATALOG.map((c) => [c.key, false]));
    setVisibleCards(none);
  }, []);

  const isCardVisible = useCallback((key: string) => visibleCards[key] !== false, [visibleCards]);

  const reorderCards = useCallback(async (from: number, to: number) => {
    setCardOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    await saveUserPrefs();
  }, [saveUserPrefs]);

  const cardMatch = useCallback((label: string): boolean => {
    if (!cardSearchTerm.trim()) return true;
    return label.toLowerCase().includes(cardSearchTerm.toLowerCase());
  }, [cardSearchTerm]);

  return (
    <AppContext.Provider
      value={{
        subsidiaryID, userName, setAuth, logout,
        selectedPeriod, selectPeriod,
        loadToken: loadTokenRef.current, bumpToken, isStale,
        visibleCards, cardOrder,
        toggleCardVisibility, selectAllCards, hideAllCards,
        isCardVisible, reorderCards, loadUserPrefs, saveUserPrefs,
        cardSearchTerm, setCardSearchTerm, cardMatch,
        currencyPrecision,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
