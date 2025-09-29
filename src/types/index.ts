// Tipos para la aplicación de Taller de Logística

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  location: string;
  status: 'available' | 'low_stock' | 'out_of_stock';
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
  
  // Detail Screens
  InventoryDetail: { itemId: string };
  ShipmentDetail: { shipmentId: string };
  ActivityDetail: { activityId: string };
};