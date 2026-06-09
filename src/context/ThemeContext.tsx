import React, { createContext, useContext, useState, useCallback } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkColors, LightColors } from '../constants/colors';
import i18n from '../i18n';

type Theme = 'dark' | 'light';
type Lang  = 'ar' | 'en';

interface ThemeContextValue {
  theme:    Theme;
  lang:     Lang;
  dir:      'rtl' | 'ltr';
  colors:   typeof DarkColors;
  isDark:   boolean;
  toggleTheme: () => void;
  toggleLang:  () => void;
  setLang:     (l: Lang) => void;
}

const ThemeContext = createContext<ThemeContextValue>({} as ThemeContextValue);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [lang,  setLangState] = useState<Lang>('ar');

  const isDark  = theme === 'dark';
  const dir     = lang === 'ar' ? 'rtl' : 'ltr';
  const colors  = isDark ? DarkColors : LightColors;

  const toggleTheme = useCallback(async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    await AsyncStorage.setItem('app_theme', next);
  }, [theme]);

  const setLang = useCallback(async (l: Lang) => {
    setLangState(l);
    I18nManager.forceRTL(l === 'ar');
    await i18n.changeLanguage(l);
    await AsyncStorage.setItem('app_lang', l);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  }, [lang, setLang]);

  return (
    <ThemeContext.Provider value={{ theme, lang, dir, colors, isDark, toggleTheme, toggleLang, setLang }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
