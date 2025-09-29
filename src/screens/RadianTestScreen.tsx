import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GeolocationService } from '../services/GeolocationService';

const RadianTestScreen = () => {
  const [inputDegrees, setInputDegrees] = useState('45.0');
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [conversionHistory, setConversionHistory] = useState<Array<{degrees: number, radians: number, timestamp: string}>>([]);

  const handleSingleConversion = () => {
    const degrees = parseFloat(inputDegrees);
    
    if (isNaN(degrees)) {
      Alert.alert('Error', 'Por favor ingresa un número válido');
      return;
    }

    console.log('\n🎯 EJECUTANDO CONVERSIÓN DESDE INTERFAZ');
    console.log('==========================================');
    
    // Llamar al método con logging completo
    const result = GeolocationService.convertDegreesToRadiansWithLog(degrees);
    
    setLastResult(result);
    
    // Agregar al historial
    const newEntry = {
      degrees: degrees,
      radians: result,
      timestamp: new Date().toLocaleString('es-ES')
    };
    
    setConversionHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Mantener últimos 10
    
    Alert.alert(
      '✅ Conversión Completada',
      `${degrees}° = ${result.toFixed(6)} radianes\n\n📱 Revisa la consola para logs detallados`,
      [{ text: 'OK' }]
    );
  };

  const handleTestAllCases = () => {
    console.log('\n🚀 EJECUTANDO TODAS LAS PRUEBAS DESDE INTERFAZ');
    console.log('='.repeat(60));
    
    // Ejecutar todas las pruebas predefinidas
    GeolocationService.testRadianConversions();
    
    Alert.alert(
      '🧪 Pruebas Completadas',
      'Se han ejecutado 9 casos de prueba.\n\n📱 Revisa Logcat para ver todos los resultados detallados.',
      [{ text: 'Ver Logcat', onPress: showLogcatInstructions }]
    );
  };

  const showLogcatInstructions = () => {
    Alert.alert(
      '📋 Cómo ver Logcat',
      'Para ver los logs detallados:\n\n' +
      '1. Abre una terminal\n' +
      '2. Ejecuta: adb logcat | grep -E "(INFO|WARN|ERROR)"\n' +
      '3. O usa: npx react-native log-android\n\n' +
      'También puedes ver los logs en la consola de Metro bundler.',
      [{ text: 'Entendido' }]
    );
  };

  const testSpecificValues = () => {
    const elQuiscoValues = [-33.40863, -71.696854];
    
    console.log('\n🌍 PROBANDO COORDENADAS DE EL QUISCO');
    console.log('=====================================');
    
    elQuiscoValues.forEach(coord => {
      GeolocationService.convertDegreesToRadiansWithLog(coord);
    });
    
    Alert.alert('🗺️ Coordenadas Procesadas', 'Se han convertido las coordenadas de El Quisco a radianes');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="calculate" size={32} color="#2196F3" />
        <Text style={styles.title}>Convertidor Grados → Radianes</Text>
        <Text style={styles.subtitle}>Sistema.out con Logcat verification</Text>
      </View>

      {/* Input Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📐 Conversión Individual</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Grados decimales:</Text>
          <TextInput
            style={styles.input}
            value={inputDegrees}
            onChangeText={setInputDegrees}
            placeholder="Ej: 45.0, -33.40863"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity 
          style={styles.convertButton} 
          onPress={handleSingleConversion}
        >
          <Icon name="sync" size={20} color="#fff" />
          <Text style={styles.buttonText}>Convertir a Radianes</Text>
        </TouchableOpacity>

        {lastResult !== null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Último Resultado:</Text>
            <Text style={styles.resultValue}>
              {parseFloat(inputDegrees)}° = {lastResult.toFixed(6)} rad
            </Text>
            <Text style={styles.resultNote}>
              📱 Logs completos disponibles en consola
            </Text>
          </View>
        )}
      </View>

      {/* Test Cases Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Casos de Prueba</Text>
        
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={handleTestAllCases}
        >
          <Icon name="science" size={20} color="#fff" />
          <Text style={styles.buttonText}>Ejecutar 9 Casos de Prueba</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.specialButton} 
          onPress={testSpecificValues}
        >
          <Icon name="location-on" size={20} color="#fff" />
          <Text style={styles.buttonText}>Probar Coordenadas El Quisco</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logButton} 
          onPress={showLogcatInstructions}
        >
          <Icon name="visibility" size={20} color="#fff" />
          <Text style={styles.buttonText}>Cómo Ver Logcat</Text>
        </TouchableOpacity>
      </View>

      {/* History Section */}
      {conversionHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Historial de Conversiones</Text>
          
          {conversionHistory.map((entry, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyDegrees}>
                {entry.degrees}° → {entry.radians.toFixed(6)} rad
              </Text>
              <Text style={styles.historyTime}>{entry.timestamp}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Formula Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Información de la Fórmula</Text>
        <View style={styles.formulaCard}>
          <Text style={styles.formulaTitle}>Fórmula Matemática:</Text>
          <Text style={styles.formulaText}>radianes = grados × (π / 180)</Text>
          <Text style={styles.formulaNote}>
            π ≈ {Math.PI.toFixed(6)}
          </Text>
          
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleTitle}>Ejemplos comunes:</Text>
            <Text style={styles.exampleText}>• 90° = π/2 ≈ 1.570796 rad</Text>
            <Text style={styles.exampleText}>• 180° = π ≈ 3.141593 rad</Text>
            <Text style={styles.exampleText}>• 360° = 2π ≈ 6.283185 rad</Text>
          </View>
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
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 4,
  },
  section: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  convertButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  testButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  specialButton: {
    backgroundColor: '#9C27B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  logButton: {
    backgroundColor: '#607D8B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  resultValue: {
    fontSize: 16,
    color: '#388E3C',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  resultNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  historyItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyDegrees: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  formulaCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  formulaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  formulaText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#F57C00',
    marginBottom: 8,
  },
  formulaNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  exampleContainer: {
    marginTop: 8,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 12,
    color: '#F57C00',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

export default RadianTestScreen;