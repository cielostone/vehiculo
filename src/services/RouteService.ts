import { Route, RouteWaypoint, Vehicle } from '../types';
import FirebaseService from './FirebaseService';
import VehicleService from './VehicleService';
import { GeolocationService } from './GeolocationService';

export class RouteService {
  private static instance: RouteService;
  private firebaseService: FirebaseService;
  private vehicleService: VehicleService;

  private constructor() {
    this.firebaseService = FirebaseService.getInstance();
    this.vehicleService = VehicleService.getInstance();
  }

  public static getInstance(): RouteService {
    if (!RouteService.instance) {
      RouteService.instance = new RouteService();
    }
    return RouteService.instance;
  }

  // Crear o actualizar ruta
  async createOrUpdateRoute(route: Route): Promise<void> {
    try {
      await this.firebaseService.createData('routes', route.id, route);
      console.log('🗺️ Ruta actualizada:', route.name);
    } catch (error) {
      console.error('❌ Error al actualizar ruta:', error);
      throw error;
    }
  }

  // Obtener todas las rutas
  async getAllRoutes(): Promise<Route[]> {
    try {
      const routes = await this.firebaseService.readData('routes');
      return Object.values(routes || {}) as Route[];
    } catch (error) {
      console.error('❌ Error al obtener rutas:', error);
      return [];
    }
  }

  // Obtener rutas por estado
  async getRoutesByStatus(status: string): Promise<Route[]> {
    try {
      const allRoutes = await this.getAllRoutes();
      return allRoutes.filter(route => route.status === status);
    } catch (error) {
      console.error('❌ Error al obtener rutas por estado:', error);
      return [];
    }
  }

  // Obtener rutas activas
  async getActiveRoutes(): Promise<Route[]> {
    return this.getRoutesByStatus('active');
  }

  // Obtener rutas planificadas
  async getPlannedRoutes(): Promise<Route[]> {
    return this.getRoutesByStatus('planned');
  }

  // Obtener ruta por ID
  async getRouteById(routeId: string): Promise<Route | null> {
    try {
      const route = await this.firebaseService.readData(`routes/${routeId}`);
      return route as Route;
    } catch (error) {
      console.error('❌ Error al obtener ruta por ID:', error);
      return null;
    }
  }

  // Crear nueva ruta optimizada
  async createOptimizedRoute(
    name: string,
    vehicleId: string,
    driverId: string,
    waypoints: Omit<RouteWaypoint, 'id' | 'order' | 'estimatedArrival'>[]
  ): Promise<Route> {
    try {
      // Validar que el vehículo esté disponible
      const vehicle = await this.vehicleService.getVehicleById(vehicleId);
      if (!vehicle || vehicle.status !== 'available') {
        throw new Error('Vehículo no disponible');
      }

      // Ordenar waypoints para optimizar la ruta
      const optimizedWaypoints = await this.optimizeWaypoints(waypoints);

      // Calcular distancia total y duración estimada
      const totalDistance = await this.calculateTotalDistance(optimizedWaypoints);
      const estimatedDuration = this.calculateEstimatedDuration(totalDistance, optimizedWaypoints.length);

      // Crear waypoints con orden y estimaciones
      const orderedWaypoints: RouteWaypoint[] = optimizedWaypoints.map((wp, index) => ({
        ...wp,
        id: `${Date.now()}_${index}`,
        order: index + 1,
        estimatedArrival: new Date(Date.now() + (index + 1) * (estimatedDuration / optimizedWaypoints.length) * 60 * 1000),
        status: 'pending'
      }));

      // Crear ruta
      const route: Route = {
        id: `route_${Date.now()}`,
        name,
        vehicleId,
        driverId,
        status: 'planned',
        startDate: new Date(),
        waypoints: orderedWaypoints,
        totalDistance,
        estimatedDuration,
        deliveredItems: 0,
        totalItems: orderedWaypoints.reduce((total, wp) => total + (wp.items?.length || 0), 0)
      };

      await this.createOrUpdateRoute(route);
      return route;
    } catch (error) {
      console.error('❌ Error al crear ruta optimizada:', error);
      throw error;
    }
  }

  // Optimizar orden de waypoints usando algoritmo del vecino más cercano
  private async optimizeWaypoints(waypoints: Omit<RouteWaypoint, 'id' | 'order' | 'estimatedArrival'>[]): Promise<typeof waypoints> {
    if (waypoints.length <= 2) return waypoints;

    // Punto de inicio (base en El Quisco)
    const baseLocation = { latitude: -33.40863, longitude: -71.696854 };
    let optimized: typeof waypoints = [];
    let remaining = [...waypoints];
    let currentLocation = baseLocation;

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      // Encontrar el waypoint más cercano
      for (let i = 0; i < remaining.length; i++) {
        const distance = GeolocationService.calculateHaversineDistance(
          { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
          { latitude: remaining[i].latitude, longitude: remaining[i].longitude }
        ).distanceKm;

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      // Agregar el waypoint más cercano
      const nearest = remaining.splice(nearestIndex, 1)[0];
      optimized.push(nearest);
      currentLocation = { latitude: nearest.latitude, longitude: nearest.longitude };
    }

    return optimized;
  }

  // Calcular distancia total de la ruta
  private async calculateTotalDistance(waypoints: Omit<RouteWaypoint, 'id' | 'order' | 'estimatedArrival'>[]): Promise<number> {
    if (waypoints.length === 0) return 0;

    let totalDistance = 0;
    const baseLocation = { latitude: -33.40863, longitude: -71.696854 };
    let currentLocation = baseLocation;

    for (const waypoint of waypoints) {
      const distance = GeolocationService.calculateHaversineDistance(
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
        { latitude: waypoint.latitude, longitude: waypoint.longitude }
      ).distanceKm;
      totalDistance += distance;
      currentLocation = { latitude: waypoint.latitude, longitude: waypoint.longitude };
    }

    // Distancia de regreso a la base
    if (waypoints.length > 0) {
      const lastWaypoint = waypoints[waypoints.length - 1];
      const returnDistance = GeolocationService.calculateHaversineDistance(
        { latitude: lastWaypoint.latitude, longitude: lastWaypoint.longitude },
        { latitude: baseLocation.latitude, longitude: baseLocation.longitude }
      ).distanceKm;
      totalDistance += returnDistance;
    }

    return Math.round(totalDistance * 100) / 100; // Redondear a 2 decimales
  }

  // Calcular duración estimada en minutos
  private calculateEstimatedDuration(distance: number, waypointCount: number): number {
    const avgSpeed = 40; // km/h promedio en ciudad
    const stopTime = 15; // minutos por parada
    const travelTime = (distance / avgSpeed) * 60; // minutos
    const totalStopTime = waypointCount * stopTime;
    return Math.round(travelTime + totalStopTime);
  }

  // Iniciar ruta
  async startRoute(routeId: string): Promise<void> {
    try {
      const route = await this.getRouteById(routeId);
      if (!route) throw new Error('Ruta no encontrada');

      route.status = 'active';
      route.startDate = new Date();

      // Actualizar estado del vehículo
      await this.vehicleService.updateVehicleStatus(route.vehicleId, 'in_use');

      await this.createOrUpdateRoute(route);
      console.log('🚀 Ruta iniciada:', route.name);
    } catch (error) {
      console.error('❌ Error al iniciar ruta:', error);
      throw error;
    }
  }

  // Completar waypoint
  async completeWaypoint(routeId: string, waypointId: string): Promise<void> {
    try {
      const route = await this.getRouteById(routeId);
      if (!route) throw new Error('Ruta no encontrada');

      const waypoint = route.waypoints.find(wp => wp.id === waypointId);
      if (!waypoint) throw new Error('Waypoint no encontrado');

      waypoint.status = 'completed';
      waypoint.actualArrival = new Date();

      // Actualizar contador de items entregados
      if (waypoint.items) {
        route.deliveredItems += waypoint.items.length;
      }

      // Verificar si la ruta está completa
      const allCompleted = route.waypoints.every(wp => wp.status === 'completed');
      if (allCompleted) {
        route.status = 'completed';
        route.endDate = new Date();
        route.actualDuration = Math.round((route.endDate.getTime() - new Date(route.startDate).getTime()) / (1000 * 60));

        // Liberar vehículo
        await this.vehicleService.updateVehicleStatus(route.vehicleId, 'available');
      }

      await this.createOrUpdateRoute(route);
      console.log('✅ Waypoint completado:', waypoint.address);
    } catch (error) {
      console.error('❌ Error al completar waypoint:', error);
      throw error;
    }
  }

  // Cancelar ruta
  async cancelRoute(routeId: string): Promise<void> {
    try {
      const route = await this.getRouteById(routeId);
      if (!route) throw new Error('Ruta no encontrada');

      route.status = 'cancelled';

      // Liberar vehículo si estaba en uso
      if (route.vehicleId) {
        await this.vehicleService.updateVehicleStatus(route.vehicleId, 'available');
      }

      await this.createOrUpdateRoute(route);
      console.log('❌ Ruta cancelada:', route.name);
    } catch (error) {
      console.error('❌ Error al cancelar ruta:', error);
      throw error;
    }
  }

  // Obtener estadísticas de rutas
  async getRouteStats(): Promise<{
    total: number;
    planned: number;
    active: number;
    completed: number;
    cancelled: number;
    totalDistance: number;
    averageEfficiency: number;
    completedDeliveries: number;
  }> {
    try {
      const allRoutes = await this.getAllRoutes();
      
      const planned = allRoutes.filter(r => r.status === 'planned').length;
      const active = allRoutes.filter(r => r.status === 'active').length;
      const completed = allRoutes.filter(r => r.status === 'completed').length;
      const cancelled = allRoutes.filter(r => r.status === 'cancelled').length;

      const completedRoutes = allRoutes.filter(r => r.status === 'completed');
      const totalDistance = completedRoutes.reduce((sum, r) => sum + r.totalDistance, 0);
      
      const efficiencies = completedRoutes
        .filter(r => r.actualDuration && r.estimatedDuration)
        .map(r => (r.estimatedDuration! / r.actualDuration!) * 100);
      
      const averageEfficiency = efficiencies.length > 0 
        ? efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length 
        : 0;

      const completedDeliveries = completedRoutes.reduce((sum, r) => sum + r.deliveredItems, 0);

      return {
        total: allRoutes.length,
        planned,
        active,
        completed,
        cancelled,
        totalDistance: Math.round(totalDistance * 100) / 100,
        averageEfficiency: Math.round(averageEfficiency),
        completedDeliveries,
      };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas de rutas:', error);
      return {
        total: 0,
        planned: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        totalDistance: 0,
        averageEfficiency: 0,
        completedDeliveries: 0,
      };
    }
  }

  // Generar datos de prueba
  async generateSampleData(): Promise<void> {
    const sampleWaypoints = [
      {
        address: 'Valparaíso Centro, Chile',
        latitude: -33.0472,
        longitude: -71.6127,
        type: 'delivery' as const,
        status: 'pending' as const,
        notes: 'Entregar en recepción del edificio'
      },
      {
        address: 'Viña del Mar, Chile',
        latitude: -33.0153,
        longitude: -71.5530,
        type: 'delivery' as const,
        status: 'pending' as const,
        notes: 'Casa particular, timbrar dos veces'
      },
      {
        address: 'Quilpué, Chile',
        latitude: -33.0474,
        longitude: -71.4419,
        type: 'pickup' as const,
        status: 'pending' as const,
        notes: 'Recoger productos refrigerados'
      }
    ];

    try {
      // Generar vehículos de prueba si no existen
      const vehicles = await this.vehicleService.getAllVehicles();
      if (vehicles.length === 0) {
        await this.vehicleService.generateSampleData();
      }

      const availableVehicles = await this.vehicleService.getAvailableVehicles();
      if (availableVehicles.length === 0) {
        console.log('⚠️ No hay vehículos disponibles para crear rutas');
        return;
      }

      // Crear ruta de ejemplo
      const route1 = await this.createOptimizedRoute(
        'Ruta Valparaíso - Viña del Mar',
        availableVehicles[0].id,
        'conductor_001',
        sampleWaypoints
      );

      // Crear segunda ruta si hay más vehículos
      if (availableVehicles.length > 1) {
        const route2 = await this.createOptimizedRoute(
          'Ruta Costa Norte',
          availableVehicles[1].id,
          'conductor_002',
          [
            {
              address: 'Concón, Chile',
              latitude: -32.9253,
              longitude: -71.5203,
              type: 'delivery' as const,
              status: 'pending' as const,
              notes: 'Entregar antes de las 18:00'
            },
            {
              address: 'Reñaca, Chile',
              latitude: -32.9833,
              longitude: -71.5333,
              type: 'delivery' as const,
              status: 'pending' as const,
              notes: 'Productos congelados'
            }
          ]
        );

        // Iniciar segunda ruta automáticamente
        await this.startRoute(route2.id);
      }

      console.log('✅ Datos de rutas de prueba generados');
    } catch (error) {
      console.error('❌ Error al generar datos de rutas:', error);
      throw error;
    }
  }
}

export default RouteService;