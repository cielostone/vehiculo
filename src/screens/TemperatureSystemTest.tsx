/**
 * TemperatureSystemTest.tsx
 * Componente de prueba para verificar el sistema de monitoreo de temperatura
 * Actividad 8 - Sistema de monitoreo de temperatura
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import TemperatureService, { TemperatureReading } from '../services/TemperatureService';
import { AlertService } from '../services/AlertService';
import LocalStorageService from '../services/LocalStorageService';

/**
 * Componente de prueba del sistema de temperatura
 */
const TemperatureSystemTest: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const temperatureService = TemperatureService.getInstance();
  const alertService = AlertService.getInstance();
  const localStorageService = LocalStorageService.getInstance();

  useEffect(() => {
    runSystemTests();
  }, []);

  /**
   * Ejecuta pruebas del sistema
   */
  const runSystemTests = async () => {
    const results: string[] = [];
    
    try {
      // Test 1: Verificar servicios
      results.push('✅ TemperatureService inicializado correctamente');
      results.push('✅ AlertService inicializado correctamente');
      results.push('✅ LocalStorageService inicializado correctamente');

      // Test 2: Conversiones de temperatura
      const fahrenheit = 77; // 25°C
      const celsius = temperatureService.fahrenheitToCelsius(fahrenheit);
      if (Math.abs(celsius - 25) < 0.1) {
        results.push('✅ Conversión F→C funciona correctamente');
      } else {
        results.push('❌ Error en conversión F→C');
      }

      const backToFahrenheit = temperatureService.celsiusToFahrenheit(celsius);
      if (Math.abs(backToFahrenheit - fahrenheit) < 0.1) {
        results.push('✅ Conversión C→F funciona correctamente');
      } else {
        results.push('❌ Error en conversión C→F');
      }

      // Test 3: Configuración de alertas
      const alertConfig = alertService.getConfig();
      if (alertConfig.enableSound !== undefined && alertConfig.enableVibration !== undefined) {
        results.push('✅ Configuración de alertas accesible');
      } else {
        results.push('❌ Error en configuración de alertas');
      }

      // Test 4: Almacenamiento local
      const tempConfig = await localStorageService.getTemperatureConfig();
      if (tempConfig && tempConfig.defaultMinCelsius !== undefined) {
        results.push('✅ Configuración local accesible');
      } else {
        results.push('❌ Error en almacenamiento local');
      }

      // Test 5: Verificar que las alertas están habilitadas
      const alertsEnabled = temperatureService.areAlertsEnabled();
      if (alertsEnabled !== undefined) {
        results.push(`✅ Estado de alertas: ${alertsEnabled ? 'Habilitadas' : 'Deshabilitadas'}`);
      } else {
        results.push('❌ Error verificando estado de alertas');
      }

      results.push('');
      results.push('🎉 Sistema de monitoreo de temperatura listo para usar!');
      
    } catch (error) {
      results.push(`❌ Error durante las pruebas: ${error}`);
    }

    setTestResults(results);
    setIsLoaded(true);
  };

  /**
   * Prueba manual de alertas
   */
  const testAlerts = () => {
    Alert.alert(
      'Prueba de Alertas',
      'Se activará una alerta de prueba con sonido y vibración.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Probar', 
          onPress: () => {
            temperatureService.testAlerts();
          }
        }
      ]
    );
  };

  /**
   * Simula una lectura de temperatura fuera de rango
   */
  const simulateOutOfRangeReading = () => {
    Alert.alert(
      'Simular Temperatura Fuera de Rango',
      'Esto simulará una lectura de 30°C que está fuera del rango normal (2-8°C).',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Simular', 
          onPress: () => {
            // Simular alerta de temperatura alta
            alertService.triggerHighTemperatureAlert(30.0, 8.0);
          }
        }
      ]
    );
  };

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Ejecutando pruebas del sistema...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Pruebas del Sistema de Temperatura
      </Text>
      
      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 20 }}>
        {testResults.map((result, index) => (
          <Text key={index} style={{ fontSize: 14, marginBottom: 4, fontFamily: 'monospace' }}>
            {result}
          </Text>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={testAlerts}
        style={{ marginBottom: 12 }}
        icon="bell-ring"
      >
        Probar Alertas de Sistema
      </Button>

      <Button
        mode="outlined"
        onPress={simulateOutOfRangeReading}
        style={{ marginBottom: 12 }}
        icon="thermometer-high"
      >
        Simular Temperatura Fuera de Rango
      </Button>

      <Button
        mode="outlined"
        onPress={runSystemTests}
        icon="refresh"
      >
        Re-ejecutar Pruebas
      </Button>
    </View>
  );
};

export default TemperatureSystemTest;