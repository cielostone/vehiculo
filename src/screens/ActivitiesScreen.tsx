import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

interface ActivitiesScreenProps {
  navigation: any;
}

const ActivitiesScreen: React.FC<ActivitiesScreenProps> = ({ navigation }) => {
  const activities = [
    {
      id: 'activity_07',
      title: 'Actividad 7 - Gestión Avanzada',
      description: 'Gestión de inventario, vehículos y rutas avanzadas',
      status: 'completed',
      screens: ['InventoryAdvanced', 'VehicleManagement', 'RouteManagement']
    },
    {
      id: 'activity_08',
      title: 'Actividad 8 - Monitoreo de Temperatura',
      description: 'Sistema de monitoreo de temperatura con microcontroladores, alertas y conversión F/C',
      status: 'available',
      screens: ['TemperatureMonitor']
    }
  ];

  const navigateToActivity = (activityId: string, screens: string[]) => {
    if (activityId === 'activity_08') {
      navigation.navigate('TemperatureMonitor');
    } else if (activityId === 'activity_07') {
      navigation.navigate('InventoryAdvanced');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'available': return '#2196F3';
      case 'locked': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'available': return 'play-circle';
      case 'locked': return 'lock';
      default: return 'help-circle';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Actividades del Taller</Text>
        <Text style={styles.subtitle}>Selecciona una actividad para continuar</Text>
      </View>

      {activities.map((activity) => (
        <Card key={activity.id} style={styles.activityCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title style={styles.activityTitle}>{activity.title}</Title>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activity.status) }]}>
                <Text style={styles.statusText}>
                  {activity.status === 'completed' ? 'Completada' : 
                   activity.status === 'available' ? 'Disponible' : 'Bloqueada'}
                </Text>
              </View>
            </View>
            
            <Paragraph style={styles.activityDescription}>
              {activity.description}
            </Paragraph>

            {activity.id === 'activity_08' && (
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Características principales:</Text>
                <Text style={styles.feature}>• 🌡️ Monitoreo en tiempo real desde microcontroladores</Text>
                <Text style={styles.feature}>• 🔄 Conversión automática Fahrenheit ↔ Celsius</Text>
                <Text style={styles.feature}>• 🔔 Alertas configurables con sonido y vibración</Text>
                <Text style={styles.feature}>• 📊 Gráficos de historial de temperatura</Text>
                <Text style={styles.feature}>• ⚙️ Rangos personalizables de temperatura</Text>
                <Text style={styles.feature}>• 💾 Almacenamiento local y Firebase</Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={() => navigateToActivity(activity.id, activity.screens)}
              disabled={activity.status === 'locked'}
              icon={getStatusIcon(activity.status)}
              style={[styles.activityButton, { backgroundColor: getStatusColor(activity.status) }]}
            >
              {activity.status === 'completed' ? 'Revisar' : 
               activity.status === 'available' ? 'Comenzar' : 'Bloqueada'}
            </Button>
          </Card.Content>
        </Card>
      ))}

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title>Información</Title>
          <Paragraph>
            Las actividades están diseñadas para enseñar conceptos de logística 
            mediante ejercicios prácticos con React Native.
          </Paragraph>
          <Paragraph style={styles.note}>
            💡 La Actividad 8 implementa un sistema completo de monitoreo de temperatura 
            que simula microcontroladores y gestiona alertas en tiempo real.
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  activityCard: {
    margin: 16,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityTitle: {
    flex: 1,
    fontSize: 18,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  featuresContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  feature: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  activityButton: {
    marginTop: 8,
  },
  infoCard: {
    margin: 16,
    marginBottom: 32,
  },
  note: {
    marginTop: 12,
    fontStyle: 'italic',
    fontSize: 13,
    color: '#555',
  },
});

export default ActivitiesScreen;