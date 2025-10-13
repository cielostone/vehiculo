/**
 * LocalStorageService.ts
 * Servicio para almacenamiento local usando AsyncStorage
 * Actividad 8 - Sistema de monitoreo de temperatura
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Configuración de temperatura personalizada
 */
export interface TemperatureConfig {
  defaultMinCelsius: number;
  defaultMaxCelsius: number;
  alertsEnabled: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  alertInterval: number; // minutos
  sensorLocations: string[];
}

/**
 * Rango de temperatura personalizado para almacenamiento local
 */
export interface LocalTemperatureRange {
  id: string;
  name: string;
  minCelsius: number;
  maxCelsius: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Configuración de alertas personalizada
 */
export interface AlertConfiguration {
  enableSound: boolean;
  enableVibration: boolean;
  vibrationPattern: number[];
  alertInterval: number;
  highTempThreshold: number;
  lowTempThreshold: number;
  criticalTempOffset: number; // grados fuera del rango para considerar crítico
}

/**
 * Datos de la aplicación para respaldo local
 */
export interface AppData {
  temperatureConfig: TemperatureConfig;
  customRanges: LocalTemperatureRange[];
  alertConfig: AlertConfiguration;
  lastSync: string;
  version: string;
}

/**
 * Servicio para manejo de almacenamiento local
 */
export class LocalStorageService {
  private static instance: LocalStorageService;
  
  // Claves para AsyncStorage
  private readonly KEYS = {
    TEMPERATURE_CONFIG: '@taller_app:temperature_config',
    CUSTOM_RANGES: '@taller_app:custom_ranges',
    ALERT_CONFIG: '@taller_app:alert_config',
    APP_DATA: '@taller_app:app_data',
    LAST_SYNC: '@taller_app:last_sync',
    USER_PREFERENCES: '@taller_app:user_preferences'
  };

  private constructor() {}

  /**
   * Singleton instance
   */
  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  /**
   * Guarda configuración de temperatura
   */
  public async saveTemperatureConfig(config: TemperatureConfig): Promise<void> {
    try {
      const configData = JSON.stringify(config);
      await AsyncStorage.setItem(this.KEYS.TEMPERATURE_CONFIG, configData);
      console.log('Configuración de temperatura guardada localmente');
    } catch (error) {
      console.error('Error guardando configuración de temperatura:', error);
      throw error;
    }
  }

  /**
   * Obtiene configuración de temperatura
   */
  public async getTemperatureConfig(): Promise<TemperatureConfig | null> {
    try {
      const configData = await AsyncStorage.getItem(this.KEYS.TEMPERATURE_CONFIG);
      if (configData) {
        return JSON.parse(configData);
      }
      return this.getDefaultTemperatureConfig();
    } catch (error) {
      console.error('Error obteniendo configuración de temperatura:', error);
      return this.getDefaultTemperatureConfig();
    }
  }

  /**
   * Configuración por defecto de temperatura
   */
  private getDefaultTemperatureConfig(): TemperatureConfig {
    return {
      defaultMinCelsius: 2.0,
      defaultMaxCelsius: 8.0,
      alertsEnabled: true,
      vibrationEnabled: true,
      soundEnabled: true,
      alertInterval: 5,
      sensorLocations: ['Almacén Principal', 'Cámara Fría', 'Transporte']
    };
  }

  /**
   * Guarda rangos personalizados de temperatura
   */
  public async saveCustomRanges(ranges: LocalTemperatureRange[]): Promise<void> {
    try {
      const rangesData = JSON.stringify(ranges);
      await AsyncStorage.setItem(this.KEYS.CUSTOM_RANGES, rangesData);
      console.log('Rangos personalizados guardados localmente');
    } catch (error) {
      console.error('Error guardando rangos personalizados:', error);
      throw error;
    }
  }

  /**
   * Obtiene rangos personalizados de temperatura
   */
  public async getCustomRanges(): Promise<LocalTemperatureRange[]> {
    try {
      const rangesData = await AsyncStorage.getItem(this.KEYS.CUSTOM_RANGES);
      if (rangesData) {
        return JSON.parse(rangesData);
      }
      return this.getDefaultCustomRanges();
    } catch (error) {
      console.error('Error obteniendo rangos personalizados:', error);
      return this.getDefaultCustomRanges();
    }
  }

  /**
   * Rangos por defecto
   */
  private getDefaultCustomRanges(): LocalTemperatureRange[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'range_default_cold',
        name: 'Productos Refrigerados',
        minCelsius: 2.0,
        maxCelsius: 8.0,
        description: 'Rango estándar para productos refrigerados',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'range_frozen',
        name: 'Productos Congelados',
        minCelsius: -18.0,
        maxCelsius: -15.0,
        description: 'Rango para productos congelados',
        isActive: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'range_ambient',
        name: 'Temperatura Ambiente',
        minCelsius: 18.0,
        maxCelsius: 25.0,
        description: 'Rango para productos a temperatura ambiente',
        isActive: false,
        createdAt: now,
        updatedAt: now
      }
    ];
  }

  /**
   * Agrega un nuevo rango personalizado
   */
  public async addCustomRange(range: Omit<LocalTemperatureRange, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalTemperatureRange> {
    try {
      const existingRanges = await this.getCustomRanges();
      const newRange: LocalTemperatureRange = {
        ...range,
        id: `range_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedRanges = [...existingRanges, newRange];
      await this.saveCustomRanges(updatedRanges);
      
      return newRange;
    } catch (error) {
      console.error('Error agregando rango personalizado:', error);
      throw error;
    }
  }

  /**
   * Actualiza un rango personalizado
   */
  public async updateCustomRange(rangeId: string, updates: Partial<LocalTemperatureRange>): Promise<void> {
    try {
      const existingRanges = await this.getCustomRanges();
      const rangeIndex = existingRanges.findIndex(r => r.id === rangeId);
      
      if (rangeIndex === -1) {
        throw new Error(`Rango con ID ${rangeId} no encontrado`);
      }
      
      existingRanges[rangeIndex] = {
        ...existingRanges[rangeIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await this.saveCustomRanges(existingRanges);
    } catch (error) {
      console.error('Error actualizando rango personalizado:', error);
      throw error;
    }
  }

  /**
   * Elimina un rango personalizado
   */
  public async deleteCustomRange(rangeId: string): Promise<void> {
    try {
      const existingRanges = await this.getCustomRanges();
      const updatedRanges = existingRanges.filter(r => r.id !== rangeId);
      await this.saveCustomRanges(updatedRanges);
    } catch (error) {
      console.error('Error eliminando rango personalizado:', error);
      throw error;
    }
  }

  /**
   * Guarda configuración de alertas
   */
  public async saveAlertConfig(config: AlertConfiguration): Promise<void> {
    try {
      const configData = JSON.stringify(config);
      await AsyncStorage.setItem(this.KEYS.ALERT_CONFIG, configData);
      console.log('Configuración de alertas guardada localmente');
    } catch (error) {
      console.error('Error guardando configuración de alertas:', error);
      throw error;
    }
  }

  /**
   * Obtiene configuración de alertas
   */
  public async getAlertConfig(): Promise<AlertConfiguration> {
    try {
      const configData = await AsyncStorage.getItem(this.KEYS.ALERT_CONFIG);
      if (configData) {
        return JSON.parse(configData);
      }
      return this.getDefaultAlertConfig();
    } catch (error) {
      console.error('Error obteniendo configuración de alertas:', error);
      return this.getDefaultAlertConfig();
    }
  }

  /**
   * Configuración por defecto de alertas
   */
  private getDefaultAlertConfig(): AlertConfiguration {
    return {
      enableSound: true,
      enableVibration: true,
      vibrationPattern: [0, 1000, 500, 1000],
      alertInterval: 5,
      highTempThreshold: 8.0,
      lowTempThreshold: 2.0,
      criticalTempOffset: 5.0
    };
  }

  /**
   * Guarda todos los datos de la aplicación como respaldo
   */
  public async saveAppData(data: AppData): Promise<void> {
    try {
      const appData = JSON.stringify(data);
      await AsyncStorage.setItem(this.KEYS.APP_DATA, appData);
      console.log('Datos de aplicación guardados como respaldo');
    } catch (error) {
      console.error('Error guardando datos de aplicación:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los datos de la aplicación
   */
  public async getAppData(): Promise<AppData | null> {
    try {
      const appData = await AsyncStorage.getItem(this.KEYS.APP_DATA);
      if (appData) {
        return JSON.parse(appData);
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo datos de aplicación:', error);
      return null;
    }
  }

  /**
   * Guarda timestamp de última sincronización
   */
  public async saveLastSync(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem(this.KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('Error guardando última sincronización:', error);
      throw error;
    }
  }

  /**
   * Obtiene timestamp de última sincronización
   */
  public async getLastSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error obteniendo última sincronización:', error);
      return null;
    }
  }

  /**
   * Limpia todos los datos locales
   */
  public async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(this.KEYS);
      await AsyncStorage.multiRemove(keys);
      console.log('Todos los datos locales han sido eliminados');
    } catch (error) {
      console.error('Error limpiando datos locales:', error);
      throw error;
    }
  }

  /**
   * Exporta todos los datos para respaldo
   */
  public async exportData(): Promise<string> {
    try {
      const temperatureConfig = await this.getTemperatureConfig();
      const customRanges = await this.getCustomRanges();
      const alertConfig = await this.getAlertConfig();
      const lastSync = await this.getLastSync();

      const exportData: AppData = {
        temperatureConfig: temperatureConfig!,
        customRanges,
        alertConfig,
        lastSync: lastSync || new Date().toISOString(),
        version: '1.0.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exportando datos:', error);
      throw error;
    }
  }

  /**
   * Importa datos desde respaldo
   */
  public async importData(dataString: string): Promise<void> {
    try {
      const data: AppData = JSON.parse(dataString);
      
      await this.saveTemperatureConfig(data.temperatureConfig);
      await this.saveCustomRanges(data.customRanges);
      await this.saveAlertConfig(data.alertConfig);
      await this.saveLastSync();

      console.log('Datos importados exitosamente');
    } catch (error) {
      console.error('Error importando datos:', error);
      throw error;
    }
  }

  /**
   * Obtiene información de almacenamiento usado
   */
  public async getStorageInfo(): Promise<{ totalKeys: number; estimatedSize: string }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => key.startsWith('@taller_app:'));
      
      // Estimar tamaño calculando los datos
      let totalSize = 0;
      for (const key of appKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }

      const estimatedSizeKB = (totalSize / 1024).toFixed(2);

      return {
        totalKeys: appKeys.length,
        estimatedSize: `${estimatedSizeKB} KB`
      };
    } catch (error) {
      console.error('Error obteniendo información de almacenamiento:', error);
      return { totalKeys: 0, estimatedSize: '0 KB' };
    }
  }

  /**
   * Verifica si hay datos guardados
   */
  public async hasStoredData(): Promise<boolean> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.some(key => key.startsWith('@taller_app:'));
    } catch (error) {
      console.error('Error verificando datos guardados:', error);
      return false;
    }
  }
}

export default LocalStorageService;