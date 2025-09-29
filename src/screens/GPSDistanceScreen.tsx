import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GeolocationService, GPSCoordinate, DistanceResult } from '../services/GeolocationService';

const GPSDistanceScreen = () => {
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GPSCoordinate | null>(null);
  const [distanceResult, setDistanceResult] = useState<DistanceResult | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await GeolocationService.getMockDeviceLocation();
      setCurrentLocation(location);
      
      // Automáticamente calcular distancia a la bodega
      const result = GeolocationService.calculateDistanceToWarehouse(location);
      setDistanceResult(result);
      
      Alert.alert(
        '📍 Ubicación Obtenida',
        `${location.name}\nLat: ${location.latitude}\nLng: ${location.longitude}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación');
      console.error('Error obteniendo ubicación:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocationInput = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Error', 'Por favor ingresa coordenadas válidas');
      return;
    }

    const manualLocation: GPSCoordinate = {
      latitude: lat,
      longitude: lng,
      name: 'Ubicación Manual'
    };

    if (!GeolocationService.validateCoordinates(manualLocation)) {
      Alert.alert('Error', 'Las coordenadas están fuera del rango válido');
      return;
    }

    setCurrentLocation(manualLocation);
    const result = GeolocationService.calculateDistanceToWarehouse(manualLocation);
    setDistanceResult(result);

    Alert.alert(
      '✅ Coordenadas Ingresadas',
      `Lat: ${lat}\nLng: ${lng}`
    );
  };

  const handleTestHaversineFormula = () => {
    // Coordenadas de prueba para demostrar la fórmula
    const testOrigin: GPSCoordinate = {
      latitude: -12.0464,
      longitude: -77.0428,
      name: 'Plaza de Armas Lima'
    };

    const testDestination: GPSCoordinate = {
      latitude: -12.0621,
      longitude: -77.0365,
      name: 'Miraflores'
    };

    const result = GeolocationService.calculateHaversineDistance(testOrigin, testDestination);
    
    Alert.alert(
      '🧮 Prueba de Fórmula Haversine',
      `Distancia calculada:\n${result.distanceKm} km\n${result.distanceMeters} metros\n\nRevisa la consola para ver el cálculo detallado.`
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="gps-fixed" size={32} color="#4CAF50" />
        <Text style={styles.title}>Calculadora GPS</Text>
        <Text style={styles.subtitle}>Fórmula Haversine - Distancia a Bodega</Text>
      </View>

      {/* Sección 1: Obtener ubicación */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📡 Obtener Ubicación Actual</Text>
        
        <TouchableOpacity 
          style={styles.locationButton} 
          onPress={handleGetCurrentLocation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Icon name="my-location" size={20} color="#fff" />
          )}
          <Text style={styles.buttonText}>
            {loading ? 'Obteniendo GPS...' : 'Obtener Mi Ubicación'}
          </Text>
        </TouchableOpacity>

        {currentLocation && (
          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>{currentLocation.name}</Text>
            <Text style={styles.locationCoords}>
              📍 Latitud: {currentLocation.latitude}°
            </Text>
            <Text style={styles.locationCoords}>
              📍 Longitud: {currentLocation.longitude}°
            </Text>
          </View>
        )}
      </View>

      {/* Sección 2: Entrada manual de coordenadas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✏️ Ingresar Coordenadas Manualmente</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Latitud</Text>
          <TextInput
            style={styles.input}
            value={manualLat}
            onChangeText={setManualLat}
            placeholder="Ej: -12.0464"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Longitud</Text>
          <TextInput
            style={styles.input}
            value={manualLng}
            onChangeText={setManualLng}
            placeholder="Ej: -77.0428"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={styles.manualButton} onPress={handleManualLocationInput}>
          <Icon name="edit-location" size={20} color="#fff" />
          <Text style={styles.buttonText}>Usar Coordenadas Manuales</Text>
        </TouchableOpacity>
      </View>

      {/* Sección 3: Resultado de distancia */}
      {distanceResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📏 Resultado del Cálculo</Text>
          
          <View style={styles.resultCard}>
            <View style={styles.warehouseInfo}>
              <Text style={styles.warehouseTitle}>🏪 Bodega Central</Text>
              <Text style={styles.warehouseCoords}>
                Plaza de Armas: {GeolocationService.WAREHOUSE_LOCATION.latitude}°, {GeolocationService.WAREHOUSE_LOCATION.longitude}°
              </Text>
            </View>

            <View style={styles.distanceInfo}>
              <View style={styles.distanceRow}>
                <Text style={styles.distanceLabel}>Distancia:</Text>
                <Text style={styles.distanceValue}>{distanceResult.distanceKm} km</Text>
              </View>
              
              <View style={styles.distanceRow}>
                <Text style={styles.distanceLabel}>En metros:</Text>
                <Text style={styles.distanceValue}>{distanceResult.distanceMeters.toLocaleString()} m</Text>
              </View>

              <View style={styles.distanceRow}>
                <Text style={styles.distanceLabel}>Tiempo cálculo:</Text>
                <Text style={styles.distanceValue}>{distanceResult.calculationTime} ms</Text>
              </View>
            </View>

            <View style={styles.deliveryStatus}>
              {distanceResult.distanceKm <= 20 ? (
                <View style={styles.deliverableStatus}>
                  <Icon name="check-circle" size={24} color="#4CAF50" />
                  <Text style={styles.deliverableText}>✅ ENTREGA POSIBLE</Text>
                  <Text style={styles.deliverableSubtext}>Dentro del radio de 20 km</Text>
                </View>
              ) : (
                <View style={styles.nonDeliverableStatus}>
                  <Icon name="cancel" size={24} color="#f44336" />
                  <Text style={styles.nonDeliverableText}>❌ FUERA DE RANGO</Text>
                  <Text style={styles.nonDeliverableSubtext}>Más de 20 km de distancia</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Sección 4: Información de la Fórmula Haversine */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧮 Fórmula Haversine</Text>
        
        <View style={styles.formulaCard}>
          <Text style={styles.formulaTitle}>Cálculo de Distancia GPS</Text>
          <Text style={styles.formulaText}>R = radio de la Tierra (6371 km)</Text>
          <Text style={styles.formulaText}>Δlat = lat2 - lat1</Text>
          <Text style={styles.formulaText}>Δlong = long2 - long1</Text>
          <Text style={styles.formulaText}>a = sin²(Δlat/2) + cos(lat1) · cos(lat2) · sin²(Δlong/2)</Text>
          <Text style={styles.formulaText}>c = 2 · atan2(√a, √(1−a))</Text>
          <Text style={styles.formulaText}>d = R · c</Text>
        </View>

        <TouchableOpacity style={styles.testButton} onPress={handleTestHaversineFormula}>
          <Icon name="functions" size={20} color="#fff" />
          <Text style={styles.buttonText}>Probar Fórmula Haversine</Text>
        </TouchableOpacity>
      </View>

      {/* Información adicional */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Información del Sistema</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>• La fórmula Haversine calcula la distancia más corta entre dos puntos en una esfera</Text>
          <Text style={styles.infoText}>• Se utiliza para determinar si una ubicación está dentro del radio de entrega</Text>
          <Text style={styles.infoText}>• Las coordenadas se convierten a radianes para los cálculos trigonométricos</Text>
          <Text style={styles.infoText}>• La precisión es suficiente para distancias de entrega urbana</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  locationCard: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  locationCoords: {
    fontSize: 14,
    color: '#388e3c',
    marginBottom: 4,
  },
  resultCard: {
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  warehouseInfo: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  warehouseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  warehouseCoords: {
    fontSize: 12,
    color: '#666',
  },
  distanceInfo: {
    marginBottom: 16,
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  distanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  distanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  deliveryStatus: {
    alignItems: 'center',
  },
  deliverableStatus: {
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  deliverableText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 8,
  },
  deliverableSubtext: {
    fontSize: 12,
    color: '#388e3c',
    marginTop: 4,
  },
  nonDeliverableStatus: {
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  nonDeliverableText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginTop: 8,
  },
  nonDeliverableSubtext: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  formulaCard: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  formulaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  formulaText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default GPSDistanceScreen;