import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppProvider }   from './src/context/AppContext';
import AppNavigator       from './src/navigation/AppNavigator';
import './src/i18n';

// Force RTL for Arabic (default language)
I18nManager.forceRTL(true);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppProvider>
          <AppNavigator />
        </AppProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
