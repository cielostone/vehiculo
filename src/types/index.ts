// Tipos para la aplicación de Taller de Logística

export interface InventoryItem {
  id: string;
  name: string;
  category: 'carnes' | 'mariscos' | 'verduras' | 'lacteos' | 'otros' | 'Embalaje' | 'Documentación' | 'Transporte';
  quantity: number;
  minStock: number;
  maxStock: number;
  location: string;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired';
  expirationDate: Date;
  purchaseDate: Date;
  supplier: string;
  temperature: number; // Para cadena de frío
  unit: 'kg' | 'units' | 'boxes' | 'liters';
  lastUpdated: Date;
}

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed';
  items: InventoryItem[];
  estimatedDelivery: Date;
  actualDelivery?: Date;
  driver?: string;
  trackingNumber: string;
}

export interface WorkshopActivity {
  id: string;
  title: string;
  description: string;
  type: 'exercise' | 'case_study' | 'simulation' | 'evaluation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // en minutos
  completed: boolean;
  score?: number;
  category: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  progress: {
    activitiesCompleted: number;
    totalActivities: number;
    averageScore: number;
  };
}

export interface DashboardStats {
  totalInventoryItems: number;
  lowStockItems: number;
  activeShipments: number;
  completedActivities: number;
  pendingActivities: number;
  totalVehicles: number;
  activeRoutes: number;
  deliveryEfficiency: number;
}

// Nuevos tipos para Actividad 07
export interface Vehicle {
  id: string;
  name: string;
  type: 'truck' | 'van' | 'refrigerated' | 'motorcycle';
  plateNumber: string;
  capacity: number; // en kg
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  driver?: string;
  fuelLevel: number; // 0-100%
  maintenanceDate: Date;
  nextMaintenanceDate: Date;
  mileage: number;
  refrigerationTemp?: number; // para vehículos refrigerados
}

export interface RouteWaypoint {
  id: string;
  order: number;
  address: string;
  latitude: number;
  longitude: number;
  type: 'pickup' | 'delivery';
  status: 'pending' | 'completed' | 'skipped';
  estimatedArrival: Date;
  actualArrival?: Date;
  notes?: string;
  items?: string[]; // IDs de items a entregar/recoger
}

export interface Route {
  id: string;
  name: string;
  vehicleId: string;
  driverId: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  waypoints: RouteWaypoint[];
  totalDistance: number; // en km
  estimatedDuration: number; // en minutos
  actualDuration?: number; // en minutos
  deliveredItems: number;
  totalItems: number;
}

export interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'expiring_soon' | 'expired' | 'temperature_alert';
  itemId: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
}

// Nuevos tipos para Actividad 07
export interface Vehicle {
  id: string;
  name: string;
  type: 'truck' | 'van' | 'refrigerated' | 'motorcycle';
  plateNumber: string;
  capacity: number; // en kg
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  driver?: string;
  fuelLevel: number; // 0-100%
  maintenanceDate: Date;
  nextMaintenanceDate: Date;
  mileage: number;
  refrigerationTemp?: number; // Para vehículos refrigerados
}

export interface Route {
  id: string;
  name: string;
  vehicleId: string;
  driverId: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  waypoints: RouteWaypoint[];
  totalDistance: number; // en km
  estimatedDuration: number; // en minutos
  actualDuration?: number;
  fuelConsumption?: number;
  deliveredItems: number;
  totalItems: number;
}

export interface RouteWaypoint {
  id: string;
  order: number;
  address: string;
}

export interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'expiring_soon' | 'expired' | 'temperature_alert';
  itemId: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
}

// Navigation types
export type RootStackParamList = {
  // Auth Flow
  Login: undefined;
  Main: undefined;
  
  // Main Navigation
  Home: undefined;
  Menu: undefined;
  Dashboard: undefined;
  Inventory: undefined;
  Shipments: undefined;
  Activities: undefined;
  Profile: undefined;
  DeliveryCalculator: undefined;
  GPSDistance: undefined;
  
  // Nuevas pantallas Actividad 07
  VehicleManagement: undefined;
  RouteManagement: undefined;
  InventoryAdvanced: undefined;
  
  // Nuevas pantallas Actividad 08 - Monitoreo de Temperatura
  TemperatureMonitor: undefined;
  TemperatureConfig: undefined;
  
  // Detail Screens
  InventoryDetail: { itemId: string };
  ShipmentDetail: { shipmentId: string };
  ActivityDetail: { activityId: string };
  VehicleDetail: { vehicleId: string };
  RouteDetail: { routeId: string };
};