import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';

import LoginScreen     from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LoginShowcase   from '../screens/LoginShowcase';

export type RootStackParamList = {
  Login:     undefined;
  Dashboard: undefined;
  Showcase:  undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}
      >
        <Stack.Screen name="Login"     component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Showcase"  component={LoginShowcase} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
