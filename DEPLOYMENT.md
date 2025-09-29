# 📋 Guía de Configuración y Deployment

## 🔧 Configuración Detallada del Proyecto

### Firebase Configuration
El proyecto utiliza Firebase con las siguientes configuraciones:

#### Proyecto Firebase: `aiep-project`
- **Project ID**: `aiep-project`
- **Database URL**: `https://aiep-project-default-rtdb.firebaseio.com/`
- **Authentication**: Email/Password habilitado
- **Database**: Realtime Database configurado

#### Archivos de Configuración
```
android/app/google-services.json     ✅ Configurado
firebase.json                       ✅ Configurado  
database.rules.json                 ✅ Desplegado
```

### Android Configuration
```
compileSdkVersion: 36
targetSdkVersion: 36
minSdkVersion: 24
buildToolsVersion: "34.0.0"
```

### Dependencias Principales
```json
{
  "react-native": "0.81.4",
  "react": "18.2.0",
  "@react-native-firebase/app": "^23.4.0",
  "@react-native-firebase/auth": "^23.4.0",
  "@react-native-firebase/database": "^23.4.0",
  "react-native-geolocation-service": "^5.3.1",
  "react-native-vector-icons": "^10.0.3",
  "@reduxjs/toolkit": "^1.9.7",
  "react-redux": "^8.1.3"
}
```

## 🚀 Proceso de Deployment

### 1. Preparación del Entorno
```bash
# Verificar versiones
node --version          # >= 16.0.0
npm --version           # >= 8.0.0  
java -version          # JDK 11+

# Variables de entorno requeridas
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 2. Build para Producción
```bash
# Limpiar builds anteriores
cd android && ./gradlew clean

# Generar APK de release
cd android && ./gradlew assembleRelease

# Generar Bundle AAB (para Google Play)
cd android && ./gradlew bundleRelease
```

### 3. Testing en Dispositivos
```bash
# Instalar en dispositivo conectado
adb install android/app/build/outputs/apk/release/app-release.apk

# Verificar funcionamiento
adb logcat | grep "TallerLogistica"
```

## 🔒 Seguridad y Configuración

### Firebase Security Rules (Ya desplegadas)
```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "locations": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "coldChainIncidents": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

### Permisos Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

## 📊 Estructura de Datos Firebase

### Usuarios
```json
{
  "users": {
    "USER_ID": {
      "email": "usuario@email.com",
      "displayName": "Nombre Usuario", 
      "createdAt": "2024-09-29T...",
      "lastLogin": "2024-09-29T..."
    }
  }
}
```

### Ubicaciones GPS
```json
{
  "locations": {
    "USER_ID": {
      "LOCATION_ID": {
        "latitude": -33.40863,
        "longitude": -71.696854,
        "timestamp": 1695984000000,
        "accuracy": 10,
        "address": "El Quisco, Región de Valparaíso"
      }
    }
  }
}
```

### Incidentes de Cadena de Frío
```json
{
  "coldChainIncidents": {
    "USER_ID": {
      "INCIDENT_ID": {
        "temperature": -14.5,
        "timestamp": 1695984000000,
        "severity": "CRITICAL",
        "location": {
          "latitude": -33.40863,
          "longitude": -71.696854
        },
        "productType": "carnes_mariscos",
        "resolved": false
      }
    }
  }
}
```

## ⚡ Performance y Optimización

### Metro Bundle Size
```bash
# Analizar bundle size
npx react-native-bundle-visualizer

# Optimizar imágenes
npm install react-native-image-resizer
```

### Memory Management
```typescript
// En servicios, limpiar listeners
useEffect(() => {
  return () => {
    // Limpiar listeners de Firebase
    // Cancelar timers activos
  };
}, []);
```

## 🛠️ Troubleshooting Avanzado

### Errores Comunes

#### 1. Firebase Connection Issues
```bash
# Verificar google-services.json
cat android/app/google-services.json | grep project_id

# Limpiar cache de Firebase
cd android && ./gradlew clean
rm -rf node_modules && npm install
```

#### 2. GPS/Location Issues
```bash
# Verificar permisos en emulador
adb shell settings put secure location_providers_allowed +gps
adb shell settings put secure location_providers_allowed +network

# Configurar ubicación específica
adb emu geo fix -71.696854 -33.40863
```

#### 3. Build Failures
```bash
# Limpiar completamente
cd android && ./gradlew clean
cd .. && rm -rf node_modules
npm install
npx react-native run-android
```

### Logs y Debugging
```bash
# React Native logs
npx react-native log-android

# Flipper debugging (si está instalado)
npx react-native run-android --variant=debug

# ADB logs específicos
adb logcat | grep -E "(ReactNative|Firebase|GPS)"
```

## 📈 Monitoreo y Analytics

### Firebase Analytics (Opcional)
```bash
# Instalar Firebase Analytics
npm install @react-native-firebase/analytics

# Configurar eventos personalizados
analytics().logEvent('cold_chain_alert', {
  temperature: -14.5,
  location: 'El Quisco'
});
```

### Crashlytics (Recomendado)
```bash
# Instalar Crashlytics
npm install @react-native-firebase/crashlytics

# Auto-reporte de crashes
crashlytics().log('App iniciada correctamente');
```

---

**Última actualización:** Septiembre 2024  
**Mantenido por:** Equipo de Desarrollo AIEP