import { Alert, Vibration } from 'react-native';

/**
 * Tipos de alertas disponibles
 */
export type AlertType = 'temperature_high' | 'temperature_low' | 'temperature_critical';

/**
 * Configuración de alertas
 */
export interface AlertConfig {
  enableSound: boolean;
  enableVibration: boolean;
  vibrationPattern: number[];
  alertInterval: number; // minutos entre alertas del mismo tipo
}

/**
 * Información de alerta
 */
export interface AlertInfo {
  type: AlertType;
  temperature: number;
  threshold: number;
  message: string;
  timestamp: Date;
}

/**
 * Servicio para manejar alertas de temperatura con sonido y vibración
 */
export class AlertService {
  private static instance: AlertService;
  private config: AlertConfig;
  private lastAlerts: { [key: string]: Date } = {};

  constructor() {
    this.config = {
      enableSound: true,
      enableVibration: true, // Habilitado para mostrar simulación
      vibrationPattern: [0, 1000, 500, 1000], // patrón de vibración por defecto
      alertInterval: 5 // 5 minutos entre alertas del mismo tipo
    };
  }

  /**
   * Singleton instance
   */
  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  /**
   * Configura las opciones de alertas
   */
  public setConfig(config: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Obtiene la configuración actual de alertas
   */
  public getConfig(): AlertConfig {
    return { ...this.config };
  }

  /**
   * Activa una alerta de temperatura
   */
  public async triggerTemperatureAlert(alertInfo: AlertInfo): Promise<void> {
    try {
      // Verificar si ya se activó una alerta del mismo tipo recientemente
      if (this.shouldSkipAlert(alertInfo.type)) {
        return;
      }

      // Registrar la alerta
      this.lastAlerts[alertInfo.type] = new Date();

      // Mostrar alerta visual
      this.showVisualAlert(alertInfo);

      // Activar vibración si está habilitada
      if (this.config.enableVibration) {
        this.triggerVibration();
      }

      // Registrar en console para debugging
      console.log('Alerta de temperatura activada:', alertInfo);
    } catch (error) {
      console.error('Error activando alerta de temperatura:', error);
    }
  }

  /**
   * Verifica si debe omitirse una alerta por intervalo de tiempo
   */
  private shouldSkipAlert(alertType: AlertType): boolean {
    const lastAlert = this.lastAlerts[alertType];
    if (!lastAlert) return false;

    const now = new Date();
    const timeDiffMinutes = (now.getTime() - lastAlert.getTime()) / (1000 * 60);
    return timeDiffMinutes < this.config.alertInterval;
  }

  /**
   * Muestra la alerta visual usando Alert de React Native
   */
  private showVisualAlert(alertInfo: AlertInfo): void {
    const title = this.getAlertTitle(alertInfo.type);
    const message = this.formatAlertMessage(alertInfo);

    Alert.alert(
      title,
      message,
      [
        { text: 'Entendido', style: 'default' },
        { 
          text: 'Ver Detalles', 
          style: 'default',
          onPress: () => this.showDetailedAlert(alertInfo)
        },
        {
          text: 'Configurar',
          style: 'default',
          onPress: () => console.log('Navegar a configuración de temperatura')
        }
      ],
      { 
        cancelable: true,
        onDismiss: () => console.log('Alerta de temperatura cerrada')
      }
    );
  }

  /**
   * Obtiene el título de la alerta según su tipo
   */
  private getAlertTitle(alertType: AlertType): string {
    switch (alertType) {
      case 'temperature_high':
        return '⚠️ Temperatura Alta';
      case 'temperature_low':
        return '🧊 Temperatura Baja';
      case 'temperature_critical':
        return '🚨 Temperatura Crítica';
      default:
        return '⚠️ Alerta de Temperatura';
    }
  }

  /**
   * Formatea el mensaje de la alerta
   */
  private formatAlertMessage(alertInfo: AlertInfo): string {
    const tempCelsius = alertInfo.temperature.toFixed(1);
    const thresholdCelsius = alertInfo.threshold.toFixed(1);
    
    return `🌡️ Temperatura actual: ${tempCelsius}°C\n` +
           `🎯 Límite: ${thresholdCelsius}°C\n\n` +
           `⚠️ ${alertInfo.message}\n\n` +
           `📳 El sistema activará vibración y sonido para alertar.`;
  }

  /**
   * Muestra alerta detallada con más información
   */
  private showDetailedAlert(alertInfo: AlertInfo): void {
    const detailedMessage = this.formatDetailedMessage(alertInfo);
    
    Alert.alert(
      'Detalles de la Alerta',
      detailedMessage,
      [
        { text: 'Cerrar', style: 'default' },
        { 
          text: 'Configurar Alertas', 
          style: 'default',
          onPress: () => console.log('Abrir configuración de alertas')
        }
      ]
    );
  }

  /**
   * Formatea mensaje detallado de la alerta
   */
  private formatDetailedMessage(alertInfo: AlertInfo): string {
    const tempCelsius = alertInfo.temperature.toFixed(1);
    const tempFahrenheit = (alertInfo.temperature * 9/5 + 32).toFixed(1);
    const thresholdCelsius = alertInfo.threshold.toFixed(1);
    const timestamp = alertInfo.timestamp.toLocaleString();

    return `🌡️ Temperatura: ${tempCelsius}°C (${tempFahrenheit}°F)\n` +
           `🎯 Límite: ${thresholdCelsius}°C\n` +
           `⏰ Hora: ${timestamp}\n\n` +
           `📋 Tipo: ${this.getAlertTypeDescription(alertInfo.type)}\n\n` +
           `💡 Recomendación: ${this.getRecommendation(alertInfo.type)}`;
  }

  /**
   * Obtiene descripción del tipo de alerta
   */
  private getAlertTypeDescription(alertType: AlertType): string {
    switch (alertType) {
      case 'temperature_high':
        return 'Temperatura por encima del rango seguro';
      case 'temperature_low':
        return 'Temperatura por debajo del rango seguro';
      case 'temperature_critical':
        return 'Temperatura en rango crítico que requiere acción inmediata';
      default:
        return 'Alerta de temperatura';
    }
  }

  /**
   * Obtiene recomendación según el tipo de alerta
   */
  private getRecommendation(alertType: AlertType): string {
    switch (alertType) {
      case 'temperature_high':
        return 'Verificar sistema de refrigeración y reducir temperatura';
      case 'temperature_low':
        return 'Verificar aislamiento térmico y aumentar temperatura';
      case 'temperature_critical':
        return 'Tomar acción inmediata para corregir la temperatura';
      default:
        return 'Verificar condiciones ambientales';
    }
  }

  /**
   * Activa vibración según el patrón configurado
   */
  private triggerVibration(): void {
    try {
      Vibration.vibrate(this.config.vibrationPattern);
    } catch (error) {
      console.error('Error activando vibración:', error);
      // Si no hay permisos de vibración, mostrar alerta simulada
      this.showVibrationSimulationAlert();
    }
  }

  /**
   * Muestra una alerta simulando la vibración cuando no hay permisos
   */
  private showVibrationSimulationAlert(): void {
    Alert.alert(
      '📳 Vibración Simulada',
      '🔔 El dispositivo estaría vibrando ahora para alertar sobre la temperatura.\n\n⚠️ Simulación: Sin permisos de vibración en emulador.',
      [
        { text: 'Entendido', style: 'default' }
      ],
      { 
        cancelable: true,
        onDismiss: () => console.log('Simulación de vibración completada')
      }
    );
  }

  /**
   * Activa alerta para temperatura alta
   */
  public triggerHighTemperatureAlert(temperature: number, threshold: number): void {
    const alertInfo: AlertInfo = {
      type: 'temperature_high',
      temperature,
      threshold,
      message: 'La temperatura está por encima del rango seguro. Se recomienda verificar el sistema de refrigeración.',
      timestamp: new Date()
    };
    this.triggerTemperatureAlert(alertInfo);
  }

  /**
   * Activa alerta para temperatura baja
   */
  public triggerLowTemperatureAlert(temperature: number, threshold: number): void {
    const alertInfo: AlertInfo = {
      type: 'temperature_low',
      temperature,
      threshold,
      message: 'La temperatura está por debajo del rango seguro. Se recomienda verificar el aislamiento térmico.',
      timestamp: new Date()
    };
    this.triggerTemperatureAlert(alertInfo);
  }

  /**
   * Activa alerta para temperatura crítica
   */
  public triggerCriticalTemperatureAlert(temperature: number, threshold: number): void {
    const alertInfo: AlertInfo = {
      type: 'temperature_critical',
      temperature,
      threshold,
      message: 'ATENCIÓN: Temperatura en rango crítico. Se requiere acción inmediata.',
      timestamp: new Date()
    };
    this.triggerTemperatureAlert(alertInfo);
  }

  /**
   * Cancela todas las vibraciones activas
   */
  public cancelVibration(): void {
    try {
      Vibration.cancel();
    } catch (error) {
      console.error('Error cancelando vibración:', error);
    }
  }

  /**
   * Limpia el historial de alertas
   */
  public clearAlertHistory(): void {
    this.lastAlerts = {};
  }

  /**
   * Obtiene el tiempo transcurrido desde la última alerta de un tipo
   */
  public getTimeSinceLastAlert(alertType: AlertType): number | null {
    const lastAlert = this.lastAlerts[alertType];
    if (!lastAlert) return null;

    const now = new Date();
    return (now.getTime() - lastAlert.getTime()) / (1000 * 60); // retorna minutos
  }

  /**
   * Verifica si las alertas están habilitadas
   */
  public areAlertsEnabled(): boolean {
    return this.config.enableSound || this.config.enableVibration;
  }

  /**
   * Habilita/deshabilita alertas completamente
   */
  public setAlertsEnabled(enabled: boolean): void {
    this.config.enableSound = enabled;
    this.config.enableVibration = enabled;
  }

  /**
   * Prueba las alertas con datos de ejemplo
   */
  public testAlert(alertType: AlertType = 'temperature_high'): void {
    const testAlertInfo: AlertInfo = {
      type: alertType,
      temperature: alertType === 'temperature_high' ? 25.5 : 2.1,
      threshold: alertType === 'temperature_high' ? 20.0 : 5.0,
      message: 'Esta es una alerta de prueba para verificar el funcionamiento del sistema.',
      timestamp: new Date()
    };

    // Limpiar historial para permitir la alerta de prueba
    delete this.lastAlerts[alertType];
    
    this.triggerTemperatureAlert(testAlertInfo);
  }
}