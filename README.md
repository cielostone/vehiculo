# Taller de Aplicaciones Móviles – Semana 3

Este repo es mi entrega de la **semana 3** (Java **sin IDE**).  
El programa principal simula **inicio de sesión** (nombre y edad) y luego pide **datos de un vehículo**.  
Al final, muestra todo en un **resumen** y cierra la sesión.

---

## Lo que hice (paso a paso)

1) Abrí la **Terminal** en mi Mac.  
2) Creé el archivo `SesionUsuarioVehiculo.java` y programé con `Scanner` para leer teclado.  
3) Compilé:
```bash
cd src
javac SesionUsuarioVehiculo.java
```
4) Ejecuté:
```bash
java SesionUsuarioVehiculo
```
5) Ingresé los datos que pide la pauta (usuario + vehículo).  
6) Revisé que el bloque de **Datos de Salida** muestre exactamente lo solicitado.

---

## Ejecución principal
```bash
cd src
javac SesionUsuarioVehiculo.java
java SesionUsuarioVehiculo
```

**Ejemplo de salida:**
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

## Estructura
```
.
├── README.md
├── .gitignore
├── src
│   ├── SesionUsuarioVehiculo.java   # Programa oficial (principal)
│   ├── Vehiculo.java                # Versión solo vehículo (referencia)
│   └── DatosPersonales.java         # Versión solo usuario (referencia)
└── docs
    ├── INFORME.md
    ├── USER_STORIES.md
    └── CRONOGRAMA.md
```

---

## Requisitos cumplidos
- Código en **Java** que **pide datos por teclado** y **muestra resultados**.  
- **Compilación y ejecución por consola** (sin IDE).  
- **Documento** con teoría y paso a paso.  
- **Historias de Usuario** y **Cronograma** (GitHub Projects).

> Última revisión: 2025-08-27
