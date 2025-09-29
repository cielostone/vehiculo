/**
 * Servicio de Distribución de Alimentos
 * Implementación del caso de negocio según especificaciones del taller
 */

export interface DeliveryOrder {
  id: string;
  customerName: string;
  totalAmount: number; // Monto total de la compra
  distance: number; // Distancia en kilómetros
  products: string[];
  freezerTemperature?: number; // Temperatura del congelador
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  deliveryFee: number;
}

export class DeliveryService {
  private static readonly MAX_DELIVERY_RADIUS = 20; // 20 km máximo
  private static readonly HIGH_TIER_THRESHOLD = 50000; // 50,000 pesos
  private static readonly MID_TIER_THRESHOLD = 25000; // 25,000 pesos
  private static readonly HIGH_TIER_RATE = 150; // $150 por km
  private static readonly LOW_TIER_RATE = 300; // $300 por km
  private static readonly MAX_FREEZER_TEMP = -5; // Temperatura máxima permitida

  /**
   * Calcula la tarifa de entrega según las reglas de negocio
   * @param totalAmount Monto total de la compra
   * @param distance Distancia en kilómetros
   * @returns Tarifa calculada o null si está fuera del radio
   */
  static calculateDeliveryFee(totalAmount: number, distance: number): number | null {
    // Verificar que esté dentro del radio de entrega
    if (distance > this.MAX_DELIVERY_RADIUS) {
      return null; // Fuera del radio de entrega
    }

    // Aplicar tarifas según el monto de compra
    if (totalAmount >= this.HIGH_TIER_THRESHOLD) {
      // Compras >= 50,000: $150 por km
      return distance * this.HIGH_TIER_RATE;
    } else if (totalAmount >= this.MID_TIER_THRESHOLD) {
      // Compras 25,000-49,999: $150 por km  
      return distance * this.HIGH_TIER_RATE;
    } else {
      // Compras < 25,000: $300 por km
      return distance * this.LOW_TIER_RATE;
    }
  }

  /**
   * Convierte un número decimal a radianes
   * Requisito específico del ejercicio
   * @param decimal Número en formato decimal
   * @returns Número convertido a radianes
   */
  static convertDecimalToRadians(decimal: number): number {
    const radians = decimal * (Math.PI / 180);
    
    // Mostrar resultado por consola (como System.out en Java)
    console.log(`Conversión: ${decimal}° = ${radians} radianes`);
    
    return radians;
  }

  /**
   * Verifica la temperatura del congelador
   * @param temperature Temperatura actual
   * @returns true si la temperatura es segura
   */
  static checkFreezerTemperature(temperature: number): boolean {
    const isSafe = temperature <= this.MAX_FREEZER_TEMP;
    
    if (!isSafe) {
      console.warn(`¡ALERTA! Temperatura del congelador: ${temperature}°C (Máximo permitido: ${this.MAX_FREEZER_TEMP}°C)`);
    }
    
    return isSafe;
  }

  /**
   * Crea una nueva orden de entrega
   * @param orderData Datos de la orden
   * @returns Orden creada con tarifa calculada
   */
  static createDeliveryOrder(orderData: Omit<DeliveryOrder, 'id' | 'deliveryFee' | 'status'>): DeliveryOrder | null {
    const deliveryFee = this.calculateDeliveryFee(orderData.totalAmount, orderData.distance);
    
    if (deliveryFee === null) {
      console.error(`Error: La distancia ${orderData.distance}km excede el radio máximo de ${this.MAX_DELIVERY_RADIUS}km`);
      return null;
    }

    // Verificar temperatura si hay productos congelados
    if (orderData.freezerTemperature !== undefined) {
      this.checkFreezerTemperature(orderData.freezerTemperature);
    }

    return {
      id: `ORDER-${Date.now()}`,
      ...orderData,
      deliveryFee,
      status: 'pending'
    };
  }

  /**
   * Obtiene información detallada de la tarifa
   * @param totalAmount Monto de compra
   * @param distance Distancia
   * @returns Información detallada de la tarificación
   */
  static getDeliveryInfo(totalAmount: number, distance: number) {
    const fee = this.calculateDeliveryFee(totalAmount, distance);
    
    let tier: string;
    let rate: number;
    
    if (totalAmount >= this.HIGH_TIER_THRESHOLD) {
      tier = "Premium (≥$50,000)";
      rate = this.HIGH_TIER_RATE;
    } else if (totalAmount >= this.MID_TIER_THRESHOLD) {
      tier = "Estándar ($25,000-$49,999)";
      rate = this.HIGH_TIER_RATE;
    } else {
      tier = "Básico (<$25,000)";
      rate = this.LOW_TIER_RATE;
    }

    return {
      tier,
      rate,
      distance,
      fee,
      isDeliverable: fee !== null,
      maxRadius: this.MAX_DELIVERY_RADIUS
    };
  }
}