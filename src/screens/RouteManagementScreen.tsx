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
import RouteService from '../services/RouteService';
import { Route } from '../types';

const RouteManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    planned: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    totalDistance: 0,
    averageEfficiency: 0,
    completedDeliveries: 0,
  });

  const routeService = RouteService.getInstance();

  const statusFilters = [
    { key: 'all', label: 'Todas', icon: 'route' },
    { key: 'planned', label: 'Planificadas', icon: 'schedule' },
    { key: 'active', label: 'Activas', icon: 'directions' },
    { key: 'completed', label: 'Completadas', icon: 'check-circle' },
    { key: 'cancelled', label: 'Canceladas', icon: 'cancel' },
  ];

  useEffect(() => {
    loadRouteData();
  }, [selectedStatus]);

  const loadRouteData = async () => {
    try {
      setLoading(true);

      // Cargar rutas según estado
      let routeList: Route[];
      if (selectedStatus === 'all') {
        routeList = await routeService.getAllRoutes();
      } else {
        routeList = await routeService.getRoutesByStatus(selectedStatus);
      }

      // Cargar estadísticas
      const routeStats = await routeService.getRouteStats();

      setRoutes(routeList);
      setStats(routeStats);
    } catch (error) {
      console.error('Error al cargar rutas:', error);
      Alert.alert('Error', 'No se pudieron cargar las rutas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRouteData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return '#FF9800';
      case 'active': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return 'Planificada';
      case 'active': return 'Activa';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocida';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return 'schedule';
      case 'active': return 'directions';
      case 'completed': return 'check-circle';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleGenerateSampleData = async () => {
    Alert.alert(
      'Generar Datos de Prueba',
      '¿Deseas generar datos de prueba para las rutas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar',
          onPress: async () => {
            try {
              await routeService.generateSampleData();
              await loadRouteData();
              Alert.alert('Éxito', 'Datos de prueba generados correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron generar los datos de prueba');
            }
          },
        },
      ]
    );
  };

  const handleStartRoute = (route: Route) => {
    Alert.alert(
      'Iniciar Ruta',
      `¿Deseas iniciar la ruta "${route.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar',
          onPress: async () => {
            try {
              await routeService.startRoute(route.id);
              await loadRouteData();
              Alert.alert('Éxito', 'Ruta iniciada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo iniciar la ruta');
            }
          },
        },
      ]
    );
  };

  const handleCancelRoute = (route: Route) => {
    Alert.alert(
      'Cancelar Ruta',
      `¿Deseas cancelar la ruta "${route.name}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await routeService.cancelRoute(route.id);
              await loadRouteData();
              Alert.alert('Ruta Cancelada', 'La ruta ha sido cancelada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la ruta');
            }
          },
        },
      ]
    );
  };

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Icon name="route" size={24} color="#2196F3" />
        <Text style={styles.statNumber}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total Rutas</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="directions" size={24} color="#2196F3" />
        <Text style={styles.statNumber}>{stats.active}</Text>
        <Text style={styles.statLabel}>Activas</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="local-shipping" size={24} color="#4CAF50" />
        <Text style={styles.statNumber}>{stats.completedDeliveries}</Text>
        <Text style={styles.statLabel}>Entregas</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="trending-up" size={24} color="#FF9800" />
        <Text style={styles.statNumber}>{stats.averageEfficiency}%</Text>
        <Text style={styles.statLabel}>Eficiencia</Text>
      </View>
    </View>
  );

  const renderStatusFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
    >
      {statusFilters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            selectedStatus === filter.key && styles.filterButtonActive
          ]}
          onPress={() => setSelectedStatus(filter.key)}
        >
          <Icon 
            name={filter.icon} 
            size={20} 
            color={selectedStatus === filter.key ? '#FFFFFF' : '#666666'} 
          />
          <Text style={[
            styles.filterText,
            selectedStatus === filter.key && styles.filterTextActive
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderRouteCard = ({ item }: { item: Route }) => (
    <View style={styles.routeCard}>
      <View style={styles.routeHeader}>
        <View style={styles.routeInfo}>
          <Icon 
            name={getStatusIcon(item.status)} 
            size={24} 
            color={getStatusColor(item.status)} 
            style={styles.routeIcon}
          />
          <View style={styles.routeDetails}>
            <Text style={styles.routeName}>{item.name}</Text>
            <Text style={styles.routeDate}>
              Inicio: {formatDate(item.startDate)}
            </Text>
            {item.endDate && (
              <Text style={styles.routeDate}>
                Fin: {formatDate(item.endDate)}
              </Text>
            )}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.routeStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.totalDistance} km</Text>
          <Text style={styles.statLabel}>Distancia</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDuration(item.estimatedDuration)}</Text>
          <Text style={styles.statLabel}>Duración Est.</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.waypoints.length}</Text>
          <Text style={styles.statLabel}>Paradas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {item.deliveredItems}/{item.totalItems}
          </Text>
          <Text style={styles.statLabel}>Entregas</Text>
        </View>
      </View>

      <View style={styles.waypointsContainer}>
        <Text style={styles.waypointsTitle}>📍 Paradas:</Text>
        {item.waypoints.slice(0, 3).map((waypoint, index) => (
          <View key={waypoint.id} style={styles.waypointItem}>
            <Icon 
              name={waypoint.status === 'completed' ? 'check-circle' : 'radio-button-unchecked'} 
              size={16} 
              color={waypoint.status === 'completed' ? '#4CAF50' : '#CCCCCC'} 
            />
            <Text style={styles.waypointText} numberOfLines={1}>
              {index + 1}. {waypoint.address}
            </Text>
          </View>
        ))}
        {item.waypoints.length > 3 && (
          <Text style={styles.moreWaypointsText}>
            +{item.waypoints.length - 3} paradas más
          </Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        {item.status === 'planned' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => handleStartRoute(item)}
          >
            <Icon name="play-arrow" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonTextWhite}>Iniciar</Text>
          </TouchableOpacity>
        )}

        {(item.status === 'planned' || item.status === 'active') && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#F44336' }]}
            onPress={() => handleCancelRoute(item)}
          >
            <Icon name="cancel" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonTextWhite}>Cancelar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
          onPress={() => {
            Alert.alert(
              'Detalles de Ruta',
              `Ruta: ${item.name}\nEstado: ${getStatusText(item.status)}\nVehículo ID: ${item.vehicleId}\nConductor ID: ${item.driverId}\nWaypoints: ${item.waypoints.length}\nDistancia: ${item.totalDistance} km`
            );
          }}
        >
          <Icon name="info" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonTextWhite}>Detalles</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.title}>Gestión de Rutas</Text>
        <TouchableOpacity onPress={handleGenerateSampleData}>
          <Icon name="add-circle" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        renderItem={renderRouteCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View>
            {renderStatsCard()}
            {renderStatusFilter()}
            <Text style={styles.sectionTitle}>🗺️ Rutas de Entrega</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="route" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No hay rutas en esta categoría</Text>
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
    marginHorizontal: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 20,
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
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
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
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  routeCard: {
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
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeIcon: {
    marginRight: 15,
  },
  routeDetails: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  routeDate: {
    fontSize: 12,
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
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
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
  waypointsContainer: {
    marginBottom: 15,
  },
  waypointsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  waypointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  waypointText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
  moreWaypointsText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  actionButtonTextWhite: {
    marginLeft: 5,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
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

export default RouteManagementScreen;