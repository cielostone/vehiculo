import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import MenuActivity from '../screens/MenuActivity';

// App Screens
import DashboardScreen from '../screens/DashboardScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ShipmentsScreen from '../screens/ShipmentsScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DeliveryCalculatorScreen from '../screens/DeliveryCalculatorScreen';
import GPSDistanceScreen from '../screens/GPSDistanceScreen';
import RadianTestScreen from '../screens/RadianTestScreen';

// Services
import FirebaseService, { type FirebaseUser } from '../services/FirebaseService';

import { RootStackParamList } from '../types';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

// Navegador principal de la app (después del login)
const MainTabNavigator = ({ user, onLogout }: { user: FirebaseUser; onLogout: () => void }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Menu':
              iconName = 'menu';
              break;
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Inventory':
              iconName = 'inventory';
              break;
            case 'Shipments':
              iconName = 'local-shipping';
              break;
            case 'DeliveryCalculator':
              iconName = 'calculate';
              break;
            case 'GPSDistance':
              iconName = 'gps-fixed';
              break;
            case 'RadianTest':
              iconName = 'functions';
              break;
            case 'Activities':
              iconName = 'assignment';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      {/* Menú principal - Actividad 3 */}
      <Tab.Screen 
        name="Menu" 
        options={{ 
          title: 'Menú',
          headerTitle: 'Taller de Logística - Menu'
        }} 
      >
        {() => (
          <MenuActivity 
            user={user} 
            onLogout={onLogout}
            onNavigateToDeliveryCalculator={() => {
              // Navegación manejada internamente
            }}
          />
        )}
      </Tab.Screen>

      {/* Pantallas del taller */}
      <Tab.Screen 
        name="DeliveryCalculator" 
        component={DeliveryCalculatorScreen} 
        options={{ 
          title: 'Calculadora',
          headerTitle: 'Calculadora de Entregas'
        }} 
      />
      
      <Tab.Screen 
        name="GPSDistance" 
        component={GPSDistanceScreen} 
        options={{ 
          title: 'GPS',
          headerTitle: 'Distancia GPS - Haversine'
        }} 
      />

      {/* Pantalla de prueba de radianes - TEMPORAL PARA TESTING */}
      <Tab.Screen 
        name="RadianTest" 
        component={RadianTestScreen} 
        options={{ 
          title: 'Radianes',
          headerTitle: 'Test: Grados → Radianes'
        }} 
      />

      {/* Pantalla de perfil con datos del usuario */}
      <Tab.Screen 
        name="Profile" 
        options={{ 
          title: 'Perfil',
          headerTitle: 'Perfil de Usuario'
        }} 
      >
        {() => (
          <ProfileScreen user={user} onLogout={onLogout} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const AuthNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const firebaseService = FirebaseService.getInstance();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Verificar si hay un usuario previamente autenticado
      const currentUser = firebaseService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (authenticatedUser: FirebaseUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Usuario autenticado - mostrar app principal
          <Stack.Screen name="Main">
            {() => <MainTabNavigator user={user} onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          // Usuario no autenticado - mostrar login
          <Stack.Screen name="Login">
            {() => <LoginScreen onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default AuthNavigator;