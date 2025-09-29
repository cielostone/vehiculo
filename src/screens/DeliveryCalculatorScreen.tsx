import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DeliveryService } from '../services/DeliveryService';
import ColdChainService from '../services/ColdChainService';

const DeliveryCalculatorScreen = () => {
  const [customerName, setCustomerName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [distance, setDistance] = useState('');
  const [freezerTemp, setFreezerTemp] = useState('');
  const [decimalValue, setDecimalValue] = useState('');
  const [result, setResult] = useState<any>(null);
  const [radianResult, setRadianResult] = useState<number | null>(null);
  const [hasColdChainProducts, setHasColdChainProducts] = useState(false);
  const [isMonitoringTemp, setIsMonitoringTemp] = useState(false);

  const coldChainService = ColdChainService.getInstance();

  useEffect(() => {
    return () => {
      // Detener monitoreo al salir de la pantalla
      if (isMonitoringTemp) {
        coldChainService.stopTemperatureMonitoring();
      }
    };
  }, [isMonitoringTemp]);

  const handleCalculateDelivery = () => {
    const amount = parseFloat(totalAmount);
    const dist = parseFloat(distance);

    if (isNaN(amount) || isNaN(dist)) {
      Alert.alert('Error', 'Por favor ingresa valores numéricos válidos');
      return;
    }

    if (amount <= 0 || dist <= 0) {
      Alert.alert('Error', 'Los valores deben ser mayores a 0');
      return;
    }

    const deliveryInfo = DeliveryService.getDeliveryInfo(amount, dist);
    
    // Verificar temperatura si fue ingresada y hay productos de cadena de frío
    let tempAlert = '';
    if (freezerTemp && hasColdChainProducts) {
      const temp = parseFloat(freezerTemp);
      if (!isNaN(temp)) {
        const isSafe = DeliveryService.checkFreezerTemperature(temp);
        if (!isSafe) {
          tempAlert = '🚨 CADENA DE FRÍO COMPROMETIDA 🚨';
          
          // Registrar lectura en el sistema de cadena de frío
          coldChainService.addTemperatureReading({
            temperature: temp,
            location: { latitude: -33.40863, longitude: -71.696854 },
            vehicleId: 'TRUCK-001',
            driverId: 'DRV-001',
          });
        }
      }
    }

    setResult({ ...deliveryInfo, tempAlert });
  };

  const handleConvertToRadians = () => {
    const decimal = parseFloat(decimalValue);
    
    if (isNaN(decimal)) {
      Alert.alert('Error', 'Por favor ingresa un valor numérico válido');
      return;
    }

    const radians = DeliveryService.convertDecimalToRadians(decimal);
    setRadianResult(radians);
  };

  const handleCreateOrder = () => {
    if (!result || !result.isDeliverable) {
      Alert.alert('Error', 'Primero calcula una entrega válida');
      return;
    }

    const orderData = {
      customerName: customerName || 'Cliente sin nombre',
      totalAmount: parseFloat(totalAmount),
      distance: parseFloat(distance),
      products: ['Alimentos varios'],
      freezerTemperature: freezerTemp ? parseFloat(freezerTemp) : undefined,
    };

    const order = DeliveryService.createDeliveryOrder(orderData);
    
    if (order) {
      Alert.alert(
        'Orden Creada',
        `Orden ${order.id} creada exitosamente\nTarifa: $${order.deliveryFee.toLocaleString()}`
      );
    } else {
      Alert.alert('Error', 'No se pudo crear la orden');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="local-shipping" size={32} color="#2196F3" />
          <Text style={styles.title}>Calculadora de Entregas</Text>
          <Text style={styles.subtitle}>Empresa de Distribución de Alimentos</Text>
        </View>

        {/* Sección 1: Datos de la entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Datos de la Entrega</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Cliente</Text>
            <TextInput
              style={styles.input}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Ingresa el nombre del cliente"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monto Total de Compra ($)</Text>
            <TextInput
              style={styles.input}
              value={totalAmount}
              onChangeText={setTotalAmount}
              placeholder="Ej: 35000"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Distancia (km)</Text>
            <TextInput
              style={styles.input}
              value={distance}
              onChangeText={setDistance}
              placeholder="Ej: 15"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Temperatura Congelador (°C) - Opcional</Text>
            <TextInput
              style={styles.input}
              value={freezerTemp}
              onChangeText={setFreezerTemp}
              placeholder="Ej: -8"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculateDelivery}>
            <Icon name="calculate" size={20} color="#fff" />
            <Text style={styles.buttonText}>Calcular Tarifa</Text>
          </TouchableOpacity>
        </View>

        {/* Sección Cadena de Frío */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❄️ Control de Cadena de Frío</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>¿Transporte productos congelados?</Text>
              <Switch
                value={hasColdChainProducts}
                onValueChange={setHasColdChainProducts}
                trackColor={{ false: '#ccc', true: '#2196F3' }}
                thumbColor={hasColdChainProducts ? '#fff' : '#f4f3f4'}
              />
            </View>
            <Text style={styles.helpText}>
              Carnes y mariscos congelados requieren control de temperatura
            </Text>
          </View>

          {hasColdChainProducts && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Temperatura del Congelador (°C)</Text>
                <TextInput
                  style={styles.input}
                  value={freezerTemp}
                  onChangeText={setFreezerTemp}
                  placeholder="Ej: -18"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
                <Text style={styles.helpText}>
                  Rango seguro: -25°C a -18°C | Alarma: {'>'} -15°C
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.switchContainer}>
                  <Text style={styles.label}>Monitoreo automático</Text>
                  <Switch
                    value={isMonitoringTemp}
                    onValueChange={(value) => {
                      setIsMonitoringTemp(value);
                      if (value) {
                        coldChainService.startTemperatureMonitoring('TRUCK-001', 'DRV-001');
                        Alert.alert(
                          '🌡️ Monitoreo iniciado',
                          'Se está monitoreando la temperatura cada 30 segundos.\n\nSe emitirá una alarma si supera -15°C'
                        );
                      } else {
                        coldChainService.stopTemperatureMonitoring();
                      }
                    }}
                    trackColor={{ false: '#ccc', true: '#4caf50' }}
                    thumbColor={isMonitoringTemp ? '#fff' : '#f4f3f4'}
                  />
                </View>
                <Text style={styles.helpText}>
                  Activa el monitoreo automático de temperatura en tiempo real
                </Text>
              </View>

              <View style={styles.coldChainProducts}>
                <Text style={styles.productsTitle}>Productos que requieren cadena de frío:</Text>
                {coldChainService.getColdChainProducts().map((product) => (
                  <View key={product.id} style={styles.productItem}>
                    <Icon 
                      name={product.type === 'carne' ? 'restaurant' : 'set-meal'} 
                      size={16} 
                      color="#f44336" 
                    />
                    <Text style={styles.productText}>{product.name}</Text>
                    <Text style={styles.productTemp}>Max: {product.maxTemperature}°C</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Sección 2: Conversión a Radianes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔢 Conversión DECIMAL → RADIANES</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Valor Decimal (grados)</Text>
            <TextInput
              style={styles.input}
              value={decimalValue}
              onChangeText={setDecimalValue}
              placeholder="Ej: 90"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity style={styles.convertButton} onPress={handleConvertToRadians}>
            <Icon name="swap-horiz" size={20} color="#fff" />
            <Text style={styles.buttonText}>Convertir a Radianes</Text>
          </TouchableOpacity>

          {radianResult !== null && (
            <View style={styles.radianResult}>
              <Text style={styles.resultText}>
                {decimalValue}° = {radianResult.toFixed(6)} radianes
              </Text>
            </View>
          )}
        </View>

        {/* Resultados */}
        {result && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Resultado del Cálculo</Text>
            
            {result.tempAlert && (
              <View style={styles.alertBox}>
                <Text style={styles.alertText}>{result.tempAlert}</Text>
              </View>
            )}

            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Categoría:</Text>
                <Text style={styles.resultValue}>{result.tier}</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tarifa por km:</Text>
                <Text style={styles.resultValue}>${result.rate}</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Distancia:</Text>
                <Text style={styles.resultValue}>{result.distance} km</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>¿Entregable?:</Text>
                <Text style={[styles.resultValue, result.isDeliverable ? styles.successText : styles.errorText]}>
                  {result.isDeliverable ? '✅ SÍ' : '❌ NO - Fuera del radio'}
                </Text>
              </View>

              {result.isDeliverable && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL A COBRAR:</Text>
                  <Text style={styles.totalValue}>${result.fee?.toLocaleString()}</Text>
                </View>
              )}
            </View>

            {result.isDeliverable && (
              <TouchableOpacity style={styles.createOrderButton} onPress={handleCreateOrder}>
                <Icon name="add-shopping-cart" size={20} color="#fff" />
                <Text style={styles.buttonText}>Crear Orden</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Información de reglas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Reglas de Negocio</Text>
          <View style={styles.rulesCard}>
            <Text style={styles.ruleText}>• Radio máximo de entrega: 20 km</Text>
            <Text style={styles.ruleText}>• Compras ≥ $50,000: $150/km</Text>
            <Text style={styles.ruleText}>• Compras $25,000-$49,999: $150/km</Text>
            <Text style={styles.ruleText}>• Compras {"<"} $25,000: $300/km</Text>
            <Text style={styles.ruleText}>• Temperatura máxima congelador: -5°C</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  convertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  createOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
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
  radianResult: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  resultText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    textAlign: 'center',
  },
  alertBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  alertText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  totalLabel: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#f44336',
  },
  rulesCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  ruleText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    lineHeight: 20,
  },
  // Nuevos estilos para cadena de frío
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  coldChainProducts: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 8,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 4,
  },
  productText: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    marginLeft: 8,
  },
  productTemp: {
    fontSize: 11,
    color: '#f44336',
    fontWeight: '600',
  },
});

export default DeliveryCalculatorScreen;