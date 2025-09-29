import firebase from '@react-native-firebase/app';

// Configuración Firebase para desarrollo
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForDevelopment123456789",
  authDomain: "taller-logistica-mock.firebaseapp.com",
  databaseURL: "https://taller-logistica-default-rtdb.firebaseio.com",
  projectId: "taller-logistica-mock",
  storageBucket: "taller-logistica-mock.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:android:abcdef123456789"
};

/**
 * Inicializar Firebase App
 * Para desarrollo usamos configuración mock
 */
export const initializeFirebaseApp = () => {
  try {
    // En React Native Firebase, la configuración se lee automáticamente
    // desde google-services.json
    console.log('🔥 Inicializando Firebase para el Taller de Logística...');
    
    // Verificar que Firebase esté disponible
    if (firebase.apps.length === 0) {
      console.log('⚠️ No hay apps Firebase inicializadas');
    } else {
      console.log('✅ Firebase configurado correctamente');
      console.log('📱 Apps Firebase disponibles:', firebase.apps.length);
    }
    
    return firebase.app();
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    throw new Error('Error al inicializar Firebase: ' + error);
  }
};

export default firebaseConfig;