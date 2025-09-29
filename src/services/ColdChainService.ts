import { Alert } from 'react-native';

export interface TemperatureReading {
  temperature: number;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
  };
  vehicleId: string;
  driverId: string;
}

export interface ColdChainProduct {
  id: string;
  name: string;
  type: 'carne' | 'marisco' | 'lacteo' | 'medicamento';
  maxTemperature: number; // Temperatura máxima permitida en °C
  minTemperature: number; // Temperatura mínima permitida en °C
  alertThreshold: number; // Umbral para emitir alarma
}

class ColdChainService {
  private static instance: ColdChainService;
  private temperatureReadings: TemperatureReading[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval: ReturnType<typeof setInterval> | null = null;

  // Productos que requieren cadena de frío
  private coldChainProducts: ColdChainProduct[] = [
    {
      id: 'carne-res',
      name: 'Carne de Res Congelada',
      type: 'carne',
      maxTemperature: -18, // -18°C para carnes congeladas
      minTemperature: -25,
      alertThreshold: -15, // Alarma si supera -15°C
    },
    {
      id: 'carne-pollo',
      name: 'Pollo Congelado',
      type: 'carne',
      maxTemperature: -18,
      minTemperature: -25,
      alertThreshold: -15,
    },
    {
      id: 'mariscos-pescado',
      name: 'Pescado y Mariscos Congelados',
      type: 'marisco',
      maxTemperature: -18,
      minTemperature: -25,
      alertThreshold: -15,
    },
    {
      id: 'mariscos-camaron',
      name: 'Camarón Congelado',
      type: 'marisco',
      maxTemperature: -18,
      minTemperature: -25,
      alertThreshold: -15,
    },
  ];

  static getInstance(): ColdChainService {
    if (!ColdChainService.instance) {
      ColdChainService.instance = new ColdChainService();
    }
    return ColdChainService.instance;
  }

  /**
   * Simular lectura de temperatura del congelador del camión
   * En un caso real, esto vendría de un sensor IoT
   */
  private simulateTemperatureReading(): number {
    // Simular temperatura entre -25°C y -10°C
    const baseTemp = -20;
    const variation = Math.random() * 10 - 5; // ±5°C de variación
    return Math.round((baseTemp + variation) * 100) / 100;
  }

  /**
   * Agregar lectura de temperatura
   */
  addTemperatureReading(reading: Omit<TemperatureReading, 'timestamp'>): void {
    const newReading: TemperatureReading = {
      ...reading,
      timestamp: Date.now(),
    };

    this.temperatureReadings.push(newReading);

    // Mantener solo las últimas 100 lecturas
    if (this.temperatureReadings.length > 100) {
      this.temperatureReadings = this.temperatureReadings.slice(-100);
    }

    // Verificar si hay violación de cadena de frío
    this.checkColdChainViolation(newReading);
  }

  /**
   * Verificar si hay violación de cadena de frío
   */
  private checkColdChainViolation(reading: TemperatureReading): void {
    this.coldChainProducts.forEach(product => {
      // Verificar si la temperatura supera el umbral de alarma
      if (reading.temperature > product.alertThreshold) {
        this.triggerColdChainAlert(product, reading);
      }

      // Verificar si está fuera del rango permitido
      if (reading.temperature > product.maxTemperature || 
          reading.temperature < product.minTemperature) {
        this.triggerTemperatureWarning(product, reading);
      }
    });
  }

  /**
   * Emitir alarma por ruptura de cadena de frío
   */
  private triggerColdChainAlert(product: ColdChainProduct, reading: TemperatureReading): void {
    const message = `🚨 ALARMA DE CADENA DE FRÍO 🚨\n\n` +
                   `Producto: ${product.name}\n` +
                   `Temperatura actual: ${reading.temperature}°C\n` +
                   `Límite máximo: ${product.maxTemperature}°C\n` +
                   `Umbral de alarma: ${product.alertThreshold}°C\n\n` +
                   `⚠️ ACCIÓN INMEDIATA REQUERIDA ⚠️\n` +
                   `La temperatura ha superado el umbral seguro.\n` +
                   `Revise el sistema de refrigeración del vehículo.`;

    Alert.alert(
      '🚨 CADENA DE FRÍO ROTA',
      message,
      [
        {
          text: 'Registrar Incidente',
          onPress: () => this.logColdChainIncident(product, reading),
        },
        {
          text: 'Contactar Supervisor',
          onPress: () => this.contactSupervisor(product, reading),
        },
      ],
      { cancelable: false }
    );

    console.error('🚨 COLD CHAIN ALERT:', {
      product: product.name,
      temperature: reading.temperature,
      threshold: product.alertThreshold,
      location: reading.location,
      timestamp: new Date(reading.timestamp).toISOString(),
    });
  }

  /**
   * Emitir advertencia por temperatura fuera de rango
   */
  private triggerTemperatureWarning(product: ColdChainProduct, reading: TemperatureReading): void {
    console.warn('⚠️ TEMPERATURE WARNING:', {
      product: product.name,
      temperature: reading.temperature,
      range: `${product.minTemperature}°C to ${product.maxTemperature}°C`,
      location: reading.location,
    });
  }

  /**
   * Registrar incidente de cadena de frío
   */
  private logColdChainIncident(product: ColdChainProduct, reading: TemperatureReading): void {
    const incident = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      temperature: reading.temperature,
      threshold: product.alertThreshold,
      location: reading.location,
      timestamp: reading.timestamp,
      vehicleId: reading.vehicleId,
      driverId: reading.driverId,
      severity: 'HIGH',
      status: 'REPORTED',
    };

    // En un caso real, esto se enviaría a la base de datos
    console.log('📝 Incidente registrado:', incident);
    
    Alert.alert(
      'Incidente Registrado',
      `Se ha registrado el incidente de cadena de frío.\nID: ${incident.id}`
    );
  }

  /**
   * Contactar supervisor
   */
  private contactSupervisor(product: ColdChainProduct, reading: TemperatureReading): void {
    console.log('📞 Contactando supervisor para:', {
      product: product.name,
      temperature: reading.temperature,
      location: reading.location,
    });

    Alert.alert(
      'Supervisor Notificado',
      'Se ha enviado una notificación de emergencia al supervisor.\n\n' +
      'Instrucciones:\n' +
      '1. Detenga el vehículo en lugar seguro\n' +
      '2. Verifique el sistema de refrigeración\n' +
      '3. Espere instrucciones del supervisor'
    );
  }

  /**
   * Iniciar monitoreo automático de temperatura
   */
  startTemperatureMonitoring(vehicleId: string, driverId: string): void {
    if (this.isMonitoring) {
      console.warn('Temperature monitoring is already active');
      return;
    }

    this.isMonitoring = true;
    console.log('🌡️ Iniciando monitoreo de temperatura...');

    this.monitoringInterval = setInterval(() => {
      // Simular lectura de sensor de temperatura
      const temperature = this.simulateTemperatureReading();
      
      // Obtener ubicación actual (esto vendría del GPS)
      const location = {
        latitude: -33.40863, // El Quisco, Chile
        longitude: -71.696854,
      };

      this.addTemperatureReading({
        temperature,
        location,
        vehicleId,
        driverId,
      });

      console.log(`🌡️ Temperatura actual: ${temperature}°C`);
    }, 30000); // Leer cada 30 segundos
  }

  /**
   * Detener monitoreo de temperatura
   */
  stopTemperatureMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🌡️ Monitoreo de temperatura detenido');
  }

  /**
   * Obtener lecturas de temperatura recientes
   */
  getRecentReadings(limit: number = 10): TemperatureReading[] {
    return this.temperatureReadings
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Obtener productos de cadena de frío
   */
  getColdChainProducts(): ColdChainProduct[] {
    return this.coldChainProducts;
  }

  /**
   * Verificar si el monitoreo está activo
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Obtener estadísticas de temperatura
   */
  getTemperatureStats(): {
    current?: number;
    average: number;
    min: number;
    max: number;
    violationsCount: number;
  } {
    if (this.temperatureReadings.length === 0) {
      return { average: 0, min: 0, max: 0, violationsCount: 0 };
    }

    const temperatures = this.temperatureReadings.map(r => r.temperature);
    const current = temperatures[temperatures.length - 1];
    const average = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    const min = Math.min(...temperatures);
    const max = Math.max(...temperatures);
    
    // Contar violaciones (temperatura > -15°C)
    const violationsCount = temperatures.filter(temp => temp > -15).length;

    return {
      current,
      average: Math.round(average * 100) / 100,
      min,
      max,
      violationsCount,
    };
  }
}

export default ColdChainService;