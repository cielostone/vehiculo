import { Vehicle } from '../types';
import FirebaseService from './FirebaseService';

export class VehicleService {
  private static instance: VehicleService;
  private firebaseService: FirebaseService;

  private constructor() {
    this.firebaseService = FirebaseService.getInstance();
  }

  public static getInstance(): VehicleService {
    if (!VehicleService.instance) {
      VehicleService.instance = new VehicleService();
    }
    return VehicleService.instance;
  }

  // Crear o actualizar vehículo
  async createOrUpdateVehicle(vehicle: Vehicle): Promise<void> {
    try {
      await this.firebaseService.createData('vehicles', vehicle.id, vehicle);
      console.log('🚛 Vehículo actualizado:', vehicle.name);
    } catch (error) {
      console.error('❌ Error al actualizar vehículo:', error);
      throw error;
    }
  }

  // Obtener todos los vehículos
  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const vehicles = await this.firebaseService.readData('vehicles');
      return Object.values(vehicles || {}) as Vehicle[];
    } catch (error) {
      console.error('❌ Error al obtener vehículos:', error);
      return [];
    }
  }

  // Obtener vehículos por estado
  async getVehiclesByStatus(status: string): Promise<Vehicle[]> {
    try {
      const allVehicles = await this.getAllVehicles();
      return allVehicles.filter(vehicle => vehicle.status === status);
    } catch (error) {
      console.error('❌ Error al obtener vehículos por estado:', error);
      return [];
    }
  }

  // Obtener vehículos disponibles
  async getAvailableVehicles(): Promise<Vehicle[]> {
    return this.getVehiclesByStatus('available');
  }

  // Obtener vehículos en uso
  async getActiveVehicles(): Promise<Vehicle[]> {
    return this.getVehiclesByStatus('in_use');
  }

  // Obtener vehículos que requieren mantenimiento
  async getVehiclesNeedingMaintenance(): Promise<Vehicle[]> {
    try {
      const allVehicles = await this.getAllVehicles();
      const today = new Date();
      
      return allVehicles.filter(vehicle => {
        const maintenanceDate = new Date(vehicle.nextMaintenanceDate);
        return maintenanceDate <= today || vehicle.status === 'maintenance';
      });
    } catch (error) {
      console.error('❌ Error al obtener vehículos que requieren mantenimiento:', error);
      return [];
    }
  }

  // Obtener vehículo por ID
  async getVehicleById(vehicleId: string): Promise<Vehicle | null> {
    try {
      const vehicle = await this.firebaseService.readData(`vehicles/${vehicleId}`);
      return vehicle as Vehicle;
    } catch (error) {
      console.error('❌ Error al obtener vehículo por ID:', error);
      return null;
    }
  }

  // Actualizar ubicación del vehículo
  async updateVehicleLocation(vehicleId: string, latitude: number, longitude: number, address: string): Promise<void> {
    try {
      const vehicle = await this.getVehicleById(vehicleId);
      if (vehicle) {
        vehicle.location = { latitude, longitude, address };
        await this.createOrUpdateVehicle(vehicle);
      }
    } catch (error) {
      console.error('❌ Error al actualizar ubicación del vehículo:', error);
      throw error;
    }
  }

  // Actualizar estado del vehículo
  async updateVehicleStatus(vehicleId: string, status: 'available' | 'in_use' | 'maintenance' | 'out_of_service'): Promise<void> {
    try {
      const vehicle = await this.getVehicleById(vehicleId);
      if (vehicle) {
        vehicle.status = status;
        await this.createOrUpdateVehicle(vehicle);
      }
    } catch (error) {
      console.error('❌ Error al actualizar estado del vehículo:', error);
      throw error;
    }
  }

  // Actualizar nivel de combustible
  async updateFuelLevel(vehicleId: string, fuelLevel: number): Promise<void> {
    try {
      const vehicle = await this.getVehicleById(vehicleId);
      if (vehicle) {
        vehicle.fuelLevel = Math.max(0, Math.min(100, fuelLevel)); // Asegurar rango 0-100
        await this.createOrUpdateVehicle(vehicle);
      }
    } catch (error) {
      console.error('❌ Error al actualizar nivel de combustible:', error);
      throw error;
    }
  }

  // Programar mantenimiento
  async scheduleMainentnce(vehicleId: string, maintenanceDate: Date): Promise<void> {
    try {
      const vehicle = await this.getVehicleById(vehicleId);
      if (vehicle) {
        vehicle.nextMaintenanceDate = maintenanceDate;
        vehicle.status = 'maintenance';
        await this.createOrUpdateVehicle(vehicle);
      }
    } catch (error) {
      console.error('❌ Error al programar mantenimiento:', error);
      throw error;
    }
  }

  // Obtener estadísticas de vehículos
  async getVehicleStats(): Promise<{
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    outOfService: number;
    averageFuelLevel: number;
    needingMaintenance: number;
  }> {
    try {
      const allVehicles = await this.getAllVehicles();
      const available = allVehicles.filter(v => v.status === 'available').length;
      const inUse = allVehicles.filter(v => v.status === 'in_use').length;
      const maintenance = allVehicles.filter(v => v.status === 'maintenance').length;
      const outOfService = allVehicles.filter(v => v.status === 'out_of_service').length;
      
      const totalFuel = allVehicles.reduce((sum, v) => sum + v.fuelLevel, 0);
      const averageFuelLevel = allVehicles.length > 0 ? totalFuel / allVehicles.length : 0;
      
      const needingMaintenance = await this.getVehiclesNeedingMaintenance();

      return {
        total: allVehicles.length,
        available,
        inUse,
        maintenance,
        outOfService,
        averageFuelLevel: Math.round(averageFuelLevel),
        needingMaintenance: needingMaintenance.length,
      };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas de vehículos:', error);
      return {
        total: 0,
        available: 0,
        inUse: 0,
        maintenance: 0,
        outOfService: 0,
        averageFuelLevel: 0,
        needingMaintenance: 0,
      };
    }
  }

  // Generar datos de prueba
  async generateSampleData(): Promise<void> {
    const sampleVehicles: Vehicle[] = [
      {
        id: 'truck_001',
        name: 'Camión Refrigerado 1',
        type: 'refrigerated',
        plateNumber: 'TR-1234',
        capacity: 5000,
        status: 'available',
        location: {
          latitude: -33.40863,
          longitude: -71.696854,
          address: 'El Quisco, Chile'
        },
        driver: 'Juan Pérez',
        fuelLevel: 85,
        maintenanceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // hace 10 días
        nextMaintenanceDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // en 20 días
        mileage: 125000,
        refrigerationTemp: -18,
      },
      {
        id: 'van_001',
        name: 'Furgón de Entregas',
        type: 'van',
        plateNumber: 'FG-5678',
        capacity: 2000,
        status: 'in_use',
        location: {
          latitude: -33.41234,
          longitude: -71.701234,
          address: 'Ruta El Quisco - Valparaíso'
        },
        driver: 'María González',
        fuelLevel: 42,
        maintenanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // hace 30 días
        nextMaintenanceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // en 60 días
        mileage: 87000,
      },
      {
        id: 'truck_002',
        name: 'Camión de Carga',
        type: 'truck',
        plateNumber: 'TC-9012',
        capacity: 8000,
        status: 'maintenance',
        location: {
          latitude: -33.40500,
          longitude: -71.695000,
          address: 'Taller Mecánico El Quisco'
        },
        fuelLevel: 15,
        maintenanceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // hace 5 días
        nextMaintenanceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // en 90 días
        mileage: 203000,
      },
      {
        id: 'motorcycle_001',
        name: 'Moto Delivery',
        type: 'motorcycle',
        plateNumber: 'MT-3456',
        capacity: 50,
        status: 'available',
        location: {
          latitude: -33.40863,
          longitude: -71.696854,
          address: 'El Quisco, Chile'
        },
        driver: 'Carlos Rodríguez',
        fuelLevel: 78,
        maintenanceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // hace 15 días
        nextMaintenanceDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // en 45 días
        mileage: 45000,
      },
    ];

    for (const vehicle of sampleVehicles) {
      await this.createOrUpdateVehicle(vehicle);
    }

    console.log('✅ Datos de vehículos de prueba generados');
  }
}

export default VehicleService;