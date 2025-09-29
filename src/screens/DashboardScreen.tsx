import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppSelector } from '../store/hooks';
import { DashboardStats } from '../types';

const DashboardScreen = () => {
  const { items } = useAppSelector((state) => state.inventory);
  const { shipments } = useAppSelector((state) => state.shipments);
  const { activities } = useAppSelector((state) => state.activities);
  const { currentUser } = useAppSelector((state) => state.user);

  // Calcular estadísticas
  const stats: DashboardStats = {
    totalInventoryItems: items.length,
    lowStockItems: items.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length,
    activeShipments: shipments.filter(s => s.status === 'in_transit' || s.status === 'pending').length,
    completedActivities: activities.filter(a => a.completed).length,
    pendingActivities: activities.filter(a => !a.completed).length,
  };

  const StatCard = ({ 
    title, 
    value, 
    iconName, 
    color, 
    onPress 
  }: { 
    title: string; 
    value: number; 
    iconName: string; 
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statContent}>
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Icon name={iconName} size={32} color={color} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          ¡Bienvenido, {currentUser?.name || 'Usuario'}!
        </Text>
        <Text style={styles.subtitle}>
          Panel de Control - Taller de Logística
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Inventario"
          value={stats.totalInventoryItems}
          iconName="inventory"
          color="#4CAF50"
        />
        <StatCard
          title="Stock Bajo"
          value={stats.lowStockItems}
          iconName="warning"
          color="#FF9800"
        />
        <StatCard
          title="Envíos Activos"
          value={stats.activeShipments}
          iconName="local-shipping"
          color="#2196F3"
        />
        <StatCard
          title="Actividades Completadas"
          value={stats.completedActivities}
          iconName="check-circle"
          color="#9C27B0"
        />
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Tu Progreso</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Icon name="school" size={24} color="#2196F3" />
            <Text style={styles.progressTitle}>Progreso del Taller</Text>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              Actividades completadas: {currentUser?.progress.activitiesCompleted || 0} de {currentUser?.progress.totalActivities || 0}
            </Text>
            <Text style={styles.progressText}>
              Promedio: {currentUser?.progress.averageScore || 0}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${((currentUser?.progress.activitiesCompleted || 0) / (currentUser?.progress.totalActivities || 1)) * 100}%` 
                }
              ]} 
            />
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="add" size={24} color="#2196F3" />
            <Text style={styles.actionText}>Agregar Inventario</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="search" size={24} color="#2196F3" />
            <Text style={styles.actionText}>Rastrear Envío</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="play-arrow" size={24} color="#2196F3" />
            <Text style={styles.actionText}>Iniciar Actividad</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="analytics" size={24} color="#2196F3" />
            <Text style={styles.actionText}>Ver Reportes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
});

export default DashboardScreen;