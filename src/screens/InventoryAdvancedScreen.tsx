import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import InventoryService from '../services/InventoryService';
import { InventoryItem, InventoryAlert } from '../types';

const InventoryAdvancedScreen: React.FC = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    expiring: 0,
    expired: 0,
  });

  const inventoryService = InventoryService.getInstance();

  const categories = [
    { key: 'all', label: 'Todos', icon: 'inventory' },
    { key: 'carnes', label: 'Carnes', icon: 'restaurant' },
    { key: 'mariscos', label: 'Mariscos', icon: 'waves' },
    { key: 'verduras', label: 'Verduras', icon: 'eco' },
    { key: 'lacteos', label: 'Lácteos', icon: 'local-drink' },
    { key: 'otros', label: 'Otros', icon: 'category' },
  ];

  useEffect(() => {
    loadInventoryData();
  }, [selectedCategory]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      
      // Cargar items según categoría
      let inventoryItems: InventoryItem[];
      if (selectedCategory === 'all') {
        inventoryItems = await inventoryService.getAllItems();
      } else {
        inventoryItems = await inventoryService.getItemsByCategory(selectedCategory);
      }

      // Cargar alertas
      const inventoryAlerts = await inventoryService.getActiveAlerts();

      // Calcular estadísticas
      const allItems = await inventoryService.getAllItems();
      const lowStockItems = await inventoryService.getLowStockItems();
      const expiringItems = await inventoryService.getExpiringItems();
      const expiredItems = allItems.filter(item => item.status === 'expired');

      setItems(inventoryItems);
      setAlerts(inventoryAlerts);
      setStats({
        total: allItems.length,
        lowStock: lowStockItems.length,
        expiring: expiringItems.length,
        expired: expiredItems.length,
      });
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      Alert.alert('Error', 'No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInventoryData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'low_stock': return '#FF9800';
      case 'out_of_stock': return '#F44336';
      case 'expired': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'low_stock': return 'Stock Bajo';
      case 'out_of_stock': return 'Sin Stock';
      case 'expired': return 'Vencido';
      default: return 'Desconocido';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.key === category);
    return cat?.icon || 'category';
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-CL');
  };

  const handleGenerateSampleData = async () => {
    Alert.alert(
      'Generar Datos de Prueba',
      '¿Deseas generar datos de prueba para el inventario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar',
          onPress: async () => {
            try {
              await inventoryService.generateSampleData();
              await loadInventoryData();
              Alert.alert('Éxito', 'Datos de prueba generados correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron generar los datos de prueba');
            }
          },
        },
      ]
    );
  };

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Icon name="inventory" size={24} color="#2196F3" />
        <Text style={styles.statNumber}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total Items</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="warning" size={24} color="#FF9800" />
        <Text style={styles.statNumber}>{stats.lowStock}</Text>
        <Text style={styles.statLabel}>Stock Bajo</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="schedule" size={24} color="#FF5722" />
        <Text style={styles.statNumber}>{stats.expiring}</Text>
        <Text style={styles.statLabel}>Por Vencer</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="error" size={24} color="#9C27B0" />
        <Text style={styles.statNumber}>{stats.expired}</Text>
        <Text style={styles.statLabel}>Vencidos</Text>
      </View>
    </View>
  );

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.categoryButton,
            selectedCategory === category.key && styles.categoryButtonActive
          ]}
          onPress={() => setSelectedCategory(category.key)}
        >
          <Icon 
            name={category.icon} 
            size={20} 
            color={selectedCategory === category.key ? '#FFFFFF' : '#666666'} 
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.key && styles.categoryTextActive
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity 
      style={styles.itemCard}
      onPress={() => {
        // TODO: Navegar a detalle del item
        Alert.alert('Item', `Detalles de ${item.name}`);
      }}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Icon 
            name={getCategoryIcon(item.category)} 
            size={24} 
            color="#2196F3" 
            style={styles.itemIcon}
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemLocation}>{item.location}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.itemStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.quantity} {item.unit}</Text>
          <Text style={styles.statLabel}>Stock Actual</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.minStock} {item.unit}</Text>
          <Text style={styles.statLabel}>Stock Mínimo</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDate(item.expirationDate)}</Text>
          <Text style={styles.statLabel}>Vencimiento</Text>
        </View>
        {(item.category === 'carnes' || item.category === 'mariscos') && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.temperature}°C</Text>
            <Text style={styles.statLabel}>Temperatura</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderAlertsSection = () => {
    if (alerts.length === 0) return null;

    return (
      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>🚨 Alertas Activas</Text>
        {alerts.slice(0, 3).map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <Icon 
              name={alert.severity === 'critical' ? 'error' : 'warning'} 
              size={20} 
              color={alert.severity === 'critical' ? '#F44336' : '#FF9800'} 
            />
            <Text style={styles.alertText}>{alert.message}</Text>
          </View>
        ))}
        {alerts.length > 3 && (
          <Text style={styles.moreAlertsText}>
            +{alerts.length - 3} alertas más
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.title}>Inventario Avanzado</Text>
        <TouchableOpacity onPress={handleGenerateSampleData}>
          <Icon name="add-circle" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderInventoryItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View>
            {renderStatsCard()}
            {renderAlertsSection()}
            {renderCategoryFilter()}
            <Text style={styles.sectionTitle}>📦 Items de Inventario</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inventory-2" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No hay items en esta categoría</Text>
            <TouchableOpacity style={styles.generateButton} onPress={handleGenerateSampleData}>
              <Text style={styles.generateButtonText}>Generar Datos de Prueba</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  content: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 2,
  },
  alertsSection: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  alertText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  moreAlertsText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#2196F3',
  },
  categoryText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666666',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  itemLocation: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 15,
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default InventoryAdvancedScreen;