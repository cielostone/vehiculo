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
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import VehicleService from '../services/VehicleService';
import { Vehicle } from '../types';

const VehicleManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [newFuelLevel, setNewFuelLevel] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    inUse: 0,
    maintenance: 0,
    outOfService: 0,
    averageFuelLevel: 0,
    needingMaintenance: 0,
  });

  const vehicleService = VehicleService.getInstance();

  const statusFilters = [
    { key: 'all', label: 'Todos', icon: 'local-shipping' },
    { key: 'available', label: 'Disponibles', icon: 'check-circle' },
    { key: 'in_use', label: 'En Uso', icon: 'directions' },
    { key: 'maintenance', label: 'Mantenimiento', icon: 'build' },
    { key: 'out_of_service', label: 'Fuera de Servicio', icon: 'error' },
  ];

  useEffect(() => {
    loadVehicleData();
  }, [selectedStatus]);

  const loadVehicleData = async () => {
    try {
      setLoading(true);

      // Cargar vehículos según estado
      let vehicleList: Vehicle[];
      if (selectedStatus === 'all') {
        vehicleList = await vehicleService.getAllVehicles();
      } else {
        vehicleList = await vehicleService.getVehiclesByStatus(selectedStatus);
      }

      // Cargar estadísticas
      const vehicleStats = await vehicleService.getVehicleStats();

      setVehicles(vehicleList);
      setStats(vehicleStats);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      Alert.alert('Error', 'No se pudieron cargar los vehículos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVehicleData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'in_use': return '#2196F3';
      case 'maintenance': return '#FF9800';
      case 'out_of_service': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'in_use': return 'En Uso';
      case 'maintenance': return 'Mantenimiento';
      case 'out_of_service': return 'Fuera de Servicio';
      default: return 'Desconocido';
    }
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'truck': return 'local-shipping';
      case 'van': return 'airport-shuttle';
      case 'refrigerated': return 'ac-unit';
      case 'motorcycle': return 'two-wheeler';
      default: return 'directions-car';
    }
  };

  const getVehicleTypeName = (type: string) => {
    switch (type) {
      case 'truck': return 'Camión';
      case 'van': return 'Furgón';
      case 'refrigerated': return 'Refrigerado';
      case 'motorcycle': return 'Motocicleta';
      default: return 'Vehículo';
    }
  };

  const getFuelLevelColor = (level: number) => {
    if (level > 50) return '#4CAF50';
    if (level > 20) return '#FF9800';
    return '#F44336';
  };

  const handleGenerateSampleData = async () => {
    Alert.alert(
      'Generar Datos de Prueba',
      '¿Deseas generar datos de prueba para los vehículos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar',
          onPress: async () => {
            try {
              await vehicleService.generateSampleData();
              await loadVehicleData();
              Alert.alert('Éxito', 'Datos de prueba generados correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron generar los datos de prueba');
            }
          },
        },
      ]
    );
  };

  const handleUpdateFuelLevel = async () => {
    if (!selectedVehicle || !newFuelLevel) return;

    try {
      const fuelLevel = parseInt(newFuelLevel);
      if (fuelLevel < 0 || fuelLevel > 100) {
        Alert.alert('Error', 'El nivel de combustible debe estar entre 0 y 100');
        return;
      }

      await vehicleService.updateFuelLevel(selectedVehicle.id, fuelLevel);
      await loadVehicleData();
      setModalVisible(false);
      setSelectedVehicle(null);
      setNewFuelLevel('');
      Alert.alert('Éxito', 'Nivel de combustible actualizado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el nivel de combustible');
    }
  };

  const handleUpdateStatus = (vehicle: Vehicle, newStatus: string) => {
    Alert.alert(
      'Cambiar Estado',
      `¿Deseas cambiar el estado de ${vehicle.name} a "${getStatusText(newStatus)}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await vehicleService.updateVehicleStatus(vehicle.id, newStatus as any);
              await loadVehicleData();
              Alert.alert('Éxito', 'Estado actualizado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo actualizar el estado');
            }
          },
        },
      ]
    );
  };

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Icon name="local-shipping" size={24} color="#2196F3" />
        <Text style={styles.statNumber}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="check-circle" size={24} color="#4CAF50" />
        <Text style={styles.statNumber}>{stats.available}</Text>
        <Text style={styles.statLabel}>Disponibles</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="directions" size={24} color="#2196F3" />
        <Text style={styles.statNumber}>{stats.inUse}</Text>
        <Text style={styles.statLabel}>En Uso</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="local-gas-station" size={24} color="#FF9800" />
        <Text style={styles.statNumber}>{stats.averageFuelLevel}%</Text>
        <Text style={styles.statLabel}>Combustible</Text>
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

  const renderVehicleCard = ({ item }: { item: Vehicle }) => (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleInfo}>
          <Icon 
            name={getVehicleTypeIcon(item.type)} 
            size={28} 
            color="#2196F3" 
            style={styles.vehicleIcon}
          />
          <View style={styles.vehicleDetails}>
            <Text style={styles.vehicleName}>{item.name}</Text>
            <Text style={styles.vehiclePlate}>{item.plateNumber}</Text>
            <Text style={styles.vehicleType}>{getVehicleTypeName(item.type)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.vehicleStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.capacity} kg</Text>
          <Text style={styles.statLabel}>Capacidad</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getFuelLevelColor(item.fuelLevel) }]}>
            {item.fuelLevel}%
          </Text>
          <Text style={styles.statLabel}>Combustible</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.mileage.toLocaleString()} km</Text>
          <Text style={styles.statLabel}>Kilometraje</Text>
        </View>
        {item.type === 'refrigerated' && item.refrigerationTemp && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.refrigerationTemp}°C</Text>
            <Text style={styles.statLabel}>Temp. Refrigeración</Text>
          </View>
        )}
      </View>

      {item.driver && (
        <View style={styles.driverInfo}>
          <Icon name="person" size={16} color="#666666" />
          <Text style={styles.driverText}>Conductor: {item.driver}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            setSelectedVehicle(item);
            setNewFuelLevel(item.fuelLevel.toString());
            setModalVisible(true);
          }}
        >
          <Icon name="local-gas-station" size={16} color="#2196F3" />
          <Text style={styles.actionButtonText}>Combustible</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Cambiar Estado',
              'Selecciona el nuevo estado:',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Disponible', onPress: () => handleUpdateStatus(item, 'available') },
                { text: 'En Uso', onPress: () => handleUpdateStatus(item, 'in_use') },
                { text: 'Mantenimiento', onPress: () => handleUpdateStatus(item, 'maintenance') },
                { text: 'Fuera de Servicio', onPress: () => handleUpdateStatus(item, 'out_of_service') },
              ]
            );
          }}
        >
          <Icon name="edit" size={16} color="#FF9800" />
          <Text style={styles.actionButtonText}>Estado</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            Alert.alert('Ubicación', `${item.location.address}\nLat: ${item.location.latitude}\nLng: ${item.location.longitude}`);
          }}
        >
          <Icon name="location-on" size={16} color="#4CAF50" />
          <Text style={styles.actionButtonText}>Ubicación</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFuelModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Actualizar Combustible</Text>
          <Text style={styles.modalSubtitle}>
            {selectedVehicle?.name} - {selectedVehicle?.plateNumber}
          </Text>
          
          <TextInput
            style={styles.fuelInput}
            value={newFuelLevel}
            onChangeText={setNewFuelLevel}
            placeholder="Nivel de combustible (0-100)"
            keyboardType="numeric"
            maxLength={3}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setModalVisible(false);
                setSelectedVehicle(null);
                setNewFuelLevel('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleUpdateFuelLevel}
            >
              <Text style={styles.confirmButtonText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.title}>Gestión de Vehículos</Text>
        <TouchableOpacity onPress={handleGenerateSampleData}>
          <Icon name="add-circle" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicleCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View>
            {renderStatsCard()}
            {renderStatusFilter()}
            <Text style={styles.sectionTitle}>🚛 Flota de Vehículos</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="local-shipping" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No hay vehículos en esta categoría</Text>
            <TouchableOpacity style={styles.generateButton} onPress={handleGenerateSampleData}>
              <Text style={styles.generateButtonText}>Generar Datos de Prueba</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.content}
      />

      {renderFuelModal()}
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
  vehicleCard: {
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
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIcon: {
    marginRight: 15,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
    marginTop: 2,
  },
  vehicleType: {
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
  vehicleStats: {
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
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  driverText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666666',
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
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  actionButtonText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#333333',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  fuelInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#666666',
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    marginLeft: 10,
  },
  confirmButtonText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default VehicleManagementScreen;