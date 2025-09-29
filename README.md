# 📱 Taller de Logística - Aplicación Android

> **Aplicación móvil profesional para gestión logística con monitoreo de cadena de frío y seguimiento GPS**

Una aplicación desarrollada con **React Native** para actividades de taller de logística, implementando funcionalidades críticas para el manejo de productos congelados, cálculo de entregas y seguimiento de ubicación en tiempo real.

---

## 🎯 **Visión General del Proyecto**

Esta aplicación fue diseñada como una solución integral para operaciones logísticas, enfocándose en:
- **Monitoreo crítico de temperatura** para productos congelados (carnes y mariscos)
- **Cálculo preciso de distancias** usando fórmula Haversine
- **Autenticación segura** con Firebase
- **Seguimiento GPS** con ubicación específica en El Quisco, Chile

---

## 🏗️ **Arquitectura de la Aplicación**

### **Stack Tecnológico**
```
Frontend:     React Native 0.81.4 + TypeScript
Backend:      Firebase (Authentication + Realtime Database)
Navegación:   React Navigation 6.x
Estado:       Redux Toolkit
Iconos:       React Native Vector Icons
GPS:          React Native Geolocation Service
```

### **Estructura del Proyecto**
```
src/
├── 📂 components/           # Componentes reutilizables
├── 📂 navigation/          # Configuración de navegación
│   └── AuthNavigator.tsx      # Navegador principal con autenticación
├── 📂 screens/             # Pantallas de la aplicación
│   ├── LoginScreen.tsx        # Autenticación de usuarios
│   ├── RegisterScreen.tsx     # Registro de nuevos usuarios
│   ├── MenuActivity.tsx       # Dashboard principal con GPS
│   ├── DeliveryCalculatorScreen.tsx  # Calculadora con cadena de frío
│   ├── GPSDistanceScreen.tsx  # Pantalla GPS con fórmula Haversine
│   └── ProfileScreen.tsx      # Perfil y datos del usuario
├── 📂 services/            # Lógica de negocio y servicios
│   ├── FirebaseService.ts     # Integración Firebase completa
│   ├── GPSService.ts          # Servicios de ubicación
│   ├── GeolocationService.ts  # Cálculos GPS con Haversine
│   ├── ColdChainService.ts    # Sistema de cadena de frío
│   └── DeliveryService.ts     # Lógica de cálculo de entregas
├── 📂 types/               # Definiciones TypeScript
│   └── index.ts               # Tipos globales de la aplicación
└── 📂 utils/               # Utilidades y helpers
```

---

## ⚡ **Funcionalidades Implementadas**

### 🔐 **1. Sistema de Autenticación**
- **Firebase Authentication** con email/password
- **Registro de usuarios** con validación
- **Sesiones persistentes** y logout seguro
- **Perfil de usuario** con datos personalizados

### 🌡️ **2. Monitoreo de Cadena de Frío**
```typescript
// Configuración crítica para productos congelados
Rango Seguro:     -18°C a -25°C
Temperatura Crítica: > -15°C (activa alarma)
Monitoreo:        Automático cada 30 segundos
Productos:        Carnes y mariscos congelados
```

**Características:**
- ✅ Alertas visuales y sonoras automáticas
- ✅ Registro de incidentes con timestamp
- ✅ Integración con calculadora de entregas
- ✅ Persistencia de datos en Firebase

### 📍 **3. Sistema GPS Avanzado**
```typescript
// Ubicación configurada
Ciudad:           El Quisco, Región de Valparaíso, Chile
Coordenadas:      -33.40863, -71.696854
Almacén:          Santiago, Chile (-33.4489, -70.6693)
Distancia:        ~120 km (calculada con Haversine)
```

**Implementación:**
- ✅ **Fórmula Haversine** para cálculos precisos de distancia
- ✅ **Ubicación fija** para consistencia en emulador
- ✅ **Persistencia** de ubicaciones en Firebase
- ✅ **Actualización automática** en tiempo real

### � **4. Calculadora de Entregas Inteligente**
- **Cálculo de costos** basado en distancia
- **Integración automática** con sistema de cadena de frío
- **Validación de productos** que requieren temperatura controlada
- **Tarifas dinámicas** según tipo de producto

---

## 🔥 **Integración Firebase**

### **Proyecto: `aiep-project`**
```json
{
  "projectId": "aiep-project",
  "databaseURL": "https://aiep-project-default-rtdb.firebaseio.com/",
  "services": ["Authentication", "Realtime Database"]
}
```

### **Estructura de Base de Datos**
```
aiep-project/
├── 👥 users/
│   └── [userId]/
│       ├── email: string
│       ├── displayName: string
│       └── createdAt: timestamp
├── 📍 locations/
│   └── [userId]/
│       └── [locationId]/
│           ├── latitude: number
│           ├── longitude: number
│           ├── timestamp: number
│           └── accuracy: number
└── ❄️ coldChainIncidents/
    └── [userId]/
        └── [incidentId]/
            ├── temperature: number
            ├── timestamp: number
            ├── location: object
            └── severity: string
```

### **Reglas de Seguridad Implementadas**
```json
{
  "rules": {
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

---

## 🚀 **Instrucciones de Instalación**

### **Prerrequisitos**
```bash
✅ Node.js 16+ 
✅ Android Studio
✅ Android SDK API 36
✅ Java JDK 11+
✅ React Native CLI
```

### **1. Configuración del Entorno**
```bash
# Verificar Node.js
node --version  # >= 16.0.0

# Instalar React Native CLI globalmente
npm install -g react-native-cli

# Configurar variables de entorno Android
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### **2. Instalación del Proyecto**
```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd taller-app

# Instalar dependencias
npm install

# Verificar conexión con emulador
adb devices
```

### **3. Configuración Firebase** ✅
> **Nota:** Firebase ya está configurado y funcional
- ✅ Archivo `google-services.json` incluido
- ✅ Proyecto `aiep-project` configurado
- ✅ Reglas de seguridad desplegadas

### **4. Ejecutar la Aplicación**
```bash
# Método 1: React Native CLI
npx react-native run-android

# Método 2: Usar script npm
npm run android

# Para limpiar caché si hay problemas
npx react-native start --reset-cache
```

---

## 🧪 **Testing y Validación**

### **Usuarios de Prueba**
```
📧 Email:    test@test.com
🔑 Password: 123456
```

### **Escenarios de Prueba**
1. **🔐 Autenticación**
   - Registro de usuario nuevo
   - Login con credenciales existentes
   - Cierre de sesión

2. **📍 GPS y Ubicación**
   - Verificar ubicación "El Quisco"
   - Cálculo de distancia a Santiago
   - Persistencia de datos GPS

3. **🌡️ Cadena de Frío**
   - Simular temperaturas críticas (-14°C)
   - Verificar alertas automáticas
   - Registro de incidentes

4. **💰 Calculadora de Entregas**
   - Productos sin cadena de frío
   - Productos con cadena de frío
   - Cálculo de costos por distancia

---

## 🛠️ **Comandos de Desarrollo**

### **Desarrollo Diario**
```bash
# Ejecutar en desarrollo
npm run android

# Ver logs de la aplicación
npx react-native log-android

# Limpiar build
cd android && ./gradlew clean
```

### **Debugging GPS**
```bash
# Configurar ubicación en emulador
adb emu geo fix -71.696854 -33.40863

# Verificar dispositivos conectados
adb devices

# Reiniciar ADB si hay problemas
adb kill-server && adb start-server
```

### **Troubleshooting**
```bash
# Error de compilación
cd android && ./gradlew clean
cd .. && npx react-native run-android

# Error de Metro bundler
npx react-native start --reset-cache

# Error de permisos
chmod +x android/gradlew
```

---

## 🌟 **Características Técnicas Destacadas**

### **🔬 Implementación Avanzada de Haversine**
```typescript
// Cálculo preciso de distancias GPS
const haversineFormula = (coord1, coord2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lon - coord1.lon);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(coord1.lat)) * 
            Math.cos(toRadians(coord2.lat)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
            
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};
```

### **❄️ Sistema Crítico de Monitoreo**
```typescript
// Monitoreo automático de temperatura
const monitorColdChain = () => {
  setInterval(() => {
    if (temperature > -15) {
      triggerCriticalAlert();
      logIncidentToFirebase();
    }
  }, 30000); // Cada 30 segundos
};
```

---

## 📈 **Roadmap y Mejoras Futuras**

### **🔄 Próximas Funcionalidades**
- [ ] **Sistema de inventario** completo
- [ ] **Módulo de envíos** con tracking
- [ ] **Reportes PDF** de cadena de frío
- [ ] **Notificaciones push** en tiempo real
- [ ] **Modo offline** con sincronización
- [ ] **Exportación de datos** a Excel/CSV

### **⚡ Optimizaciones Técnicas**
- [ ] **Migración a React Native 0.73+**
- [ ] **Implementación de tests unitarios** (Jest)
- [ ] **CI/CD pipeline** con GitHub Actions
- [ ] **Performance optimization** con Flipper
- [ ] **Code splitting** para reducir bundle size

---

## 👨‍💻 **Información del Desarrollo**

### **Desarrollado para AIEP**
- **Propósito:** Taller de logística educativo
- **Enfoque:** Aplicación real para aprendizaje práctico
- **Tecnologías:** React Native + Firebase
- **Duración:** Desarrollo iterativo completo

### **Decisiones Técnicas Clave**
1. **React Native**: Multiplataforma con enfoque Android
2. **Firebase**: Backend completo sin servidor propio
3. **TypeScript**: Tipado fuerte para mejor mantenibilidad
4. **El Quisco**: Ubicación específica para contexto chileno
5. **Cadena de Frío**: Funcionalidad crítica real

---

## 📄 **Estado del Proyecto**

```
🔥 Estado:           ✅ COMPLETAMENTE FUNCIONAL
📱 Plataforma:       Android (React Native)
🏗️ Arquitectura:     Productiva y escalable
🔐 Seguridad:        Firebase Authentication + Database rules
📊 Base de Datos:    Firebase Realtime Database
🌍 Ubicación:        El Quisco, Chile (GPS fijo)
❄️ Cadena de Frío:   Sistema completo implementado
💰 Entregas:         Calculadora integrada funcional
```

### **Última Actualización**
- **Fecha:** Septiembre 2024
- **Versión:** 1.0.0
- **Estado:** ✅ Proyecto completo y operativo

---

**📧 Desarrollado por:** Kervin | **🎓 Institución:** AIEP | **📚 Materia:** Taller de Logística
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
