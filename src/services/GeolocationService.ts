/**
 * Servicio de Geolocalización y Cálculo de Distancias GPS
 * Implementa la fórmula Haversine para calcular distancias entre coordenadas
 */

export interface GPSCoordinate {
  latitude: number;  // Latitud en grados decimales
  longitude: number; // Longitud en grados decimales
  name?: string;     // Nombre opcional de la ubicación
}

export interface DistanceResult {
  distanceKm: number;
  distanceMeters: number;
  origin: GPSCoordinate;
  destination: GPSCoordinate;
  calculationTime: number;
}

export class GeolocationService {
  // Radio de la Tierra en kilómetros
  private static readonly EARTH_RADIUS_KM = 6371;

  // Coordenadas de ejemplo para la plaza de armas (bodega central)
  // Coordenadas del almacén en Santiago, Chile
  public static readonly WAREHOUSE_LOCATION: GPSCoordinate = {
    latitude: -33.4489,  // Santiago, Chile
    longitude: -70.6693,
    name: "Almacén Central - Santiago"
  };

  /**
   * Convierte grados decimales a radianes con logging completo
   * Equivalente a System.out en Java - Muestra resultado por consola
   * 
   * FÓRMULA: radianes = grados × (π / 180)
   * 
   * @param degrees Número decimal en grados (puede ser flotante)
   * @returns Valor convertido en radianes
   */
  static convertDegreesToRadiansWithLog(degrees: number): number {
    // Validar entrada
    if (typeof degrees !== 'number' || isNaN(degrees)) {
      console.error(`❌ ERROR: Valor inválido para conversión: ${degrees}`);
      return 0;
    }

    // Realizar conversión
    const radians = degrees * (Math.PI / 180);
    
    // === SALIDA POR DEFECTO (System.out equivalente) ===
    console.log(`\n🔄 CONVERSIÓN GRADOS A RADIANES`);
    console.log(`📐 Entrada (grados): ${degrees}°`);
    console.log(`📏 Resultado (radianes): ${radians}`);
    console.log(`🔢 Resultado (6 decimales): ${radians.toFixed(6)}`);
    console.log(`📊 Fórmula aplicada: ${degrees} × (π/180) = ${radians.toFixed(6)}`);
    console.log(`⚡ Timestamp: ${new Date().toISOString()}`);
    console.log(`───────────────────────────────────────`);

    // Log adicional para Logcat con diferentes niveles
    console.info(`🟢 INFO: Conversión exitosa - ${degrees}° → ${radians.toFixed(6)} rad`);
    console.warn(`🟡 WARN: Verificar resultado en Logcat`);
    
    // Log estructurado para debugging
    const conversionData = {
      input_degrees: degrees,
      output_radians: radians,
      output_radians_fixed: parseFloat(radians.toFixed(6)),
      formula_used: "degrees * (PI / 180)",
      pi_value: Math.PI,
      timestamp: Date.now(),
      readable_time: new Date().toLocaleString('es-ES')
    };
    
    console.log('📋 DATOS DE CONVERSIÓN (JSON):', JSON.stringify(conversionData, null, 2));
    
    return radians;
  }

  /**
   * Método de prueba para validar múltiples conversiones
   * Documenta resultados en Logcat para verificación
   */
  static testRadianConversions(): void {
    console.log('\n🧪 INICIANDO PRUEBAS DE CONVERSIÓN A RADIANES');
    console.log('='.repeat(50));
    
    // Casos de prueba comunes
    const testCases = [
      0,      // 0 grados
      30,     // 30 grados
      45,     // 45 grados  
      90,     // 90 grados (π/2)
      180,    // 180 grados (π)
      360,    // 360 grados (2π)
      -33.40863,  // Latitud El Quisco (negativo)
      -71.696854, // Longitud El Quisco (negativo)
      123.456789  // Número decimal con muchos decimales
    ];

    testCases.forEach((degrees, index) => {
      console.log(`\n--- CASO DE PRUEBA ${index + 1} ---`);
      const result = this.convertDegreesToRadiansWithLog(degrees);
      
      // Verificaciones adicionales
      const expectedRadian = degrees * (Math.PI / 180);
      const isCorrect = Math.abs(result - expectedRadian) < 0.000001;
      
      console.log(`✅ Verificación: ${isCorrect ? 'CORRECTO' : '❌ ERROR'}`);
      console.log(`📍 Caso especial: ${this.getSpecialCaseInfo(degrees)}`);
    });

    console.log('\n🏁 PRUEBAS COMPLETADAS - Revisar Logcat para detalles');
    console.log('='.repeat(50));
  }

  /**
   * Información adicional sobre casos especiales de grados
   */
  private static getSpecialCaseInfo(degrees: number): string {
    switch (degrees) {
      case 0: return '0° = 0 radianes';
      case 30: return '30° = π/6 radianes';
      case 45: return '45° = π/4 radianes';
      case 90: return '90° = π/2 radianes (ángulo recto)';
      case 180: return '180° = π radianes (media vuelta)';
      case 360: return '360° = 2π radianes (vuelta completa)';
      case -33.40863: return 'Latitud de El Quisco, Chile';
      case -71.696854: return 'Longitud de El Quisco, Chile';
      default: return `Valor personalizado: ${degrees}°`;
    }
  }

  /**
   * Convierte grados a radianes (método original simplificado)
   * @param degrees Valor en grados
   * @returns Valor en radianes
   */
  private static degreesToRadians(degrees: number): number {
    const radians = degrees * (Math.PI / 180);
    
    // Mostrar conversión en console (equivalente a System.out)
    console.log(`Conversión GPS: ${degrees}° = ${radians.toFixed(6)} radianes`);
    
    return radians;
  }

  /**
   * Implementación de la Fórmula Haversine
   * Calcula la distancia entre dos coordenadas GPS
   * 
   * Fórmula:
   * R = radio de la Tierra
   * Δlat = lat2– lat1
   * Δlong = long2– long1
   * a = sin²(Δlat/2) + cos(lat1) · cos(lat2) · sin²(Δlong/2)
   * c = 2 · atan2(√a, √(1−a))
   * d = R · c
   * 
   * @param coord1 Primera coordenada (origen)
   * @param coord2 Segunda coordenada (destino)
   * @returns Resultado del cálculo de distancia
   */
  static calculateHaversineDistance(
    coord1: GPSCoordinate, 
    coord2: GPSCoordinate
  ): DistanceResult {
    const startTime = Date.now();

    // Conversión a radianes
    const lat1Rad = this.degreesToRadians(coord1.latitude);
    const lat2Rad = this.degreesToRadians(coord2.latitude);
    const deltaLatRad = this.degreesToRadians(coord2.latitude - coord1.latitude);
    const deltaLongRad = this.degreesToRadians(coord2.longitude - coord1.longitude);

    // Aplicación de la fórmula Haversine
    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLongRad / 2) * Math.sin(deltaLongRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    const distanceKm = this.EARTH_RADIUS_KM * c;
    const distanceMeters = distanceKm * 1000;

    const calculationTime = Date.now() - startTime;

    // Log detallado del cálculo
    console.log('=== CÁLCULO HAVERSINE ===');
    console.log(`Origen: ${coord1.name || 'Sin nombre'} (${coord1.latitude}, ${coord1.longitude})`);
    console.log(`Destino: ${coord2.name || 'Sin nombre'} (${coord2.latitude}, ${coord2.longitude})`);
    console.log(`Δlat = ${coord2.latitude - coord1.latitude}° = ${deltaLatRad.toFixed(6)} rad`);
    console.log(`Δlong = ${coord2.longitude - coord1.longitude}° = ${deltaLongRad.toFixed(6)} rad`);
    console.log(`a = ${a.toFixed(8)}`);
    console.log(`c = ${c.toFixed(8)}`);
    console.log(`Distancia: ${distanceKm.toFixed(3)} km (${distanceMeters.toFixed(0)} metros)`);
    console.log(`Tiempo de cálculo: ${calculationTime}ms`);
    console.log('========================');

    return {
      distanceKm: Number(distanceKm.toFixed(3)),
      distanceMeters: Number(distanceMeters.toFixed(0)),
      origin: coord1,
      destination: coord2,
      calculationTime
    };
  }

  /**
   * Calcula la distancia desde una ubicación hasta la bodega central
   * @param currentLocation Ubicación actual del dispositivo
   * @returns Resultado del cálculo de distancia a la bodega
   */
  static calculateDistanceToWarehouse(currentLocation: GPSCoordinate): DistanceResult {
    return this.calculateHaversineDistance(currentLocation, this.WAREHOUSE_LOCATION);
  }

  /**
   * Simula la obtención de coordenadas GPS del dispositivo
   * En una implementación real, esto usaría la API de geolocalización
   * @returns Coordenadas simuladas del dispositivo
   */
  static async getMockDeviceLocation(): Promise<GPSCoordinate> {
    return new Promise((resolve) => {
      // Simular delay de GPS
      setTimeout(() => {
        // Ubicación fija en El Quisco, Región de Valparaíso, Chile
        const elQuiscoLocation: GPSCoordinate = {
          latitude: -33.40863,
          longitude: -71.696854,
          name: "El Quisco"
        };
        
        console.log(`📍 Ubicación actual obtenida: ${elQuiscoLocation.name} (${elQuiscoLocation.latitude}, ${elQuiscoLocation.longitude})`);
        
        resolve(elQuiscoLocation);
      }, 1000);
    });
  }

  /**
   * Valida si las coordenadas están dentro de rangos válidos
   * @param coord Coordenadas a validar
   * @returns true si las coordenadas son válidas
   */
  static validateCoordinates(coord: GPSCoordinate): boolean {
    const isValidLat = coord.latitude >= -90 && coord.latitude <= 90;
    const isValidLng = coord.longitude >= -180 && coord.longitude <= 180;
    
    if (!isValidLat || !isValidLng) {
      console.error(`❌ Coordenadas inválidas: lat=${coord.latitude}, lng=${coord.longitude}`);
      return false;
    }
    
    return true;
  }

  /**
   * Obtiene información detallada de la distancia calculada
   * @param result Resultado del cálculo Haversine
   * @returns Información formateada para mostrar al usuario
   */
  static formatDistanceInfo(result: DistanceResult): string {
    const { distanceKm, distanceMeters, origin, destination } = result;
    
    return `
🚚 INFORMACIÓN DE ENTREGA
━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Origen: ${origin.name || 'Ubicación actual'}
📍 Destino: ${destination.name || 'Destino'}
📏 Distancia: ${distanceKm} km (${distanceMeters.toLocaleString()} metros)
⏱️ Tiempo de cálculo: ${result.calculationTime}ms
━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }
}