/**
 * Aplicación Taller de Logística
 * React Native App para gestión logística
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';

import AuthNavigator from './src/navigation/AuthNavigator';
import { store } from './src/store';
import { initializeFirebaseApp } from './src/config/firebaseConfig';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Inicializar Firebase cuando se inicia la app
    try {
      initializeFirebaseApp();
    } catch (error) {
      console.error('Error inicializando Firebase en App.tsx:', error);
    }
  }, []);

  return (
    <Provider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AuthNavigator />
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}

export default App;
