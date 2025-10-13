/**
 * TemperatureConfigScreen.tsx
 * Pantalla de configuración del sistema de monitoreo de temperatura
 * Actividad 8 - Sistema de monitoreo de temperatura
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TextInput as RNTextInput
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Switch as PaperSwitch,
  Chip,
  IconButton,
  Surface,
  Divider,
  List
} from 'react-native-paper';
import TemperatureService, { TemperatureRange } from '../services/TemperatureService';
import LocalStorageService, { 
  TemperatureConfig, 
  AlertConfiguration, 
  LocalTemperatureRange 
} from '../services/LocalStorageService';

/**
 * Props de la pantalla
 */
interface TemperatureConfigScreenProps {
  navigation: any;
}

/**
 * Pantalla de configuración de temperatura
 */
const TemperatureConfigScreen: React.FC<TemperatureConfigScreenProps> = ({ navigation }) => {
  const [temperatureConfig, setTemperatureConfig] = useState<TemperatureConfig | null>(null);
  const [alertConfig, setAlertConfig] = useState<AlertConfiguration | null>(null);
  const [customRanges, setCustomRanges] = useState<LocalTemperatureRange[]>([]);
  const [activeRange, setActiveRange] = useState<TemperatureRange | null>(null);
  
  // Estados para el formulario de nuevo rango
  const [isAddingRange, setIsAddingRange] = useState(false);
  const [newRangeName, setNewRangeName] = useState('');
  const [newRangeMin, setNewRangeMin] = useState('');
  const [newRangeMax, setNewRangeMax] = useState('');
  const [newRangeDescription, setNewRangeDescription] = useState('');

  const temperatureService = TemperatureService.getInstance();
  const localStorageService = LocalStorageService.getInstance();

  useEffect(() => {
    loadConfiguration();
  }, []);

  /**
   * Carga la configuración actual
   */
  const loadConfiguration = async () => {
    try {
      const [tempConfig, alertConf, ranges, active] = await Promise.all([
        localStorageService.getTemperatureConfig(),
        localStorageService.getAlertConfig(),
        localStorageService.getCustomRanges(),
        temperatureService.getActiveTemperatureRange()
      ]);

      setTemperatureConfig(tempConfig);
      setAlertConfig(alertConf);
      setCustomRanges(ranges);
      setActiveRange(active);
    } catch (error) {
      console.error('Error cargando configuración:', error);
      Alert.alert('Error', 'Error cargando configuración');
    }
  };

  /**
   * Guarda la configuración de temperatura
   */
  const saveTemperatureConfig = async (config: TemperatureConfig) => {
    try {
      await localStorageService.saveTemperatureConfig(config);
      setTemperatureConfig(config);
      Alert.alert('Éxito', 'Configuración de temperatura guardada');
    } catch (error) {
      console.error('Error guardando configuración de temperatura:', error);
      Alert.alert('Error', 'Error guardando configuración');
    }
  };

  /**
   * Guarda la configuración de alertas
   */
  const saveAlertConfig = async (config: AlertConfiguration) => {
    try {
      await localStorageService.saveAlertConfig(config);
      temperatureService.configureAlerts(config);
      setAlertConfig(config);
      Alert.alert('Éxito', 'Configuración de alertas guardada');
    } catch (error) {
      console.error('Error guardando configuración de alertas:', error);
      Alert.alert('Error', 'Error guardando configuración de alertas');
    }
  };

  /**
   * Agrega un nuevo rango personalizado
   */
  const addCustomRange = async () => {
    if (!newRangeName || !newRangeMin || !newRangeMax) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const minTemp = parseFloat(newRangeMin);
    const maxTemp = parseFloat(newRangeMax);

    if (isNaN(minTemp) || isNaN(maxTemp)) {
      Alert.alert('Error', 'Temperaturas deben ser números válidos');
      return;
    }

    if (minTemp >= maxTemp) {
      Alert.alert('Error', 'Temperatura mínima debe ser menor que la máxima');
      return;
    }

    try {
      const newRange = await localStorageService.addCustomRange({
        name: newRangeName,
        minCelsius: minTemp,
        maxCelsius: maxTemp,
        description: newRangeDescription || 'Rango personalizado',
        isActive: false
      });

      setCustomRanges(prev => [...prev, newRange]);
      
      // Limpiar formulario
      setNewRangeName('');
      setNewRangeMin('');
      setNewRangeMax('');
      setNewRangeDescription('');
      setIsAddingRange(false);

      Alert.alert('Éxito', 'Rango personalizado agregado');
    } catch (error) {
      console.error('Error agregando rango:', error);
      Alert.alert('Error', 'Error agregando rango personalizado');
    }
  };

  /**
   * Elimina un rango personalizado
   */
  const deleteCustomRange = async (rangeId: string) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro que deseas eliminar este rango?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await localStorageService.deleteCustomRange(rangeId);
              setCustomRanges(prev => prev.filter(r => r.id !== rangeId));
              Alert.alert('Éxito', 'Rango eliminado');
            } catch (error) {
              console.error('Error eliminando rango:', error);
              Alert.alert('Error', 'Error eliminando rango');
            }
          }
        }
      ]
    );
  };

  /**
   * Activa un rango personalizado
   */
  const activateRange = async (range: LocalTemperatureRange) => {
    try {
      await temperatureService.setActiveTemperatureRange(range.id);
      
      // Actualizar estado local
      const updatedRanges = customRanges.map(r => ({
        ...r,
        isActive: r.id === range.id
      }));
      
      await localStorageService.saveCustomRanges(updatedRanges);
      setCustomRanges(updatedRanges);
      
      // Crear TemperatureRange compatible para el estado local
      const temperatureRange: TemperatureRange = {
        id: range.id,
        name: range.name,
        minCelsius: range.minCelsius,
        maxCelsius: range.maxCelsius,
        description: range.description,
        isActive: true,
        createdAt: new Date(range.createdAt)
      };
      setActiveRange(temperatureRange);

      Alert.alert('Éxito', `Rango "${range.name}" activado`);
    } catch (error) {
      console.error('Error activando rango:', error);
      Alert.alert('Error', 'Error activando rango');
    }
  };

  /**
   * Prueba las alertas
   */
  const testAlerts = () => {
    temperatureService.testAlerts();
  };

  /**
   * Resetea a configuración por defecto
   */
  const resetToDefaults = () => {
    Alert.alert(
      'Resetear Configuración',
      '¿Estás seguro que deseas resetear toda la configuración a valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: async () => {
            try {
              await localStorageService.clearAllData();
              await loadConfiguration();
              Alert.alert('Éxito', 'Configuración reseteada');
            } catch (error) {
              console.error('Error reseteando configuración:', error);
              Alert.alert('Error', 'Error reseteando configuración');
            }
          }
        }
      ]
    );
  };

  if (!temperatureConfig || !alertConfig) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando configuración...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Title style={styles.headerTitle}>Configuración</Title>
          <IconButton
            icon="restore"
            size={24}
            onPress={resetToDefaults}
          />
        </View>
      </Surface>

      {/* Configuración de Alertas */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Configuración de Alertas</Title>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Habilitar Sonido</Text>
            <PaperSwitch
              value={alertConfig.enableSound}
              onValueChange={(value) => 
                saveAlertConfig({ ...alertConfig, enableSound: value })
              }
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Habilitar Vibración</Text>
            <PaperSwitch
              value={alertConfig.enableVibration}
              onValueChange={(value) => 
                saveAlertConfig({ ...alertConfig, enableVibration: value })
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Intervalo entre Alertas (minutos)"
              value={alertConfig.alertInterval.toString()}
              onChangeText={(text) => {
                const interval = parseInt(text) || 5;
                saveAlertConfig({ ...alertConfig, alertInterval: interval });
              }}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <Button
            mode="outlined"
            onPress={testAlerts}
            icon="bell-ring"
            style={styles.testButton}
          >
            Probar Alertas
          </Button>
        </Card.Content>
      </Card>

      {/* Rango Activo */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Rango de Temperatura Activo</Title>
          {activeRange ? (
            <View style={styles.activeRangeContainer}>
              <Chip icon="thermometer" style={styles.activeRangeChip}>
                {activeRange.name}
              </Chip>
              <Text style={styles.activeRangeText}>
                {activeRange.minCelsius}°C - {activeRange.maxCelsius}°C
              </Text>
              <Text style={styles.activeRangeDescription}>
                {activeRange.description}
              </Text>
            </View>
          ) : (
            <Text style={styles.noActiveRange}>No hay rango activo</Text>
          )}
        </Card.Content>
      </Card>

      {/* Rangos Personalizados */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Rangos Personalizados</Title>
            <IconButton
              icon="plus"
              size={24}
              onPress={() => setIsAddingRange(!isAddingRange)}
            />
          </View>

          {/* Formulario para agregar rango */}
          {isAddingRange && (
            <View style={styles.addRangeForm}>
              <TextInput
                label="Nombre del Rango"
                value={newRangeName}
                onChangeText={setNewRangeName}
                style={styles.formInput}
              />
              
              <View style={styles.temperatureInputs}>
                <TextInput
                  label="Temp. Mínima (°C)"
                  value={newRangeMin}
                  onChangeText={setNewRangeMin}
                  keyboardType="numeric"
                  style={[styles.formInput, { flex: 1, marginRight: 8 }]}
                />
                
                <TextInput
                  label="Temp. Máxima (°C)"
                  value={newRangeMax}
                  onChangeText={setNewRangeMax}
                  keyboardType="numeric"
                  style={[styles.formInput, { flex: 1, marginLeft: 8 }]}
                />
              </View>

              <TextInput
                label="Descripción (opcional)"
                value={newRangeDescription}
                onChangeText={setNewRangeDescription}
                style={styles.formInput}
                multiline
                numberOfLines={2}
              />

              <View style={styles.formButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setIsAddingRange(false)}
                  style={styles.formButton}
                >
                  Cancelar
                </Button>
                
                <Button
                  mode="contained"
                  onPress={addCustomRange}
                  style={styles.formButton}
                >
                  Agregar
                </Button>
              </View>
            </View>
          )}

          {/* Lista de rangos */}
          <View style={styles.rangesList}>
            {customRanges.map((range) => (
              <View key={range.id} style={styles.rangeItem}>
                <View style={styles.rangeInfo}>
                  <Text style={styles.rangeName}>{range.name}</Text>
                  <Text style={styles.rangeTemp}>
                    {range.minCelsius}°C - {range.maxCelsius}°C
                  </Text>
                  <Text style={styles.rangeDescription}>
                    {range.description}
                  </Text>
                </View>
                
                <View style={styles.rangeActions}>
                  {range.isActive ? (
                    <Chip icon="check" style={styles.activeChip}>
                      Activo
                    </Chip>
                  ) : (
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => activateRange(range)}
                    >
                      Activar
                    </Button>
                  )}
                  
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => deleteCustomRange(range.id)}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Configuración General */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Configuración General</Title>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Alertas Habilitadas</Text>
            <PaperSwitch
              value={temperatureConfig.alertsEnabled}
              onValueChange={(value) => 
                saveTemperatureConfig({ ...temperatureConfig, alertsEnabled: value })
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Temperatura Mínima por Defecto (°C)"
              value={temperatureConfig.defaultMinCelsius.toString()}
              onChangeText={(text) => {
                const temp = parseFloat(text) || 2.0;
                saveTemperatureConfig({ ...temperatureConfig, defaultMinCelsius: temp });
              }}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Temperatura Máxima por Defecto (°C)"
              value={temperatureConfig.defaultMaxCelsius.toString()}
              onChangeText={(text) => {
                const temp = parseFloat(text) || 8.0;
                saveTemperatureConfig({ ...temperatureConfig, defaultMaxCelsius: temp });
              }}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Acciones */}
      <Card style={[styles.card, { marginBottom: 32 }]}>
        <Card.Content>
          <Title>Acciones</Title>
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('TemperatureMonitor')}
            icon="monitor"
            style={styles.actionButton}
          >
            Volver al Monitor
          </Button>
          
          <Button
            mode="outlined"
            onPress={resetToDefaults}
            icon="restore"
            style={styles.actionButton}
          >
            Resetear Configuración
          </Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    elevation: 4,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    marginVertical: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  testButton: {
    marginTop: 16,
  },
  activeRangeContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  activeRangeChip: {
    marginBottom: 8,
  },
  activeRangeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  activeRangeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  noActiveRange: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 16,
  },
  addRangeForm: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
    marginTop: 16,
  },
  formInput: {
    marginVertical: 8,
    backgroundColor: 'transparent',
  },
  temperatureInputs: {
    flexDirection: 'row',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  formButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  rangesList: {
    marginTop: 16,
  },
  rangeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  rangeInfo: {
    flex: 1,
  },
  rangeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rangeTemp: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  rangeDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  rangeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeChip: {
    backgroundColor: '#E8F5E8',
    marginRight: 8,
  },
  actionButton: {
    marginVertical: 4,
  },
});

export default TemperatureConfigScreen;