# Taller de Logística App - Guía de Configuración Android

## 🚀 Configuración Rápida para Android

### Paso 1: Instalar Android Studio

1. Descarga Android Studio: https://developer.android.com/studio
2. Instala con configuración predeterminada
3. Abre Android Studio y completa la configuración inicial

### Paso 2: Configurar Variables de Entorno

Abre la terminal y ejecuta:

```bash
# Editar el archivo de configuración del shell
nano ~/.zshrc

# Agregar estas líneas al final del archivo:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Guardar y salir (Ctrl+X, luego Y, luego Enter)

# Recargar la configuración
source ~/.zshrc
```

### Paso 3: Crear Emulador Android

1. Abre Android Studio
2. Click en "More Actions" > "AVD Manager"
3. Click "Create Virtual Device"
4. Selecciona "Phone" > "Pixel 4" > "Next"
5. Selecciona "API 30" (Android 11) > "Next"
6. Deja configuración por defecto > "Finish"

### Paso 4: Ejecutar la Aplicación

```bash
# Terminal 1 - Iniciar Metro Bundler
cd /Users/kervin/Documents/proyectos/logistica/taller-app
npx react-native start

# Terminal 2 - Ejecutar en Android (después de iniciar el emulador)
npx react-native run-android
```

### Verificar Instalación

```bash
# Verificar que adb funciona
adb devices

# Verificar emuladores disponibles
emulator -list-avds
```

## 📱 Funcionalidades de la App

### Dashboard
- ✅ Estadísticas en tiempo real
- ✅ Progreso del usuario con barra visual
- ✅ Acciones rápidas
- ✅ Cards informativos con iconos Material Design

### Inventario
- ✅ Lista de productos con estados visuales
- ✅ Filtros por estado (disponible, stock bajo, agotado)
- ✅ Información de ubicación y categorías
- ✅ Resumen estadístico

### Estado Actual
- ✅ Navegación por tabs configurada
- ✅ Redux store con datos de ejemplo
- ✅ UI responsive para Android
- ⏳ Pantallas de Envíos y Actividades (en desarrollo)

## 🛠 Troubleshooting

### Error: "adb command not found"
```bash
# Verificar instalación de Android SDK
ls $ANDROID_HOME/platform-tools/adb
# Si no existe, reinstalar Android Studio
```

### Error: "No emulators found"
```bash
# Listar emuladores
emulator -list-avds
# Si está vacío, crear uno nuevo desde Android Studio
```

### Error Java Runtime
```bash
# Verificar Java
java -version
# Si no está instalado, instalar desde: https://adoptium.net/
```

## 📊 Datos de Demo

La app incluye datos de ejemplo para demostración:

- **3 productos** en inventario (cajas, etiquetas, pallets)
- **3 envíos** con diferentes estados
- **4 actividades** educativas
- **1 usuario** con progreso simulado

¡La aplicación está lista para usar en Android! 🎉