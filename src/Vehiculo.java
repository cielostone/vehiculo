// Vehiculo.java
// Programa de consola que solicita datos de un vehículo y los muestra.
// Requisitos: usar Scanner(System.in), variables String/int y System.out.println

import java.util.Scanner; // Importa la clase Scanner para leer desde teclado

public class Vehiculo { // Declara la clase pública Vehiculo
    public static void main(String[] args) { // Punto de entrada del programa
        Scanner sc = new Scanner(System.in); // Crea un lector de entrada estándar

        // Declaración de variables con tipos adecuados
        String marca;       // Marca del vehículo (texto)
        String modelo;      // Modelo del vehículo (texto)
        int cilindrada;     // Cilindrada (entero)
        String combustible; // Tipo de combustible (texto)
        int capacidad;      // Capacidad en pasajeros (entero)

        // Solicitar y leer datos
        System.out.print("Ingrese la marca: "); // Muestra prompt
        marca = sc.nextLine();                   // Lee la línea completa

        System.out.print("Ingrese el modelo: ");
        modelo = sc.nextLine();

        System.out.print("Ingrese la cilindrada: ");
        cilindrada = sc.nextInt();              // Lee entero para cilindrada
        sc.nextLine();                           // Limpia salto de línea pendiente

        System.out.print("Ingrese el tipo de combustible: ");
        combustible = sc.nextLine();

        System.out.print("Ingrese la capacidad de pasajeros: ");
        capacidad = sc.nextInt();               // Lee entero para capacidad

        // Salida de resultados
        System.out.println("La marca que ha ingresado es: " + marca);
        System.out.println("El modelo que ha ingresado es: " + modelo);
        System.out.println("La cilindrada que ha ingresado es: " + cilindrada);
        System.out.println("El tipo de combustible es: " + combustible);
        System.out.println("Tiene una capacidad de " + capacidad + " pasajeros.");

        sc.close(); // Cierra el scanner (buena práctica)
    } // Fin de main
} // Fin de clase Vehiculo
