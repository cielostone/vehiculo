/**
 * Firebase Service - Configuración de autenticación y base de datos
 * Implementación de Firebase Auth y RealTime Database
 */

import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  userId: string;
}

export interface UserSession {
  uid: string;
  email: string;
  loginTime: number;
  lastActivity: number;
}

class FirebaseService {
  private static instance: FirebaseService;
  private currentUser: FirebaseUser | null = null;

  private constructor() {
    // Escuchar cambios de autenticación
    auth().onAuthStateChanged((user) => {
      if (user) {
        this.currentUser = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
          emailVerified: user.emailVerified,
        };
        this.updateUserSession();
      } else {
        this.currentUser = null;
        this.clearUserSession();
      }
    });
  }

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // === AUTENTICACIÓN ===

  /**
   * Registrar nuevo usuario con email y contraseña
   */
  async registerUser(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (!user) {
        throw new Error('Error al crear usuario');
      }

      // Enviar email de verificación
      await user.sendEmailVerification();

      const firebaseUser: FirebaseUser = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
        emailVerified: user.emailVerified,
      };

      // Crear perfil inicial en la base de datos
      await this.createUserProfile(firebaseUser);

      console.log('Usuario registrado exitosamente:', firebaseUser.email);
      return firebaseUser;
    } catch (error: any) {
      console.error('Error en registro:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  async signInUser(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (!user) {
        throw new Error('Error en autenticación');
      }

      const firebaseUser: FirebaseUser = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
        emailVerified: user.emailVerified,
      };

      console.log('Usuario logueado exitosamente:', firebaseUser.email);
      return firebaseUser;
    } catch (error: any) {
      console.error('Error en login:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Cerrar sesión
   */
  async signOut(): Promise<void> {
    try {
      await auth().signOut();
      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): FirebaseUser | null {
    return this.currentUser;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // === BASE DE DATOS ===

  /**
   * Crear perfil de usuario en la base de datos
   */
  private async createUserProfile(user: FirebaseUser): Promise<void> {
    try {
      const userRef = database().ref(`users/${user.uid}`);
      await userRef.set({
        email: user.email,
        displayName: user.displayName || 'Usuario',
        emailVerified: user.emailVerified,
        createdAt: database.ServerValue.TIMESTAMP,
        lastLogin: database.ServerValue.TIMESTAMP,
        isActive: true,
      });
      
      console.log('Perfil de usuario creado en la base de datos');
    } catch (error) {
      console.error('Error al crear perfil de usuario:', error);
    }
  }

  /**
   * Actualizar información de sesión del usuario
   */
  private async updateUserSession(): Promise<void> {
    if (!this.currentUser) return;

    try {
      const userRef = database().ref(`users/${this.currentUser.uid}`);
      await userRef.update({
        lastLogin: database.ServerValue.TIMESTAMP,
        isActive: true,
        lastActivity: database.ServerValue.TIMESTAMP,
      });

      // Guardar sesión localmente
      const session: UserSession = {
        uid: this.currentUser.uid,
        email: this.currentUser.email,
        loginTime: Date.now(),
        lastActivity: Date.now(),
      };

      await AsyncStorage.setItem('@user_session', JSON.stringify(session));
    } catch (error) {
      console.error('Error al actualizar sesión:', error);
    }
  }

  /**
   * Limpiar sesión local
   */
  private async clearUserSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@user_session');
    } catch (error) {
      console.error('Error al limpiar sesión:', error);
    }
  }

  /**
   * Guardar ubicación GPS en RealTime Database
   */
  async saveLocationToDatabase(location: Omit<LocationData, 'userId'>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const locationRef = database().ref(`locations/${this.currentUser.uid}`);
      const locationData: LocationData = {
        ...location,
        userId: this.currentUser.uid,
        timestamp: Date.now(),
      };

      // Guardar ubicación actual
      await locationRef.child('current').set(locationData);

      // Agregar al historial de ubicaciones
      await locationRef.child('history').push(locationData);

      console.log('Ubicación guardada exitosamente:', locationData);
    } catch (error) {
      console.error('Error al guardar ubicación:', error);
      throw error;
    }
  }

  /**
   * Obtener ubicación actual del usuario
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    if (!this.currentUser) return null;

    try {
      const locationRef = database().ref(`locations/${this.currentUser.uid}/current`);
      const snapshot = await locationRef.once('value');
      return snapshot.val();
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      return null;
    }
  }

  /**
   * Obtener historial de ubicaciones del usuario
   */
  async getLocationHistory(limit: number = 10): Promise<LocationData[]> {
    if (!this.currentUser) return [];

    try {
      const historyRef = database()
        .ref(`locations/${this.currentUser.uid}/history`)
        .orderByChild('timestamp')
        .limitToLast(limit);

      const snapshot = await historyRef.once('value');
      const locations: LocationData[] = [];

      snapshot.forEach((childSnapshot) => {
        locations.push(childSnapshot.val());
        return undefined;
      });

      return locations.reverse(); // Más recientes primero
    } catch (error) {
      console.error('Error al obtener historial:', error);
      return [];
    }
  }

  /**
   * Escuchar cambios en ubicaciones en tiempo real
   */
  listenToLocationUpdates(callback: (location: LocationData) => void): () => void {
    if (!this.currentUser) {
      return () => {};
    }

    const locationRef = database().ref(`locations/${this.currentUser.uid}/current`);
    
    const listener = locationRef.on('value', (snapshot) => {
      const location = snapshot.val();
      if (location) {
        callback(location);
      }
    });

    // Devolver función para cancelar la escucha
    return () => locationRef.off('value', listener);
  }

  // === UTILIDADES ===

  /**
   * Convertir códigos de error de Firebase a mensajes amigables
   */
  private getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este email ya está registrado';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres';
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Inténtalo más tarde';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu internet';
      default:
        return `Error de autenticación: ${errorCode}`;
    }
  }

  /**
   * Validar formato de email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar fortaleza de contraseña
   */
  static isValidPassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    if (!/(?=.*[a-zA-Z])/.test(password)) {
      return { isValid: false, message: 'La contraseña debe contener al menos una letra' };
    }
    return { isValid: true, message: 'Contraseña válida' };
  }
}

export default FirebaseService;