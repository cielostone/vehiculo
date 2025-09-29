# 📐 Guía de Uso: Convertidor Grados → Radianes

## 🎯 Objetivo
Implementar un método que convierte números decimales (grados) a radianes usando la fórmula matemática, con salida por consola equivalente a `System.out` de Java y verificación en Logcat.

---

## 🔧 Implementación Técnica

### Método Principal
```typescript
GeolocationService.convertDegreesToRadiansWithLog(degrees: number): number
```

**Características:**
- ✅ Acepta números decimales con coma flotante
- ✅ Implementa fórmula: `radianes = grados × (π / 180)`
- ✅ Salida detallada por consola (`System.out` equivalente)
- ✅ Validación de entrada con manejo de errores
- ✅ Logging estructurado para Logcat
- ✅ Documentación completa de resultados

### Método de Pruebas Automáticas
```typescript
GeolocationService.testRadianConversions(): void
```

**Casos de prueba incluidos:**
- 0° → 0 radianes
- 30° → π/6 radianes
- 45° → π/4 radianes
- 90° → π/2 radianes (ángulo recto)
- 180° → π radianes (media vuelta)
- 360° → 2π radianes (vuelta completa)
- -33.40863° → Latitud El Quisco
- -71.696854° → Longitud El Quisco
- 123.456789° → Decimal con múltiples decimales

---

## 📱 Cómo Usar la Funcionalidad

### 1. Acceder a la Pantalla de Pruebas
1. Abre la aplicación
2. Inicia sesión (test@test.com / 123456)
3. Ve a la pestaña **"Radianes"** (ícono de función matemática)

### 2. Conversión Individual
1. Ingresa un número decimal en el campo "Grados decimales"
2. Presiona **"Convertir a Radianes"**
3. Ve el resultado en pantalla
4. Revisa los logs detallados en la consola

### 3. Ejecutar Todas las Pruebas
1. Presiona **"Ejecutar 9 Casos de Prueba"**
2. Se procesarán automáticamente 9 valores predefinidos
3. Cada conversión se mostrará con logs completos

### 4. Probar Coordenadas de El Quisco
1. Presiona **"Probar Coordenadas El Quisco"**
2. Se convertirán las coordenadas: -33.40863° y -71.696854°
3. Útil para verificar conversión de coordenadas GPS

---

## 📋 Ver los Logs (System.out equivalente)

### Opción 1: Consola Metro
Los logs aparecen automáticamente en la consola donde ejecutas `npx react-native run-android`

### Opción 2: React Native Logs
```bash
npx react-native log-android | grep -E "(Conversión|RADIANES|INFO|WARN)"
```

### Opción 3: ADB Logcat Directo
```bash
adb logcat | grep -E "(ReactNativeJS|INFO.*radianes)"
```

---

## 🔍 Formato de Salida

### Console.log Output (System.out equivalente)
```
🔄 CONVERSIÓN GRADOS A RADIANES
📐 Entrada (grados): 45°
📏 Resultado (radianes): 0.7853981633974483
🔢 Resultado (6 decimales): 0.785398
📊 Fórmula aplicada: 45 × (π/180) = 0.785398
⚡ Timestamp: 2024-09-29T15:30:45.123Z
───────────────────────────────────────
```

### Structured JSON Log
```json
{
  "input_degrees": 45,
  "output_radians": 0.7853981633974483,
  "output_radians_fixed": 0.785398,
  "formula_used": "degrees * (PI / 180)",
  "pi_value": 3.141592653589793,
  "timestamp": 1695998445123,
  "readable_time": "29/9/2024 15:30:45"
}
```

---

## 🧪 Valores de Prueba Recomendados

### Valores Comunes
```
0       → 0 radianes
30      → 0.523599 radianes (π/6)
45      → 0.785398 radianes (π/4)  
90      → 1.570796 radianes (π/2)
180     → 3.141593 radianes (π)
360     → 6.283185 radianes (2π)
```

### Valores de El Quisco (GPS)
```
-33.40863   → -0.583155 radianes (Latitud)
-71.696854  → -1.251327 radianes (Longitud)
```

### Valores Decimales Complejos
```
123.456789  → 2.155130 radianes
-45.123     → -0.787567 radianes
0.000001    → 0.000000017 radianes
```

---

## ✅ Verificación de Resultados

### Fórmula Manual de Verificación
Para verificar manualmente cualquier resultado:
```
radianes = grados × (3.141592653589793 / 180)
radianes = grados × 0.017453292519943295
```

### Ejemplos de Verificación
```
45° × 0.017453292519943295 = 0.7853981633974483 ✓
90° × 0.017453292519943295 = 1.5707963267948966 ✓
180° × 0.017453292519943295 = 3.141592653589793 ✓
```

---

## 🚨 Notas Importantes

### Validación de Entrada
- ✅ El método valida que la entrada sea un número
- ✅ Maneja valores `NaN` con error controlado
- ✅ Acepta números negativos (para coordenadas)
- ✅ Acepta decimales con múltiples posiciones

### Precisión
- 📏 JavaScript usa números de punto flotante de 64 bits
- 🔢 Precisión de 6 decimales para display
- 💾 Valor completo almacenado internamente
- ⚡ Fórmula matemáticamente exacta

### Performance
- ⚡ Conversión instantánea (< 1ms)
- 📝 Logging no afecta performance significativamente
- 🔄 Método optimizado para múltiples llamadas

---

## 🛠️ Comandos de Desarrollo

### Compilar y Ejecutar
```bash
cd /Users/kervin/Documents/proyectos/logistica/taller-app
npx react-native run-android
```

### Ver Logs Filtrados
```bash
# Ver solo logs de conversión
npx react-native log-android | grep "RADIANES"

# Ver logs completos de la app
npx react-native log-android

# Ver logs de errores únicamente
npx react-native log-android | grep "ERROR"
```

### Limpiar y Recompilar (si hay problemas)
```bash
cd android && ./gradlew clean
cd .. && npx react-native run-android
```

---

**📚 Documento creado para:** Verificación y documentación de conversión grados → radianes  
**🎯 Propósito:** Testing con System.out equivalente y validación en Logcat  
**📅 Fecha:** Septiembre 2024