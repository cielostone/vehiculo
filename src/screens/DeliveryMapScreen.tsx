/**
 * DeliveryMapScreen.tsx
 * Pantalla principal de la Actividad Sumativa - Semana 9
 * Empresa de Distribución de Alimentos con Mapa y Cadena de Frío
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  IconButton,
  Surface,
  TextInput,
  FAB
} from 'react-native-paper';

// Importar servicios existentes
import GPSService, { GPSCoordinates } from '../services/GPSService';
import { DeliveryService } from '../services/DeliveryService';
import TemperatureService, { TemperatureReading } from '../services/TemperatureService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Props de la pantalla
 */
interface DeliveryMapScreenProps {
  navigation: any;
}

/**
 * Información de entrega
 */
interface DeliveryInfo {
  origin: GPSCoordinates;
  destination: GPSCoordinates | null;
  distance: number;
  cost: number;
  purchaseAmount: number;
  route: GPSCoordinates[];
}

/**
 * Pantalla principal del sistema de distribución de alimentos
 */
const DeliveryMapScreen: React.FC<DeliveryMapScreenProps> = ({ navigation }) => {
  // Referencias
  const mapRef = useRef<MapView>(null);
  
  // Estados principales
  const [currentLocation, setCurrentLocation] = useState<GPSCoordinates | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    origin: { latitude: -33.4086, longitude: -71.6967 }, // El Quisco por defecto
    destination: null,
    distance: 0,
    cost: 0,
    purchaseAmount: 30000, // Valor por defecto
    route: []
  });
  
  // Estados de UI
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTemperature, setShowTemperature] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [purchaseAmountInput, setPurchaseAmountInput] = useState('30000');
  
  // Estados de temperatura
  const [currentTemperature, setCurrentTemperature] = useState<TemperatureReading | null>(null);
  const [temperatureAlerts, setTemperatureAlerts] = useState<number>(0);
  
  // Servicios
  const gpsService = GPSService.getInstance();
  const deliveryService = new DeliveryService();
  const temperatureService = TemperatureService.getInstance();

  useEffect(() => {
    initializeServices();
    getCurrentLocation();
    setupTemperatureMonitoring();
  }, []);

  /**
   * Inicializa los servicios
   */
  const initializeServices = () => {
    console.log('🚀 Inicializando servicios para Actividad Sumativa');
  };

  /**
   * Obtiene la ubicación actual del dispositivo
   */
  const getCurrentLocation = async () => {
    try {
      const location = await gpsService.getCurrentPosition();
      setCurrentLocation(location);
      setDeliveryInfo(prev => ({
        ...prev,
        origin: location
      }));
      
      // Centrar mapa en ubicación actual
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }
      
      console.log('📍 Ubicación actual obtenida:', location);
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Alert.alert(
        'Error de GPS',
        'No se pudo obtener la ubicación actual. Usando ubicación por defecto.',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Configura el monitoreo de temperatura
   */
  const setupTemperatureMonitoring = () => {
    // Suscribirse a actualizaciones de temperatura
    const unsubscribe = temperatureService.subscribeToTemperatureUpdates((reading: TemperatureReading) => {
      setCurrentTemperature(reading);
      
      // Contar alertas
      if (!reading.isWithinRange) {
        setTemperatureAlerts(prev => prev + 1);
      }
    });

    return unsubscribe;
  };

  /**
   * Maneja el toque en el mapa para establecer destino
   */
  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const destination: GPSCoordinates = { latitude, longitude };
    
    setDeliveryInfo(prev => ({
      ...prev,
      destination
    }));
    
    // Calcular distancia y costo automáticamente
    calculateDelivery(deliveryInfo.origin, destination, parseFloat(purchaseAmountInput));
  };

  /**
   * Calcula la información de entrega
   */
  const calculateDelivery = async (origin: GPSCoordinates, destination: GPSCoordinates, purchaseAmount: number) => {
    setIsCalculating(true);
    
    try {
      // Calcular distancia usando el servicio existente
      const distance = gpsService.calculateHaversineDistance(
        origin.latitude, 
        origin.longitude, 
        destination.latitude, 
        destination.longitude
      );
      
      // Calcular costo usando las reglas de negocio
      const cost = calculateDeliveryCost(distance, purchaseAmount);
      
      // Generar ruta simple (línea recta por ahora)
      const route = [origin, destination];
      
      setDeliveryInfo(prev => ({
        ...prev,
        destination,
        distance,
        cost,
        purchaseAmount,
        route
      }));
      
      console.log(`📦 Entrega calculada: ${distance.toFixed(2)}km - $${cost}`);
      
    } catch (error) {
      console.error('Error calculando entrega:', error);
      Alert.alert('Error', 'No se pudo calcular la entrega');
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * Calcula el costo de entrega según las reglas de negocio
   */
  const calculateDeliveryCost = (distanceKm: number, purchaseAmount: number): number => {
    const pricePerKm = purchaseAmount >= 25000 ? 150 : 300;
    return distanceKm * pricePerKm;
  };

  /**
   * Maneja el cambio del monto de compra
   */
  const handlePurchaseAmountChange = (value: string) => {
    setPurchaseAmountInput(value);
    const amount = parseFloat(value) || 0;
    
    if (deliveryInfo.destination) {
      calculateDelivery(deliveryInfo.origin, deliveryInfo.destination, amount);
    }
  };

  /**
   * Centra el mapa en la ubicación actual
   */
  const centerOnCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  };

  /**
   * Muestra información de pruebas
   */
  const showTestInfo = () => {
    Alert.alert(
      '🧪 Plan de Pruebas - Actividad Sumativa',
      'Pruebas implementadas:\n\n' +
      '1️⃣ Geolocalización GPS\n' +
      '2️⃣ Cálculo de distancia y costo\n' +
      '3️⃣ Monitoreo de cadena de frío\n\n' +
      'Toca diferentes puntos en el mapa para probar los cálculos.',
      [{ text: 'Entendido' }]
    );
  };

  /**
   * Obtiene el color del marcador según la temperatura
   */
  const getTemperatureColor = (): string => {
    if (!currentTemperature) return '#2196F3';
    return currentTemperature.isWithinRange ? '#4CAF50' : '#F44336';
  };

  return (
    <View style={styles.container}>
      {/* Google Maps real */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: -33.4086,
          longitude: -71.6967,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
        mapType="standard"
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {/* Marcador de central */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Distribuidora Central"
            description="Almacén principal de alimentos"
            pinColor="#2196F3"
          />
        )}
        
        {/* Marcador de destino */}
        {deliveryInfo.destination && (
          <Marker
            coordinate={deliveryInfo.destination}
            title="Destino de Entrega"
            description={`Distancia: ${deliveryInfo.distance.toFixed(2)}km - Costo: $${deliveryInfo.cost.toFixed(0)}`}
            pinColor={getTemperatureColor()}
          />
        )}
      </MapView>

      {/* Panel de información superior */}
      <Surface style={styles.topPanel}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyTitle}>Distribuidora de Alimentos</Text>
            <Text style={styles.subtitle}>Sistema de Entregas - Actividad Sumativa</Text>
          </View>
          <IconButton
            icon="help-circle"
            size={24}
            onPress={showTestInfo}
          />
        </View>
      </Surface>

      {/* Panel de información de entrega */}
      {deliveryInfo.destination && (
        <Surface style={styles.deliveryPanel}>
          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>📏 Distancia:</Text>
              <Text style={styles.deliveryValue}>{deliveryInfo.distance.toFixed(2)} km</Text>
            </View>
            
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>💰 Costo:</Text>
              <Text style={styles.deliveryValue}>${deliveryInfo.cost.toFixed(0)}</Text>
            </View>
            
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>🛒 Compra:</Text>
              <Text style={styles.deliveryValue}>${deliveryInfo.purchaseAmount.toLocaleString()}</Text>
            </View>
            
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>📊 Tarifa:</Text>
              <Text style={styles.deliveryValue}>
                ${deliveryInfo.purchaseAmount >= 25000 ? '150' : '300'}/km
              </Text>
            </View>
          </View>
        </Surface>
      )}

      {/* Panel de temperatura */}
      {currentTemperature && (
        <Surface style={styles.temperaturePanel}>
          <View style={styles.temperatureInfo}>
            <Text style={styles.temperatureTitle}>🌡️ Cadena de Frío</Text>
            <View style={styles.temperatureRow}>
              <Text style={styles.temperatureValue}>
                {currentTemperature ? currentTemperature.temperatureCelsius.toFixed(1) : '0.0'}°C
              </Text>
              <Chip
                icon={currentTemperature ? (currentTemperature.isWithinRange ? 'check-circle' : 'alert-circle') : 'thermometer'}
                style={[
                  styles.temperatureChip,
                  { backgroundColor: currentTemperature ? (currentTemperature.isWithinRange ? '#E8F5E8' : '#FFEBEE') : '#F5F5F5' }
                ]}
                textStyle={{
                  color: currentTemperature ? (currentTemperature.isWithinRange ? '#4CAF50' : '#F44336') : '#666'
                }}
              >
                {currentTemperature ? (currentTemperature.isWithinRange ? 'OK' : 'ALERTA') : 'N/A'}
              </Chip>
            </View>
            {temperatureAlerts > 0 && (
              <Text style={styles.alertCount}>⚠️ {temperatureAlerts} alertas hoy</Text>
            )}
          </View>
        </Surface>
      )}

      {/* Calculadora flotante */}
      {showCalculator && (
        <Surface style={styles.calculatorPanel}>
          <Text style={styles.calculatorTitle}>💰 Calculadora de Costo</Text>
          <TextInput
            label="Monto de Compra ($)"
            value={purchaseAmountInput}
            onChangeText={handlePurchaseAmountChange}
            keyboardType="numeric"
            style={styles.calculatorInput}
          />
          <Text style={styles.calculatorNote}>
            • $25,000 - $49,999: $150/km{'\n'}
            • Menor a $25,000: $300/km
          </Text>
          <Button
            mode="outlined"
            onPress={() => setShowCalculator(false)}
            style={styles.calculatorClose}
          >
            Cerrar
          </Button>
        </Surface>
      )}

      {/* Botones de acción flotantes */}
      <View style={styles.fabContainer}>
        <FAB
          icon="crosshairs-gps"
          style={[styles.fab, { backgroundColor: '#2196F3' }]}
          onPress={centerOnCurrentLocation}
          small
        />
        
        <FAB
          icon="calculator"
          style={[styles.fab, { backgroundColor: '#FF9800' }]}
          onPress={() => setShowCalculator(!showCalculator)}
          small
        />
        
        <FAB
          icon="thermometer"
          style={[styles.fab, { backgroundColor: getTemperatureColor() }]}
          onPress={() => navigation.navigate('TemperatureMonitor')}
          small
        />
      </View>

      {/* Instrucciones */}
      {!deliveryInfo.destination && (
        <Surface style={styles.instructionsPanel}>
          <Text style={styles.instructionsText}>
            📍 Toca cualquier punto en el mapa para calcular entrega
          </Text>
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  mapSubtitle: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 20,
  },
  locationInfo: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
  },
  destinationInfo: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
  },
  destinationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 4,
  },
  costText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  temperatureIndicator: {
    padding: 12,
    borderRadius: 20,
    marginTop: 16,
    elevation: 4,
  },
  temperatureText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  // Estilos para mapa visual
  mapVisual: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F8F0',
    borderRadius: 12,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  mapGrid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#C8E6C9',
  },
  horizontalLine: {
    width: '100%',
    height: 1,
  },
  verticalLine: {
    height: '100%',
    width: 1,
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralMarker: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    width: 40,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  destinationMarker: {
    backgroundColor: '#FF5722',
    borderRadius: 20,
    width: 40,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: 16,
    color: 'white',
  },
  markerLabel: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 2,
  },
  routeLine: {
    position: 'absolute',
    left: '45%',
    top: '45%',
    width: 100,
    height: 2,
    backgroundColor: '#FF9800',
    transform: [{ rotate: '-30deg' }],
    borderRadius: 1,
  },
  coverageCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    top: '50%',
    left: '50%',
    marginTop: -60,
    marginLeft: -60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverageText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  topPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    elevation: 4,
    padding: 16,
    backgroundColor: 'white',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deliveryPanel: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    elevation: 4,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  deliveryInfo: {
    gap: 8,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 14,
    color: '#666',
  },
  deliveryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  temperaturePanel: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    elevation: 4,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  temperatureInfo: {
    alignItems: 'center',
  },
  temperatureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  temperatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  temperatureValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  temperatureChip: {
    minWidth: 80,
  },
  alertCount: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  calculatorPanel: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    elevation: 8,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  calculatorInput: {
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  calculatorNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  calculatorClose: {
    marginTop: 8,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    gap: 8,
  },
  fab: {
    elevation: 8,
  },
  instructionsPanel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    elevation: 4,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
});

export default DeliveryMapScreen;