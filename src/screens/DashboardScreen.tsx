import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import InventoryService from '../services/InventoryService';
import VehicleService from '../services/VehicleService';
import RouteService from '../services/RouteService';
import { DashboardStats } from '../types';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<DashboardStats>({
    totalInventoryItems: 0,
    lowStockItems: 0,
    activeShipments: 0,
    completedActivities: 0,
    pendingActivities: 0,
    totalVehicles: 0,
    activeRoutes: 0,
    deliveryEfficiency: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const inventoryService = InventoryService.getInstance();
  const vehicleService = VehicleService.getInstance();
  const routeService = RouteService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar estadísticas de inventario
      const inventoryItems = await inventoryService.getAllItems();
      const lowStockItems = await inventoryService.getLowStockItems();
      const expiringItems = await inventoryService.getExpiringItems();

      // Cargar estadísticas de vehículos
      const vehicleStats = await vehicleService.getVehicleStats();

      // Cargar estadísticas de rutas
      const routeStats = await routeService.getRouteStats();

      // Construir estadísticas combinadas
      const dashboardStats: DashboardStats = {
        totalInventoryItems: inventoryItems.length,
        lowStockItems: lowStockItems.length,
        activeShipments: routeStats.active, // Rutas activas como envíos activos
        completedActivities: routeStats.completed,
        pendingActivities: routeStats.planned,
        totalVehicles: vehicleStats.total,
        activeRoutes: routeStats.active,
        deliveryEfficiency: routeStats.averageEfficiency,
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ 
    title, 
    value, 
    iconName, 
    color, 
    onPress,
    subtitle,
  }: { 
    title: string; 
    value: number | string; 
    iconName: string; 
    color: string;
    onPress?: () => void;
    subtitle?: string;
  }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statContent}>
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
        <Icon name={iconName} size={32} color={color} />
      </View>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ 
    title, 
    iconName, 
    color, 
    onPress 
  }: { 
    title: string; 
    iconName: string; 
    color: string; 
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <Icon name={iconName} size={28} color={color} />
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            ¡Bienvenido!
          </Text>
          <Text style={styles.subtitle}>
            Panel de Control - Taller de Logística Actividad 07
          </Text>
        </View>

        {/* Estadísticas Principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Estadísticas Principales</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Inventario Total"
              value={stats.totalInventoryItems}
              iconName="inventory"
              color="#4CAF50"
              onPress={() => navigation.navigate('InventoryAdvanced' as never)}
            />
            <StatCard
              title="Stock Bajo"
              value={stats.lowStockItems}
              iconName="warning"
              color="#FF9800"
              subtitle="Requieren atención"
              onPress={() => navigation.navigate('InventoryAdvanced' as never)}
            />
          </View>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Vehículos"
              value={stats.totalVehicles}
              iconName="local-shipping"
              color="#2196F3"
              onPress={() => navigation.navigate('VehicleManagement' as never)}
            />
            <StatCard
              title="Rutas Activas"
              value={stats.activeRoutes}
              iconName="directions"
              color="#9C27B0"
              onPress={() => navigation.navigate('RouteManagement' as never)}
            />
          </View>
        </View>

        {/* Métricas de Rendimiento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Métricas de Rendimiento</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceItem}>
              <Icon name="trending-up" size={32} color="#4CAF50" />
              <View style={styles.performanceText}>
                <Text style={styles.performanceValue}>{stats.deliveryEfficiency}%</Text>
                <Text style={styles.performanceLabel}>Eficiencia de Entregas</Text>
              </View>
            </View>
            
            <View style={styles.performanceItem}>
              <Icon name="check-circle" size={32} color="#2196F3" />
              <View style={styles.performanceText}>
                <Text style={styles.performanceValue}>{stats.completedActivities}</Text>
                <Text style={styles.performanceLabel}>Rutas Completadas</Text>
              </View>
            </View>
            
            <View style={styles.performanceItem}>
              <Icon name="schedule" size={32} color="#FF9800" />
              <View style={styles.performanceText}>
                <Text style={styles.performanceValue}>{stats.pendingActivities}</Text>
                <Text style={styles.performanceLabel}>Rutas Planificadas</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            <QuickActionCard
              title="Inventario Avanzado"
              iconName="inventory-2"
              color="#4CAF50"
              onPress={() => navigation.navigate('InventoryAdvanced' as never)}
            />
            <QuickActionCard
              title="Gestión de Vehículos"
              iconName="local-shipping"
              color="#2196F3"
              onPress={() => navigation.navigate('VehicleManagement' as never)}
            />
            <QuickActionCard
              title="Planificación de Rutas"
              iconName="route"
              color="#9C27B0"
              onPress={() => navigation.navigate('RouteManagement' as never)}
            />
            <QuickActionCard
              title="Calculadora GPS"
              iconName="location-on"
              color="#FF5722"
              onPress={() => navigation.navigate('GPSDistance' as never)}
            />
          </View>
        </View>

        {/* Resumen de Alertas */}
        {stats.lowStockItems > 0 && (
          <View style={styles.section}>
            <View style={styles.alertCard}>
              <Icon name="warning" size={24} color="#FF9800" />
              <View style={styles.alertText}>
                <Text style={styles.alertTitle}>Atención Requerida</Text>
                <Text style={styles.alertDescription}>
                  {stats.lowStockItems} producto(s) con stock bajo. Revisar inventario.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Footer con información adicional */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Última actualización: {new Date().toLocaleDateString('es-CL', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  progressInfo: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  quickActions: {
    paddingHorizontal: 16,
    marginTop: 16,
    paddingBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  // Nuevos estilos para el dashboard mejorado
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  performanceText: {
    marginLeft: 15,
    flex: 1,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  performanceLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertText: {
    marginLeft: 15,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  alertDescription: {
    fontSize: 14,
    color: '#E65100',
    marginTop: 2,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888888',
  },
});

export default DashboardScreen;