/**
 * TemperatureService.ts
 * Servicio para monitoreo de temperatura desde microcontroladores
 * Actividad 8 - Sistema de monitoreo de temperatura
 */

import FirebaseService from './FirebaseService';
import { AlertService, AlertType } from './AlertService';

export interface TemperatureReading {
  id: string;
  timestamp: Date;
  temperatureFahrenheit: number;
  temperatureCelsius: number;
  sensorId: string;
  location: string;
  isWithinRange: boolean;
}

export interface TemperatureRange {
  id: string;
  name: string;
  minCelsius: number;
  maxCelsius: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

export interface TemperatureAlert {
  id: string;
  temperatureReading: TemperatureReading;
  alertType: 'HIGH_TEMPERATURE' | 'LOW_TEMPERATURE';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface TemperatureStats {
  currentCelsius: number;
  currentFahrenheit: number;
  averageCelsius: number;
  minCelsius: number;
  maxCelsius: number;
  readingsToday: number;
  alertsToday: number;
}

class TemperatureService {
  private static instance: TemperatureService;
  private firebaseService: FirebaseService;
  private alertService: AlertService;
  private temperatureListeners: ((reading: TemperatureReading) => void)[] = [];
  private alertListeners: ((alert: TemperatureAlert) => void)[] = [];

  private constructor() {
    this.firebaseService = FirebaseService.getInstance();
    this.alertService = AlertService.getInstance();
    this.startTemperatureMonitoring();
  }

  public static getInstance(): TemperatureService {
    if (!TemperatureService.instance) {
      TemperatureService.instance = new TemperatureService();
    }
    return TemperatureService.instance;
  }

  /**
   * Convierte temperatura de Fahrenheit a Celsius
   */
  public fahrenheitToCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * 5 / 9;
  }

  /**
   * Convierte temperatura de Celsius a Fahrenheit
   */
  public celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9 / 5) + 32;
  }

  /**
   * Inicia el monitoreo de temperatura desde Firebase
   */
  private startTemperatureMonitoring(): void {
    try {
      // Simular lectura de temperatura desde microcontrolador
      this.simulateTemperatureReadings();
      
      // En producción, aquí se conectaría con Firebase Real Time Database
      // this.firebaseService.subscribeToCollection('temperature_readings', this.handleTemperatureUpdate.bind(this));
    } catch (error) {
      console.error('Error iniciando monitoreo de temperatura:', error);
    }
  }

  /**
   * Simula lecturas de temperatura como si vinieran de un microcontrolador
   */
  private simulateTemperatureReadings(): void {
    setInterval(() => {
      // Simular temperatura en Fahrenheit (rango típico de cadena de frío: 32-50°F)
      const baseFahrenheit = 32 + Math.random() * 18; // 32-50°F
      const noise = (Math.random() - 0.5) * 4; // Ruido de ±2°F
      const temperatureFahrenheit = baseFahrenheit + noise;
      
      const reading: TemperatureReading = {
        id: `temp_${Date.now()}`,
        timestamp: new Date(),
        temperatureFahrenheit,
        temperatureCelsius: this.fahrenheitToCelsius(temperatureFahrenheit),
        sensorId: 'ESP32_001',
        location: 'Cámara de Refrigeración Principal',
        isWithinRange: false // Se calculará después
      };

      this.processTemperatureReading(reading);
    }, 5000); // Lectura cada 5 segundos
  }

  /**
   * Procesa una nueva lectura de temperatura
   */
  private async processTemperatureReading(reading: TemperatureReading): Promise<void> {
    try {
      // Verificar si está dentro del rango
      const activeRange = await this.getActiveTemperatureRange();
      if (activeRange) {
        reading.isWithinRange = this.isTemperatureWithinRange(reading.temperatureCelsius, activeRange);
        
        // Generar alerta si está fuera del rango
        if (!reading.isWithinRange) {
          const alert = this.generateTemperatureAlert(reading, activeRange);
          this.notifyAlertListeners(alert);
        }
      }

      // Guardar lectura en Firebase
      await this.saveTemperatureReading(reading);
      
      // Notificar a los listeners
      this.notifyTemperatureListeners(reading);
      
    } catch (error) {
      console.error('Error procesando lectura de temperatura:', error);
    }
  }

  /**
   * Verifica si la temperatura está dentro del rango permitido
   */
  private isTemperatureWithinRange(temperatureCelsius: number, range: TemperatureRange): boolean {
    return temperatureCelsius >= range.minCelsius && temperatureCelsius <= range.maxCelsius;
  }

  /**
   * Genera una alerta de temperatura
   */
  private generateTemperatureAlert(reading: TemperatureReading, range: TemperatureRange): TemperatureAlert {
    const alertType = reading.temperatureCelsius > range.maxCelsius ? 'HIGH_TEMPERATURE' : 'LOW_TEMPERATURE';
    const message = alertType === 'HIGH_TEMPERATURE' 
      ? `Temperatura alta detectada: ${reading.temperatureCelsius.toFixed(1)}°C (máximo: ${range.maxCelsius}°C)`
      : `Temperatura baja detectada: ${reading.temperatureCelsius.toFixed(1)}°C (mínimo: ${range.minCelsius}°C)`;

    const alert: TemperatureAlert = {
      id: `alert_${Date.now()}`,
      temperatureReading: reading,
      alertType,
      message,
      timestamp: new Date(),
      acknowledged: false
    };

    // Activar alerta de sonido y vibración
    this.triggerAlertNotification(reading, range);

    return alert;
  }

  /**
   * Activa notificación de alerta usando AlertService
   */
  private triggerAlertNotification(reading: TemperatureReading, range: TemperatureRange): void {
    try {
      const temperature = reading.temperatureCelsius;
      
      if (temperature > range.maxCelsius) {
        // Determinar si es crítica (más de 5°C fuera del rango)
        const isCritical = temperature - range.maxCelsius > 5;
        
        if (isCritical) {
          this.alertService.triggerCriticalTemperatureAlert(temperature, range.maxCelsius);
        } else {
          this.alertService.triggerHighTemperatureAlert(temperature, range.maxCelsius);
        }
      } else if (temperature < range.minCelsius) {
        // Determinar si es crítica (más de 5°C fuera del rango)
        const isCritical = range.minCelsius - temperature > 5;
        
        if (isCritical) {
          this.alertService.triggerCriticalTemperatureAlert(temperature, range.minCelsius);
        } else {
          this.alertService.triggerLowTemperatureAlert(temperature, range.minCelsius);
        }
      }
    } catch (error) {
      console.error('Error activando notificación de alerta:', error);
    }
  }

  /**
   * Guarda lectura de temperatura en Firebase
   */
  private async saveTemperatureReading(reading: TemperatureReading): Promise<void> {
    try {
      await this.firebaseService.createData('temperature_readings', reading.id, {
        ...reading,
        timestamp: reading.timestamp.toISOString()
      });
    } catch (error) {
      console.error('Error guardando lectura de temperatura:', error);
    }
  }

  /**
   * Obtiene el rango de temperatura activo
   */
  public async getActiveTemperatureRange(): Promise<TemperatureRange | null> {
    try {
      const ranges = await this.getTemperatureRanges();
      return ranges.find(range => range.isActive) || null;
    } catch (error) {
      console.error('Error obteniendo rango activo:', error);
      return null;
    }
  }

  /**
   * Obtiene todos los rangos de temperatura
   */
  public async getTemperatureRanges(): Promise<TemperatureRange[]> {
    try {
      const rangesData = await this.firebaseService.readData('temperature_ranges');
      if (!rangesData) return [this.getDefaultTemperatureRange()];
      
      return Object.keys(rangesData).map(key => ({
        ...rangesData[key],
        id: key,
        createdAt: new Date(rangesData[key].createdAt)
      })) as TemperatureRange[];
    } catch (error) {
      console.error('Error obteniendo rangos de temperatura:', error);
      // Devolver rango por defecto para cadena de frío
      return [this.getDefaultTemperatureRange()];
    }
  }

  /**
   * Crea o actualiza un rango de temperatura
   */
  public async saveTemperatureRange(range: Omit<TemperatureRange, 'id' | 'createdAt'>): Promise<string> {
    try {
      const rangeData = {
        ...range,
        createdAt: new Date().toISOString()
      };
      
      const rangeId = `range_${Date.now()}`;
      await this.firebaseService.createData('temperature_ranges', rangeId, rangeData);
      return rangeId;
    } catch (error) {
      console.error('Error guardando rango de temperatura:', error);
      throw error;
    }
  }

  /**
   * Activa un rango de temperatura específico
   */
  public async setActiveTemperatureRange(rangeId: string): Promise<void> {
    try {
      // Desactivar todos los rangos
      const ranges = await this.getTemperatureRanges();
      for (const range of ranges) {
        await this.firebaseService.updateData(`temperature_ranges/${range.id}`, {
          ...range,
          isActive: false
        });
      }
      
      // Activar el rango seleccionado
      const selectedRange = ranges.find(r => r.id === rangeId);
      if (selectedRange) {
        await this.firebaseService.updateData(`temperature_ranges/${rangeId}`, {
          ...selectedRange,
          isActive: true
        });
      }
    } catch (error) {
      console.error('Error activando rango de temperatura:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de lecturas de temperatura
   */
  public async getTemperatureHistory(limit: number = 50): Promise<TemperatureReading[]> {
    try {
      const readingsData = await this.firebaseService.readData('temperature_readings');
      if (!readingsData) return [];
      
      return Object.keys(readingsData)
        .map((key: string) => ({
          ...readingsData[key],
          id: key,
          timestamp: new Date(readingsData[key].timestamp)
        }))
        .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit) as TemperatureReading[];
    } catch (error) {
      console.error('Error obteniendo historial de temperatura:', error);
      return [];
    }
  }

  /**
   * Obtiene la lectura más reciente de temperatura
   */
  public async getLatestTemperatureReading(): Promise<TemperatureReading | null> {
    try {
      const history = await this.getTemperatureHistory(1);
      return history.length > 0 ? history[0] : null;
    } catch (error) {
      console.error('Error obteniendo lectura más reciente:', error);
      return null;
    }
  }

  /**
   * Rango de temperatura por defecto para cadena de frío
   */
  private getDefaultTemperatureRange(): TemperatureRange {
    return {
      id: 'default_cold_chain',
      name: 'Cadena de Frío Estándar',
      minCelsius: 0,
      maxCelsius: 4,
      description: 'Rango estándar para preservación de alimentos perecederos',
      isActive: true,
      createdAt: new Date()
    };
  }

  /**
   * Suscribirse a actualizaciones de temperatura
   */
  public subscribeToTemperatureUpdates(callback: (reading: TemperatureReading) => void): () => void {
    this.temperatureListeners.push(callback);
    
    return () => {
      const index = this.temperatureListeners.indexOf(callback);
      if (index > -1) {
        this.temperatureListeners.splice(index, 1);
      }
    };
  }

  /**
   * Suscribirse a alertas de temperatura
   */
  public subscribeToTemperatureAlerts(callback: (alert: TemperatureAlert) => void): () => void {
    this.alertListeners.push(callback);
    
    return () => {
      const index = this.alertListeners.indexOf(callback);
      if (index > -1) {
        this.alertListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notificar a los listeners de nuevas lecturas
   */
  private notifyTemperatureListeners(reading: TemperatureReading): void {
    this.temperatureListeners.forEach(callback => {
      try {
        callback(reading);
      } catch (error) {
        console.error('Error en callback de temperatura:', error);
      }
    });
  }

  /**
   * Notificar a los listeners de nuevas alertas
   */
  private notifyAlertListeners(alert: TemperatureAlert): void {
    this.alertListeners.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error en callback de alerta:', error);
      }
    });
  }

  /**
   * Obtiene estadísticas de temperatura
   */
  public async getTemperatureStats(): Promise<{
    currentCelsius: number;
    currentFahrenheit: number;
    averageCelsius: number;
    minCelsius: number;
    maxCelsius: number;
    readingsToday: number;
    alertsToday: number;
  }> {
    try {
      const latest = await this.getLatestTemperatureReading();
      const history = await this.getTemperatureHistory(100);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayReadings = history.filter(reading => reading.timestamp >= today);
      const temperatures = history.map(r => r.temperatureCelsius);
      
      return {
        currentCelsius: latest?.temperatureCelsius || 0,
        currentFahrenheit: latest?.temperatureFahrenheit || 32,
        averageCelsius: temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 0,
        minCelsius: temperatures.length > 0 ? Math.min(...temperatures) : 0,
        maxCelsius: temperatures.length > 0 ? Math.max(...temperatures) : 0,
        readingsToday: todayReadings.length,
        alertsToday: todayReadings.filter(r => !r.isWithinRange).length
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        currentCelsius: 0,
        currentFahrenheit: 32,
        averageCelsius: 0,
        minCelsius: 0,
        maxCelsius: 0,
        readingsToday: 0,
        alertsToday: 0
      };
    }
  }

  /**
   * Configura las alertas de temperatura
   */
  public configureAlerts(config: any): void {
    this.alertService.setConfig(config);
  }

  /**
   * Obtiene la configuración actual de alertas
   */
  public getAlertConfig(): any {
    return this.alertService.getConfig();
  }

  /**
   * Prueba el sistema de alertas
   */
  public testAlerts(): void {
    this.alertService.testAlert('temperature_high');
  }

  /**
   * Habilita/deshabilita las alertas
   */
  public setAlertsEnabled(enabled: boolean): void {
    this.alertService.setAlertsEnabled(enabled);
  }

  /**
   * Verifica si las alertas están habilitadas
   */
  public areAlertsEnabled(): boolean {
    return this.alertService.areAlertsEnabled();
  }

  /**
   * Inicia el monitoreo público
   */
  public startMonitoring(): void {
    this.startTemperatureMonitoring();
  }

  /**
   * Detiene el monitoreo
   */
  public stopMonitoring(): void {
    // Implementar lógica para detener monitoreo
    console.log('Monitoreo de temperatura detenido');
  }
}

export default TemperatureService;