import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import FirebaseService, { type FirebaseUser } from '../services/FirebaseService';
import GPSService from '../services/GPSService';

interface MenuActivityProps {
  user: FirebaseUser;
  onLogout: () => void;
  onNavigateToDeliveryCalculator: () => void;
}

const MenuActivity: React.FC<MenuActivityProps> = ({ 
  user, 
  onLogout, 
  onNavigateToDeliveryCalculator 
}) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [gpsPermission, setGpsPermission] = useState<'granted' | 'denied' | 'checking'>('checking');

  const firebaseService = FirebaseService.getInstance();
  const gpsService = GPSService.getInstance();

  // Cargar datos del usuario y verificar permisos GPS
  useEffect(() => {
    loadUserData();
    checkGPSPermission();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      // Por ahora usamos los datos del usuario actual
      // En el futuro se puede extender con getUserProfile
      setUserProfile({
        displayName: user.email?.split('@')[0],
        email: user.email,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkGPSPermission = async () => {
    try {
      const hasPermission = await gpsService.requestLocationPermissions();
      setGpsPermission(hasPermission ? 'granted' : 'denied');
      
      if (hasPermission) {
        await trackCurrentLocation();
      }
    } catch (error) {
      console.error('Error checking GPS permission:', error);
      setGpsPermission('denied');
    }
  };

  const trackCurrentLocation = async () => {
    try {
      const position = await gpsService.getCurrentPosition();
      if (position) {
        setLocationData(position);
        
        // Convertir GPSCoordinates a LocationData para Firebase
        const locationData = {
          latitude: position.latitude,
          longitude: position.longitude,
          timestamp: position.timestamp || Date.now(),
          accuracy: position.accuracy,
        };
        
        // Guardar ubicación en Firebase usando FirebaseService
        await firebaseService.saveLocationToDatabase(locationData);
      }
    } catch (error) {
      console.error('Error tracking location:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await firebaseService.signOut();
              onLogout();
            } catch (error: any) {
              Alert.alert('Error', 'Error al cerrar sesión: ' + error.message);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    if (gpsPermission === 'granted') {
      await trackCurrentLocation();
    }
    setRefreshing(false);
  };

  const handleRequestGPSPermission = async () => {
    setGpsPermission('checking');
    await checkGPSPermission();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const formatDistance = (distance: number) => {
    return distance < 1000 
      ? `${Math.round(distance)} metros`
      : `${(distance / 1000).toFixed(2)} km`;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header con información del usuario */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={40} color="#fff" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {userProfile?.displayName || user.email?.split('@')[0] || 'Usuario'}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {userProfile?.createdAt && (
              <Text style={styles.userSince}>
                Usuario desde: {formatDate(userProfile.createdAt)}
              </Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Icon name="logout" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>

      {/* Estado del GPS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado del GPS</Text>
        <View style={styles.gpsStatusCard}>
          <Icon 
            name={gpsPermission === 'granted' ? 'location-on' : 'location-off'} 
            size={24} 
            color={gpsPermission === 'granted' ? '#4caf50' : '#f44336'} 
          />
          <View style={styles.gpsStatusText}>
            <Text style={styles.gpsStatus}>
              {gpsPermission === 'granted' ? 'GPS Activado' : 
               gpsPermission === 'denied' ? 'GPS Desactivado' : 
               'Verificando permisos...'}
            </Text>
            {gpsPermission === 'denied' && (
              <TouchableOpacity 
                style={styles.enableGpsButton}
                onPress={handleRequestGPSPermission}
              >
                <Text style={styles.enableGpsText}>Activar GPS</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {locationData && (
          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>Ubicación actual:</Text>
            <Text style={styles.locationAddress}>
              📍 El Quisco, Región de Valparaíso
            </Text>
            <Text style={styles.locationText}>
              Lat: {locationData.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Lng: {locationData.longitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Distancia al almacén: {formatDistance(locationData.distanceToWarehouse)}
            </Text>
            <Text style={styles.locationTime}>
              Actualizado: {formatDate(locationData.timestamp)}
            </Text>
          </View>
        )}
      </View>

      {/* Opciones del menú */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividades del Taller</Text>
        
        <TouchableOpacity 
          style={styles.menuOption}
          onPress={onNavigateToDeliveryCalculator}
        >
          <View style={styles.menuOptionLeft}>
            <Icon name="calculate" size={24} color="#2196F3" />
            <View style={styles.menuOptionText}>
              <Text style={styles.menuOptionTitle}>Calculadora de Entregas</Text>
              <Text style={styles.menuOptionSubtitle}>
                Actividad 1: Calcular costos de entrega
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuOption}
          onPress={() => Alert.alert('En desarrollo', 'Esta funcionalidad estará disponible pronto')}
        >
          <View style={styles.menuOptionLeft}>
            <Icon name="map" size={24} color="#4caf50" />
            <View style={styles.menuOptionText}>
              <Text style={styles.menuOptionTitle}>Tracking GPS</Text>
              <Text style={styles.menuOptionSubtitle}>
                Actividad 3: Seguimiento en tiempo real
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuOption}
          onPress={() => Alert.alert('En desarrollo', 'Esta funcionalidad estará disponible pronto')}
        >
          <View style={styles.menuOptionLeft}>
            <Icon name="analytics" size={24} color="#ff9800" />
            <View style={styles.menuOptionText}>
              <Text style={styles.menuOptionTitle}>Reportes</Text>
              <Text style={styles.menuOptionSubtitle}>
                Historial de entregas y análisis
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        {/* Nuevas funcionalidades Actividad 7 */}
        <TouchableOpacity 
          style={styles.menuOption}
          onPress={() => {
            try {
              navigation.navigate('InventoryAdvanced' as never);
            } catch (error) {
              Alert.alert('Navegación', 'Accediendo a Inventario Avanzado...');
            }
          }}
        >
          <View style={styles.menuOptionLeft}>
            <Icon name="inventory" size={24} color="#4caf50" />
            <View style={styles.menuOptionText}>
              <Text style={styles.menuOptionTitle}>Inventario Avanzado</Text>
              <Text style={styles.menuOptionSubtitle}>
                Actividad 7: Gestión inteligente de stock
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuOption}
          onPress={() => {
            try {
              navigation.navigate('VehicleManagement' as never);
            } catch (error) {
              Alert.alert('Navegación', 'Accediendo a Gestión de Vehículos...');
            }
          }}
        >
          <View style={styles.menuOptionLeft}>
            <Icon name="local-shipping" size={24} color="#2196F3" />
            <View style={styles.menuOptionText}>
              <Text style={styles.menuOptionTitle}>Gestión de Vehículos</Text>
              <Text style={styles.menuOptionSubtitle}>
                Actividad 7: Manejo de flota vehicular
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuOption}
          onPress={() => {
            try {
              navigation.navigate('RouteManagement' as never);
            } catch (error) {
              Alert.alert('Navegación', 'Accediendo a Optimización de Rutas...');
            }
          }}
        >
          <View style={styles.menuOptionLeft}>
            <Icon name="route" size={24} color="#9c27b0" />
            <View style={styles.menuOptionText}>
              <Text style={styles.menuOptionTitle}>Optimización de Rutas</Text>
              <Text style={styles.menuOptionSubtitle}>
                Actividad 7: Planificación inteligente
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Información de la aplicación */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Icon name="info" size={16} color="#666" />
            <Text style={styles.infoText}>Taller de Logística - React Native</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="cloud" size={16} color="#666" />
            <Text style={styles.infoText}>Firebase RealTime Database</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="android" size={16} color="#666" />
            <Text style={styles.infoText}>Android nativo</Text>
          </View>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  userSince: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  logoutButton: {
    padding: 8,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  gpsStatusCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 8,
  },
  gpsStatusText: {
    marginLeft: 12,
    flex: 1,
  },
  gpsStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  enableGpsButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  enableGpsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#388e3c',
    marginBottom: 2,
  },
  locationTime: {
    fontSize: 10,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  locationAddress: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 8,
  },
  menuOption: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuOptionText: {
    marginLeft: 16,
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  menuOptionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 16,
  },
});

export default MenuActivity;