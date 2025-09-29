import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens (las crearemos después)
import DashboardScreen from '../screens/DashboardScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ShipmentsScreen from '../screens/ShipmentsScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DeliveryCalculatorScreen from '../screens/DeliveryCalculatorScreen';
import GPSDistanceScreen from '../screens/GPSDistanceScreen';

import { RootStackParamList } from '../types';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
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
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ 
          title: 'Inicio',
          headerTitle: 'Taller de Logística'
        }} 
      />
      <Tab.Screen 
        name="Inventory" 
        component={InventoryScreen} 
        options={{ title: 'Inventario' }} 
      />
      <Tab.Screen 
        name="Shipments" 
        component={ShipmentsScreen} 
        options={{ title: 'Envíos' }} 
      />
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
      <Tab.Screen 
        name="Activities" 
        component={ActivitiesScreen} 
        options={{ title: 'Actividades' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Perfil' }} 
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;