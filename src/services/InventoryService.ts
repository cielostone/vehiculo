import { InventoryItem, InventoryAlert } from '../types';
import FirebaseService from './FirebaseService';

export class InventoryService {
  private static instance: InventoryService;
  private firebaseService: FirebaseService;

  private constructor() {
    this.firebaseService = FirebaseService.getInstance();
  }

  public static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService();
    }
    return InventoryService.instance;
  }

  // Crear o actualizar item de inventario
  async createOrUpdateItem(item: InventoryItem): Promise<void> {
    try {
      // Verificar estado automáticamente
      item.status = this.calculateItemStatus(item);
      
      await this.firebaseService.createData('inventory', item.id, item);
      
      // Generar alertas si es necesario
      await this.checkAndCreateAlerts(item);
      
      console.log('📦 Item de inventario actualizado:', item.name);
    } catch (error) {
      console.error('❌ Error al actualizar item de inventario:', error);
      throw error;
    }
  }

  // Obtener todos los items de inventario
  async getAllItems(): Promise<InventoryItem[]> {
    try {
      const items = await this.firebaseService.readData('inventory');
      return Object.values(items || {}) as InventoryItem[];
    } catch (error) {
      console.error('❌ Error al obtener items de inventario:', error);
      return [];
    }
  }

  // Obtener items por categoría
  async getItemsByCategory(category: string): Promise<InventoryItem[]> {
    try {
      const allItems = await this.getAllItems();
      return allItems.filter(item => item.category === category);
    } catch (error) {
      console.error('❌ Error al obtener items por categoría:', error);
      return [];
    }
  }

  // Obtener items con stock bajo
  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const allItems = await this.getAllItems();
      return allItems.filter(item => item.quantity <= item.minStock);
    } catch (error) {
      console.error('❌ Error al obtener items con stock bajo:', error);
      return [];
    }
  }

  // Obtener items que vencen pronto (próximos 7 días)
  async getExpiringItems(): Promise<InventoryItem[]> {
    try {
      const allItems = await this.getAllItems();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      return allItems.filter(item => {
        const expirationDate = new Date(item.expirationDate);
        return expirationDate <= sevenDaysFromNow && expirationDate > new Date();
      });
    } catch (error) {
      console.error('❌ Error al obtener items que vencen pronto:', error);
      return [];
    }
  }

  // Actualizar cantidad de stock
  async updateStock(itemId: string, newQuantity: number): Promise<void> {
    try {
      const item = await this.getItemById(itemId);
      if (item) {
        item.quantity = newQuantity;
        item.lastUpdated = new Date();
        await this.createOrUpdateItem(item);
      }
    } catch (error) {
      console.error('❌ Error al actualizar stock:', error);
      throw error;
    }
  }

  // Obtener item por ID
  async getItemById(itemId: string): Promise<InventoryItem | null> {
    try {
      const item = await this.firebaseService.readData(`inventory/${itemId}`);
      return item as InventoryItem;
    } catch (error) {
      console.error('❌ Error al obtener item por ID:', error);
      return null;
    }
  }

  // Calcular estado del item basado en stock y vencimiento
  private calculateItemStatus(item: InventoryItem): 'available' | 'low_stock' | 'out_of_stock' | 'expired' {
    const now = new Date();
    const expirationDate = new Date(item.expirationDate);

    // Verificar si está vencido
    if (expirationDate <= now) {
      return 'expired';
    }

    // Verificar stock
    if (item.quantity === 0) {
      return 'out_of_stock';
    } else if (item.quantity <= item.minStock) {
      return 'low_stock';
    } else {
      return 'available';
    }
  }

  // Crear alertas para items problemáticos
  private async checkAndCreateAlerts(item: InventoryItem): Promise<void> {
    const alerts: InventoryAlert[] = [];
    const now = new Date();
    const expirationDate = new Date(item.expirationDate);
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Alerta de stock bajo
    if (item.quantity <= item.minStock && item.quantity > 0) {
      alerts.push({
        id: `${item.id}_low_stock_${Date.now()}`,
        type: 'low_stock',
        itemId: item.id,
        message: `Stock bajo para ${item.name}. Cantidad actual: ${item.quantity}, mínimo: ${item.minStock}`,
        severity: item.quantity === 0 ? 'critical' : 'medium',
        timestamp: now,
        resolved: false
      });
    }

    // Alerta de vencimiento próximo (3 días)
    if (daysUntilExpiration <= 3 && daysUntilExpiration > 0) {
      alerts.push({
        id: `${item.id}_expiring_${Date.now()}`,
        type: 'expiring_soon',
        itemId: item.id,
        message: `${item.name} vence en ${daysUntilExpiration} día(s)`,
        severity: daysUntilExpiration === 1 ? 'high' : 'medium',
        timestamp: now,
        resolved: false
      });
    }

    // Alerta de producto vencido
    if (daysUntilExpiration <= 0) {
      alerts.push({
        id: `${item.id}_expired_${Date.now()}`,
        type: 'expired',
        itemId: item.id,
        message: `${item.name} está vencido desde ${Math.abs(daysUntilExpiration)} día(s)`,
        severity: 'critical',
        timestamp: now,
        resolved: false
      });
    }

    // Alerta de temperatura (para productos refrigerados)
    if ((item.category === 'carnes' || item.category === 'mariscos') && item.temperature > -15) {
      alerts.push({
        id: `${item.id}_temperature_${Date.now()}`,
        type: 'temperature_alert',
        itemId: item.id,
        message: `Temperatura crítica para ${item.name}: ${item.temperature}°C`,
        severity: 'critical',
        timestamp: now,
        resolved: false
      });
    }

    // Guardar alertas en Firebase
    for (const alert of alerts) {
      await this.firebaseService.createData('inventory_alerts', alert.id, alert);
    }
  }

  // Obtener alertas activas
  async getActiveAlerts(): Promise<InventoryAlert[]> {
    try {
      const alerts = await this.firebaseService.readData('inventory_alerts');
      const alertsArray = Object.values(alerts || {}) as InventoryAlert[];
      return alertsArray.filter(alert => !alert.resolved);
    } catch (error) {
      console.error('❌ Error al obtener alertas:', error);
      return [];
    }
  }

  // Resolver alerta
  async resolveAlert(alertId: string): Promise<void> {
    try {
      const alert = await this.firebaseService.readData(`inventory_alerts/${alertId}`);
      if (alert) {
        alert.resolved = true;
        await this.firebaseService.createData('inventory_alerts', alertId, alert);
      }
    } catch (error) {
      console.error('❌ Error al resolver alerta:', error);
      throw error;
    }
  }

  // Generar datos de prueba
  async generateSampleData(): Promise<void> {
    const sampleItems: InventoryItem[] = [
      {
        id: 'beef_001',
        name: 'Carne de Res Premium',
        category: 'carnes',
        quantity: 25,
        minStock: 10,
        maxStock: 100,
        location: 'Cámara Frigorífica A',
        status: 'available',
        expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días
        purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // hace 2 días
        supplier: 'Frigorífico El Quisco',
        temperature: -18,
        unit: 'kg',
        lastUpdated: new Date()
      },
      {
        id: 'salmon_001',
        name: 'Salmón Atlántico',
        category: 'mariscos',
        quantity: 5, // Stock bajo intencionalmente
        minStock: 15,
        maxStock: 50,
        location: 'Cámara Frigorífica B',
        status: 'low_stock',
        expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días
        purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // hace 1 día
        supplier: 'Pesquera El Quisco',
        temperature: -20,
        unit: 'kg',
        lastUpdated: new Date()
      },
      {
        id: 'lettuce_001',
        name: 'Lechuga Orgánica',
        category: 'verduras',
        quantity: 30,
        minStock: 20,
        maxStock: 80,
        location: 'Almacén Refrigerado',
        status: 'available',
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        purchaseDate: new Date(),
        supplier: 'Huerto El Quisco',
        temperature: 4,
        unit: 'units',
        lastUpdated: new Date()
      }
    ];

    for (const item of sampleItems) {
      await this.createOrUpdateItem(item);
    }

    console.log('✅ Datos de inventario de prueba generados');
  }
}

export default InventoryService;