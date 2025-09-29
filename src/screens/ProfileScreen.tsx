import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FirebaseUser } from '../services/FirebaseService';

interface ProfileScreenProps {
  user?: FirebaseUser;
  onLogout?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No hay usuario activo</Text>
        <Text style={styles.subtitle}>Inicia sesión para ver tu perfil</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={60} color="#fff" />
        </View>
        <Text style={styles.userName}>
          {user.displayName || user.email?.split('@')[0] || 'Usuario'}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la Cuenta</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Icon name="email" size={20} color="#2196F3" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Correo Electrónico</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Icon name="verified-user" size={20} color="#4caf50" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Estado</Text>
              <Text style={[styles.infoValue, { color: user.emailVerified ? '#4caf50' : '#ff9800' }]}>
                {user.emailVerified ? 'Email verificado' : 'Email pendiente de verificar'}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Icon name="fingerprint" size={20} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>ID de Usuario</Text>
              <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                {user.uid}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Icon name="schedule" size={20} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Estado de sesión</Text>
              <Text style={styles.infoValue}>
                Sesión activa
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuraciones del Taller</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Icon name="business" size={20} color="#2196F3" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Proyecto</Text>
              <Text style={styles.infoValue}>Taller de Logística - AIEP</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Icon name="cloud" size={20} color="#4caf50" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Base de Datos</Text>
              <Text style={styles.infoValue}>Firebase Real-time (Conectado)</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Icon name="location-on" size={20} color="#ff9800" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>GPS Tracking</Text>
              <Text style={styles.infoValue}>Activado</Text>
            </View>
          </View>
        </View>
      </View>

      {onLogout && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Icon name="logout" size={20} color="#fff" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Taller de Logística</Text>
        <Text style={styles.footerSubtext}>React Native con Firebase</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f44336',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileScreen;