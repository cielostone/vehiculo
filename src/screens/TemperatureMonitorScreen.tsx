/**
 * TemperatureMonitorScreen.tsx
 * Pantalla principal de monitoreo de temperatura
 * Actividad 8 - Sistema de monitoreo de temperatura
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  IconButton,
  Surface,
  ProgressBar
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import TemperatureService, { 
  TemperatureReading, 
  TemperatureRange, 
  TemperatureStats 
} from '../services/TemperatureService';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Props de la pantalla
 */
interface TemperatureMonitorScreenProps {
  navigation: any;
}

/**
 * Pantalla de monitoreo de temperatura
 */
const TemperatureMonitorScreen: React.FC<TemperatureMonitorScreenProps> = ({ navigation }) => {
  const [currentReading, setCurrentReading] = useState<TemperatureReading | null>(null);
  const [temperatureHistory, setTemperatureHistory] = useState<TemperatureReading[]>([]);
  const [temperatureStats, setTemperatureStats] = useState<TemperatureStats | null>(null);
  const [activeRange, setActiveRange] = useState<TemperatureRange | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const temperatureService = TemperatureService.getInstance();

  useEffect(() => {
    loadInitialData();
    setupTemperatureListener();
    
    return () => {
      // Cleanup listeners
    };
  }, []);

  /**
   * Carga datos iniciales
   */
  const loadInitialData = async () => {
    try {
      const [history, stats, range] = await Promise.all([
        temperatureService.getTemperatureHistory(20),
        temperatureService.getTemperatureStats(),
        temperatureService.getActiveTemperatureRange()
      ]);

      setTemperatureHistory(history);
      setTemperatureStats(stats);
      setActiveRange(range);
      
      if (history.length > 0) {
        setCurrentReading(history[0]);
      }

      setAlertsEnabled(temperatureService.areAlertsEnabled());
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      Alert.alert('Error', 'Error cargando datos de temperatura');
    }
  };

  /**
   * Configura listener para nuevas lecturas
   */
  const setupTemperatureListener = () => {
    temperatureService.subscribeToTemperatureUpdates((reading: TemperatureReading) => {
      setCurrentReading(reading);
      setTemperatureHistory(prev => [reading, ...prev.slice(0, 19)]);
    });
  };

  /**
   * Maneja refresh de la pantalla
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setIsRefreshing(false);
  };

  /**
   * Alterna el monitoreo de temperatura
   */
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      temperatureService.startMonitoring();
    } else {
      temperatureService.stopMonitoring();
    }
  };

  /**
   * Alterna las alertas
   */
  const toggleAlerts = () => {
    const newState = !alertsEnabled;
    setAlertsEnabled(newState);
    temperatureService.setAlertsEnabled(newState);
  };

  /**
   * Prueba el sistema de alertas
   */
  const testAlerts = () => {
    temperatureService.testAlerts();
  };

  /**
   * Navega a configuración
   */
  const navigateToConfig = () => {
    navigation.navigate('TemperatureConfig');
  };

  /**
   * Obtiene color según temperatura
   */
  const getTemperatureColor = (celsius: number): string => {
    if (!activeRange) return '#2196F3';
    
    if (celsius < activeRange.minCelsius) return '#F44336'; // Rojo para frío
    if (celsius > activeRange.maxCelsius) return '#FF9800'; // Naranja para caliente
    return '#4CAF50'; // Verde para normal
  };

  /**
   * Obtiene icono según temperatura
   */
  const getTemperatureIcon = (celsius: number): string => {
    if (!activeRange) return 'thermometer';
    
    if (celsius < activeRange.minCelsius) return 'snowflake';
    if (celsius > activeRange.maxCelsius) return 'fire';
    return 'thermometer-check';
  };

  /**
   * Formatea datos para el gráfico
   */
  const formatChartData = () => {
    if (temperatureHistory.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }]
      };
    }

    const last10Readings = temperatureHistory.slice(0, 10).reverse();
    return {
      labels: last10Readings.map((_, index) => `${index + 1}`),
      datasets: [{
        data: last10Readings.map(reading => reading.temperatureCelsius),
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <Title style={styles.headerTitle}>Monitor de Temperatura</Title>
          <View style={styles.headerActions}>
            <IconButton
              icon={isMonitoring ? 'pause' : 'play'}
              size={24}
              onPress={toggleMonitoring}
            />
            <IconButton
              icon="cog"
              size={24}
              onPress={navigateToConfig}
            />
          </View>
        </View>
      </Surface>

      {/* Lectura actual */}
      <Card style={styles.currentReadingCard}>
        <Card.Content>
          <View style={styles.currentReadingHeader}>
            <Title>Temperatura Actual</Title>
            <IconButton
              icon={currentReading ? getTemperatureIcon(currentReading.temperatureCelsius) : 'thermometer'}
              size={32}
              iconColor={currentReading ? getTemperatureColor(currentReading.temperatureCelsius) : '#2196F3'}
            />
          </View>
          
          {currentReading ? (
            <View style={styles.temperatureDisplay}>
              <Text style={[styles.temperatureValue, { color: getTemperatureColor(currentReading.temperatureCelsius) }]}>
                {currentReading.temperatureCelsius.toFixed(1)}°C
              </Text>
              <Text style={styles.temperatureFahrenheit}>
                ({currentReading.temperatureFahrenheit.toFixed(1)}°F)
              </Text>
              <Text style={styles.temperatureTime}>
                {currentReading.timestamp.toLocaleTimeString()}
              </Text>
              <Text style={styles.temperatureLocation}>
                📍 {currentReading.location}
              </Text>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Sin lecturas disponibles</Text>
            </View>
          )}
          
          {/* Estado del rango */}
          {activeRange && currentReading && (
            <View style={styles.rangeStatus}>
              <Chip
                icon={currentReading.isWithinRange ? 'check-circle' : 'alert-circle'}
                style={[
                  styles.statusChip,
                  { backgroundColor: currentReading.isWithinRange ? '#E8F5E8' : '#FFEBEE' }
                ]}
                textStyle={{
                  color: currentReading.isWithinRange ? '#4CAF50' : '#F44336'
                }}
              >
                {currentReading.isWithinRange ? 'En Rango' : 'Fuera de Rango'}
              </Chip>
              <Text style={styles.rangeText}>
                Rango: {activeRange.minCelsius}°C - {activeRange.maxCelsius}°C
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Estadísticas */}
      {temperatureStats && (
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title>Estadísticas del Día</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Promedio</Text>
                <Text style={styles.statValue}>{temperatureStats.averageCelsius.toFixed(1)}°C</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Mínima</Text>
                <Text style={styles.statValue}>{temperatureStats.minCelsius.toFixed(1)}°C</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Máxima</Text>
                <Text style={styles.statValue}>{temperatureStats.maxCelsius.toFixed(1)}°C</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Lecturas</Text>
                <Text style={styles.statValue}>{temperatureStats.readingsToday}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Alertas</Text>
                <Text style={[styles.statValue, { color: temperatureStats.alertsToday > 0 ? '#F44336' : '#4CAF50' }]}>
                  {temperatureStats.alertsToday}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Gráfico */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title>Historial de Temperatura</Title>
          {temperatureHistory.length > 0 ? (
            <LineChart
              data={formatChartData()}
              width={screenWidth - 60}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#2196F3'
                }
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noChartData}>Sin datos para mostrar gráfico</Text>
          )}
        </Card.Content>
      </Card>

      {/* Controles */}
      <Card style={styles.controlsCard}>
        <Card.Content>
          <Title>Controles</Title>
          <View style={styles.controlsGrid}>
            <Button
              mode={isMonitoring ? 'contained' : 'outlined'}
              onPress={toggleMonitoring}
              icon={isMonitoring ? 'pause' : 'play'}
              style={styles.controlButton}
            >
              {isMonitoring ? 'Pausar' : 'Iniciar'} Monitoreo
            </Button>
            
            <Button
              mode={alertsEnabled ? 'contained' : 'outlined'}
              onPress={toggleAlerts}
              icon={alertsEnabled ? 'bell' : 'bell-off'}
              style={styles.controlButton}
            >
              Alertas {alertsEnabled ? 'ON' : 'OFF'}
            </Button>
            
            <Button
              mode="outlined"
              onPress={testAlerts}
              icon="bell-ring"
              style={styles.controlButton}
            >
              Probar Alertas
            </Button>
            
            <Button
              mode="outlined"
              onPress={navigateToConfig}
              icon="cog"
              style={styles.controlButton}
            >
              Configuración
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Información del sistema */}
      <Card style={styles.systemCard}>
        <Card.Content>
          <Title>Estado del Sistema</Title>
          <View style={styles.systemInfo}>
            <View style={styles.systemItem}>
              <Text style={styles.systemLabel}>Monitoreo:</Text>
              <Chip style={[styles.systemChip, { backgroundColor: isMonitoring ? '#E8F5E8' : '#FFEBEE' }]}>
                {isMonitoring ? 'Activo' : 'Inactivo'}
              </Chip>
            </View>
            
            <View style={styles.systemItem}>
              <Text style={styles.systemLabel}>Alertas:</Text>
              <Chip style={[styles.systemChip, { backgroundColor: alertsEnabled ? '#E8F5E8' : '#FFEBEE' }]}>
                {alertsEnabled ? 'Habilitadas' : 'Deshabilitadas'}
              </Chip>
            </View>
            
            {activeRange && (
              <View style={styles.systemItem}>
                <Text style={styles.systemLabel}>Rango Activo:</Text>
                <Text style={styles.systemValue}>{activeRange.name}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    elevation: 4,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  currentReadingCard: {
    margin: 16,
    marginBottom: 8,
  },
  currentReadingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  temperatureDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  temperatureValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  temperatureFahrenheit: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  temperatureTime: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  temperatureLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
  },
  rangeStatus: {
    alignItems: 'center',
    marginTop: 16,
  },
  statusChip: {
    marginBottom: 8,
  },
  rangeText: {
    fontSize: 14,
    color: '#666',
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chartCard: {
    margin: 16,
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noChartData: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 32,
  },
  controlsCard: {
    margin: 16,
    marginBottom: 8,
  },
  controlsGrid: {
    marginTop: 16,
  },
  controlButton: {
    marginBottom: 8,
  },
  systemCard: {
    margin: 16,
    marginBottom: 32,
  },
  systemInfo: {
    marginTop: 16,
  },
  systemItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  systemLabel: {
    fontSize: 16,
    color: '#666',
  },
  systemChip: {
    minWidth: 80,
  },
  systemValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default TemperatureMonitorScreen;