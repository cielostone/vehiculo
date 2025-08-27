# Semana 3 (Java sin IDE)

**Alumno:** Cielo Stone
**Módulo:** PRO401-9525-225081-ONL-TALLER DE APLICACIONES MÓVILES 
**Semana:** 3

---

## Introducción
En este trabajo desarrollé un programa en **Java**, compilado y ejecutado directamente desde la **terminal**, sin usar un IDE.  
La idea era reforzar cómo funciona el ciclo: **escribir código → compilar con javac → ejecutar en la JVM**, además de entender conceptos como compilador, bytecode y la máquina virtual de Java.  
El programa simula un **inicio de sesión** (nombre y edad) y luego pide datos de un vehículo. Al final muestra un bloque de salida con toda la información.

---

## Desarrollo paso a paso

### 1. Crear el archivo
- Abrí la terminal y me ubiqué en la carpeta `src`.
- Creé el archivo `SesionUsuarioVehiculo.java`.

### 2. Escribir el código
- Usé la clase `Scanner` para leer datos del usuario.
- El programa primero pide **nombre y edad** → simula un inicio de sesión.
- Después solicita **marca, modelo, cilindrada, combustible y capacidad de pasajeros** del vehículo.
- Al final, muestra los datos con un formato claro en pantalla.

### 3. Compilar y ejecutar
```bash
javac SesionUsuarioVehiculo.java
java SesionUsuarioVehiculo
```

### 4. Ejemplo de salida
```
===== INICIO DE SESIÓN =====
Ingrese su nombre de usuario: Cielo
Ingrese su edad: 24

¡Bienvenido/a Cielo! Sesión iniciada correctamente.

===== INGRESO DE DATOS DEL VEHÍCULO =====
Ingrese la marca: Kia
Ingrese el modelo: Sonet
Ingrese la cilindrada (ej: 1.5): 1.5
Ingrese el tipo de combustible: Bencina
Ingrese la capacidad de pasajeros: 5

===== DATOS DE SALIDA =====
Usuario: Cielo | Edad: 24 años
La marca que ha ingresado es: Kia
El modelo que ha ingresado es: Sonet
La cilindrada que ha ingresado es: 1.5
El tipo de combustible es: Bencina
Tiene una capacidad de 5 pasajeros.

Sesión finalizada. ¡Gracias por usar el sistema, Cielo!
```

---

## Conceptos repasados
- **Compilador (`javac`)**: transforma el código fuente `.java` en bytecode `.class`.
- **JVM**: ejecuta bytecode en cualquier computador con Java → portabilidad.
- **Dalvik/ART (Android)**: Dalvik fue reemplazado por ART en Android 5, lo que mejoró la velocidad de ejecución gracias a compilación AOT.

---

## Conclusión
El ejercicio me ayudó a comprender cómo funciona el proceso real de compilación en Java sin depender de un IDE.  
También me permitió practicar el uso de `Scanner`, la importancia de limpiar el buffer entre `nextInt()` y `nextLine()`, y ver cómo un simple programa puede simular un flujo de usuario.  
Además, la práctica de documentar en GitHub con cronograma e historias de usuario aporta orden y una idea clara de cómo se gestionan proyectos de software.

---

## Bibliografía
- Oracle. (s.f.). *Java SE Development Kit Documentation*. https://docs.oracle.com/en/java/  
- Android Developers. (s.f.). *ART and Dalvik*. https://developer.android.com  
