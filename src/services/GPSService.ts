/**
 * GPS Service - Manejo de geolocalización y cálculo de distancias
 * Implementación de Haversine y tracking GPS
 */

import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import FirebaseService from './FirebaseService';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
  distanceToWarehouse?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

class GPSService {
  private static instance: GPSService;
  private firebaseService: FirebaseService;
  private watchId: number | null = null;
  private isTracking: boolean = false;

  // Coordenadas de la Plaza de Armas (bodega central)
  private readonly WAREHOUSE_LOCATION: GPSCoordinates = {
    latitude: -12.046374, // Plaza de Armas de Lima, Perú
    longitude: -77.042793,
  };

  private constructor() {
    this.firebaseService = FirebaseService.getInstance();
  }

  static getInstance(): GPSService {
    if (!GPSService.instance) {
      GPSService.instance = new GPSService();
    }
    return GPSService.instance;
  }

  /**
   * Solicitar permisos de ubicación en Android
   */
  async requestLocationPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true; // En iOS los permisos se manejan automáticamente
    }

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      const fineLocationGranted = 
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === 
        PermissionsAndroid.RESULTS.GRANTED;

      const coarseLocationGranted = 
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === 
        PermissionsAndroid.RESULTS.GRANTED;

      if (fineLocationGranted && coarseLocationGranted) {
        console.log('Permisos de ubicación concedidos');
        return true;
      } else {
        Alert.alert(
          'Permisos requeridos',
          'Esta aplicación necesita acceso a tu ubicación para funcionar correctamente.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  }

  /**
   * Obtener ubicación actual del dispositivo
   * CONFIGURADO PARA EL QUISCO, CHILE (para el taller)
   */
  async getCurrentPosition(): Promise<GPSCoordinates> {
    // Para el taller, usamos coordenadas fijas de El Quisco
    const elQuiscoCoordinates: GPSCoordinates = {
      latitude: -33.40863,  // El Quisco, Chile
      longitude: -71.696854,
      accuracy: 10,
      altitude: 50, // metros sobre el nivel del mar
      heading: 0,
      speed: 0,
      timestamp: Date.now(),
      // Calcular distancia al almacén (Plaza de Armas)
      distanceToWarehouse: this.calculateHaversineDistance(
        -33.40863, -71.696854, // El Quisco (ubicación actual)
        -33.4378, -70.6504    // Plaza de Armas, Santiago (almacén)
      )
    };

    console.log('🗺️ Ubicación configurada para El Quisco:', elQuiscoCoordinates);
    return Promise.resolve(elQuiscoCoordinates);

    // CÓDIGO ORIGINAL COMENTADO (para referencia):
    /*
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const coords: GPSCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          };

          console.log('Ubicación actual obtenida:', coords);
          resolve(coords);
        },
        (error) => {
          console.error('Error al obtener ubicación:', error);
          reject(this.getLocationErrorMessage(error.code));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
    */
  }

  /**
   * Iniciar tracking continuo de ubicación
   */
  async startLocationTracking(
    onLocationUpdate: (location: GPSCoordinates) => void,
    onError?: (error: LocationError) => void
  ): Promise<boolean> {
    const hasPermissions = await this.requestLocationPermissions();
    if (!hasPermissions) {
      return false;
    }

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const coords: GPSCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp,
        };

        onLocationUpdate(coords);

        // Guardar automáticamente en Firebase
        if (this.firebaseService.isAuthenticated()) {
          this.firebaseService.saveLocationToDatabase({
            latitude: coords.latitude,
            longitude: coords.longitude,
            timestamp: coords.timestamp || Date.now(),
            accuracy: coords.accuracy,
          }).catch(error => {
            console.error('Error al guardar ubicación en Firebase:', error);
          });
        }
      },
      (error) => {
        console.error('Error en tracking:', error);
        if (onError) {
          onError({
            code: error.code,
            message: this.getLocationErrorMessage(error.code),
          });
        }
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Actualizar cada 10 metros
        interval: 30000, // Actualizar cada 30 segundos
        fastestInterval: 10000, // Mínimo 10 segundos
      }
    );

    this.isTracking = true;
    console.log('Tracking GPS iniciado');
    return true;
  }

  /**
   * Detener tracking de ubicación
   */
  stopLocationTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      console.log('Tracking GPS detenido');
    }
  }

  /**
   * Verificar si el tracking está activo
   */
  isTrackingActive(): boolean {
    return this.isTracking;
  }

  /**
   * Calcular distancia entre dos puntos GPS usando fórmula Haversine
   * @param lat1 Latitud punto 1
   * @param lon1 Longitud punto 1
   * @param lat2 Latitud punto 2
   * @param lon2 Longitud punto 2
   * @returns Distancia en kilómetros
   */
  calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en kilómetros

    // Convertir grados a radianes
    const deltaLat = this.degreesToRadians(lat2 - lat1);
    const deltaLon = this.degreesToRadians(lon2 - lon1);
    const lat1Rad = this.degreesToRadians(lat1);
    const lat2Rad = this.degreesToRadians(lat2);

    // Fórmula Haversine
    const a = 
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    console.log(`Distancia Haversine calculada: ${distance.toFixed(3)} km`);
    return distance;
  }

  /**
   * Calcular distancia desde ubicación actual hasta la bodega (Plaza de Armas)
   */
  async calculateDistanceToWarehouse(): Promise<{
    distance: number;
    currentLocation: GPSCoordinates;
    warehouseLocation: GPSCoordinates;
  }> {
    try {
      const currentLocation = await this.getCurrentPosition();
      
      const distance = this.calculateHaversineDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        this.WAREHOUSE_LOCATION.latitude,
        this.WAREHOUSE_LOCATION.longitude
      );

      const result = {
        distance,
        currentLocation,
        warehouseLocation: this.WAREHOUSE_LOCATION,
      };

      console.log('Distancia a bodega calculada:', result);
      return result;
    } catch (error) {
      console.error('Error al calcular distancia a bodega:', error);
      throw error;
    }
  }

  /**
   * Obtener información detallada de la ubicación actual
   */
  async getLocationDetails(): Promise<{
    coordinates: GPSCoordinates;
    distanceToWarehouse: number;
    isWithinDeliveryRadius: boolean;
    estimatedDeliveryFee: number;
  }> {
    try {
      const { distance, currentLocation } = await this.calculateDistanceToWarehouse();
      const isWithinRadius = distance <= 20; // Radio máximo de 20km
      
      // Calcular tarifa estimada usando la lógica de DeliveryService
      let estimatedFee = 0;
      if (isWithinRadius) {
        // Asumir compra promedio de $35,000 para estimación
        estimatedFee = distance * 150; // $150 por km para compras medias
      }

      return {
        coordinates: currentLocation,
        distanceToWarehouse: distance,
        isWithinDeliveryRadius: isWithinRadius,
        estimatedDeliveryFee: estimatedFee,
      };
    } catch (error) {
      console.error('Error al obtener detalles de ubicación:', error);
      throw error;
    }
  }

  /**
   * Convertir grados a radianes
   */
  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convertir códigos de error de GPS a mensajes amigables
   */
  private getLocationErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Permisos de ubicación denegados';
      case 2:
        return 'Ubicación no disponible';
      case 3:
        return 'Tiempo de espera agotado';
      case 4:
        return 'Google Play Services no disponible';
      case 5:
        return 'Ubicación desactivada';
      default:
        return `Error de ubicación: código ${code}`;
    }
  }

  /**
   * Obtener coordenadas de la bodega (Plaza de Armas)
   */
  getWarehouseLocation(): GPSCoordinates {
    return { ...this.WAREHOUSE_LOCATION };
  }

  /**
   * Formatear coordenadas para mostrar
   */
  static formatCoordinates(coords: GPSCoordinates): string {
    const lat = coords.latitude.toFixed(6);
    const lon = coords.longitude.toFixed(6);
    return `${lat}, ${lon}`;
  }

  /**
   * Formatear distancia para mostrar
   */
  static formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} metros`;
    } else {
      return `${distanceKm.toFixed(2)} km`;
    }
  }
}

export default GPSService;